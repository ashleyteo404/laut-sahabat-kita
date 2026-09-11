import 'server-only'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { enSource, type ActionMessageKey } from '@/lib/i18n/dictionaries/en'
import { createClient } from '@/lib/supabase/server'

const submissionSchema = z.object({
  activityId: z.string().min(1),
  clientSubmissionId: z.uuid(),
  studentId: z.uuid(),
  reflection: z.string().trim().min(10).max(2000),
})

export interface SubmissionProcessingResult {
  ok: boolean
  status: number
  /** The queue stores this and renders it later, so the reader's language wins, not the uploader's. */
  messageKey: ActionMessageKey
  /** English fallback for the service worker, logs, and any non-UI consumer. */
  message: string
}

function outcome(
  ok: boolean,
  status: number,
  messageKey: ActionMessageKey,
): SubmissionProcessingResult {
  return { ok, status, messageKey, message: enSource[messageKey] }
}

function failure(status: number, messageKey: ActionMessageKey): SubmissionProcessingResult {
  return outcome(false, status, messageKey)
}

function isDuplicateStorageObject(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const record = error as { message?: string; statusCode?: string | number }
  return Number(record.statusCode) === 409 || /already exists|duplicate/i.test(record.message ?? '')
}

export async function processActivitySubmission(
  formData: FormData,
): Promise<SubmissionProcessingResult> {
  const parsed = submissionSchema.safeParse({
    activityId: formData.get('activityId'),
    clientSubmissionId: formData.get('clientSubmissionId'),
    studentId: formData.get('studentId'),
    reflection: formData.get('reflection'),
  })

  if (!parsed.success) {
    return failure(
      400,
      parsed.error.issues[0]?.path[0] === 'reflection'
        ? 'action.submission.reflectionTooShort'
        : 'action.submission.invalid',
    )
  }

  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const authenticatedStudentId = claimsData?.claims?.sub
  if (claimsError || !authenticatedStudentId) {
    return failure(401, 'action.submission.signInAgain')
  }
  if (authenticatedStudentId !== parsed.data.studentId) {
    return failure(403, 'action.submission.wrongAccount')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', authenticatedStudentId)
    .single()
  if (!profile || profile.role !== 'student') {
    return failure(403, 'action.submission.studentsOnly')
  }

  const { data: activity, error: activityError } = await supabase
    .from('activities')
    .select('id, mode')
    .eq('id', parsed.data.activityId)
    .eq('published', true)
    .single()
  if (activityError || !activity) return failure(404, 'action.submission.activityNotFound')

  const { data: existing, error: existingError } = await supabase
    .from('submissions')
    .select('id, status')
    .eq('student_id', authenticatedStudentId)
    .eq('client_submission_id', parsed.data.clientSubmissionId)
    .maybeSingle()

  if (existingError) {
    return failure(
      500,
      existingError.code === '42703' || existingError.code === 'PGRST204'
        ? 'action.submission.migrationRequired'
        : 'action.submission.lookupFailed',
    )
  }
  if (existing) {
    return outcome(
      true,
      200,
      existing.status === 'pending'
        ? 'action.submission.alreadySent'
        : 'action.submission.alreadyUploaded',
    )
  }

  const { data: activeSubmission, error: activeError } = await supabase
    .from('submissions')
    .select('id')
    .eq('student_id', authenticatedStudentId)
    .eq('activity_id', activity.id)
    .in('status', ['pending', 'approved'])
    .limit(1)
    .maybeSingle()
  if (activeError) return failure(500, 'action.submission.lookupFailed')
  if (activeSubmission) {
    return outcome(true, 200, 'action.submission.alreadySubmitted')
  }

  const photo = formData.get('photo')
  if (activity.mode === 'field' && (!(photo instanceof File) || photo.size === 0)) {
    return failure(400, 'action.submission.photoRequired')
  }
  if (photo instanceof File && photo.size > 3 * 1024 * 1024) {
    return failure(400, 'action.submission.photoTooLarge')
  }
  if (
    photo instanceof File &&
    photo.size > 0 &&
    !['image/jpeg', 'image/png', 'image/webp'].includes(photo.type)
  ) {
    return failure(400, 'action.submission.photoWrongType')
  }

  let evidencePath: string | null = null
  let uploadedEvidence = false
  if (photo instanceof File && photo.size > 0) {
    const extensionByType: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    }
    evidencePath = `${authenticatedStudentId}/${parsed.data.clientSubmissionId}.${extensionByType[photo.type] ?? 'jpg'}`
    const { error: uploadError } = await supabase.storage
      .from('evidence')
      .upload(evidencePath, photo, {
        contentType: photo.type,
        cacheControl: '3600',
        upsert: false,
      })
    if (uploadError && !isDuplicateStorageObject(uploadError)) {
      return failure(502, 'action.submission.uploadFailed')
    }
    uploadedEvidence = !uploadError
  }

  const { error: insertError } = await supabase.from('submissions').insert({
    student_id: authenticatedStudentId,
    activity_id: activity.id,
    client_submission_id: parsed.data.clientSubmissionId,
    reflection: parsed.data.reflection,
    evidence_path: evidencePath,
  })

  if (insertError) {
    const { data: completedRetry } = await supabase
      .from('submissions')
      .select('id')
      .eq('student_id', authenticatedStudentId)
      .eq('client_submission_id', parsed.data.clientSubmissionId)
      .maybeSingle()
    if (completedRetry) {
      return outcome(true, 200, 'action.submission.uploaded')
    }
    const { data: completedElsewhere } = await supabase
      .from('submissions')
      .select('id')
      .eq('student_id', authenticatedStudentId)
      .eq('activity_id', activity.id)
      .in('status', ['pending', 'approved'])
      .limit(1)
      .maybeSingle()
    if (completedElsewhere) {
      if (uploadedEvidence && evidencePath) {
        await supabase.storage.from('evidence').remove([evidencePath])
      }
      return outcome(true, 200, 'action.submission.alreadySubmitted')
    }
    if (uploadedEvidence && evidencePath) {
      await supabase.storage.from('evidence').remove([evidencePath])
    }
    return failure(409, 'action.submission.saveFailed')
  }

  revalidatePath('/dashboard')
  revalidatePath('/explore')
  revalidatePath('/journal')
  revalidatePath('/badges')
  return outcome(
    true,
    200,
    activity.mode === 'field' ? 'action.submission.sentForReview' : 'action.submission.completed',
  )
}

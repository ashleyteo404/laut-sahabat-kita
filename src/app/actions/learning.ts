'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { ActionMessageKey } from '@/lib/i18n/dictionaries/en'
import type { ActionState } from '@/lib/types'

const reviewSchema = z
  .object({
    submissionId: z.uuid(),
    decision: z.enum(['approve', 'return']),
    note: z.string().trim().max(500).optional(),
  })
  .refine((value) => value.decision !== 'return' || Boolean(value.note), { path: ['note'] })

export async function reviewSubmissionAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireProfile(['teacher', 'jari_admin'])
  const parsed = reviewSchema.safeParse({
    submissionId: formData.get('submissionId'),
    decision: formData.get('decision'),
    note: formData.get('note') || undefined,
  })

  if (!parsed.success) {
    return {
      status: 'error',
      messageKey:
        parsed.error.issues[0]?.path[0] === 'note'
          ? 'action.review.noteRequired'
          : 'action.review.invalid',
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('review_submission', {
    p_submission_id: parsed.data.submissionId,
    p_approve: parsed.data.decision === 'approve',
    p_note: parsed.data.note ?? null,
  })

  if (error) return { status: 'error', messageKey: 'action.review.failed' }

  revalidatePath('/dashboard')
  revalidatePath('/review')
  revalidatePath('/students')
  return {
    status: 'success',
    messageKey:
      parsed.data.decision === 'approve' ? 'action.review.approved' : 'action.review.returned',
  }
}

const sessionSchema = z.object({
  title: z.string().trim().min(3).max(120),
  sessionType: z.enum(['online', 'classroom', 'field', 'community']),
  occurredOn: z.iso.date(),
  durationMinutes: z.coerce.number().int().min(5).max(600),
  islandId: z.string().trim().optional(),
  habitat: z.string().trim().max(120).optional(),
  teacherReflection: z.string().trim().max(2000).optional(),
  fieldObservation: z.string().trim().max(2000).optional(),
  studentIds: z.array(z.uuid()).max(200),
})

function sessionMessageKey(error: z.ZodError): ActionMessageKey {
  const field = error.issues[0]?.path[0]
  if (field === 'title') return 'action.session.titleTooShort'
  if (field === 'durationMinutes') return 'action.session.durationInvalid'
  return 'action.session.invalid'
}

export async function createLearningSessionAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireProfile(['teacher', 'jari_admin'])
  const parsed = sessionSchema.safeParse({
    title: formData.get('title'),
    sessionType: formData.get('sessionType'),
    occurredOn: formData.get('occurredOn'),
    durationMinutes: formData.get('durationMinutes'),
    islandId: formData.get('islandId') || undefined,
    habitat: formData.get('habitat') || undefined,
    teacherReflection: formData.get('teacherReflection') || undefined,
    fieldObservation: formData.get('fieldObservation') || undefined,
    studentIds: formData.getAll('studentIds'),
  })

  if (!parsed.success) {
    return { status: 'error', messageKey: sessionMessageKey(parsed.error) }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('create_learning_session', {
    p_title: parsed.data.title,
    p_session_type: parsed.data.sessionType,
    p_occurred_on: parsed.data.occurredOn,
    p_duration_minutes: parsed.data.durationMinutes,
    p_island_id: parsed.data.islandId ?? null,
    p_habitat: parsed.data.habitat ?? null,
    p_teacher_reflection: parsed.data.teacherReflection ?? null,
    p_field_observation: parsed.data.fieldObservation ?? null,
    p_student_ids: parsed.data.studentIds,
  })

  if (error) {
    return {
      status: 'error',
      messageKey:
        error.code === 'PGRST202' ? 'action.session.migrationRequired' : 'action.session.failed',
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/sessions')
  revalidatePath('/students')
  revalidatePath('/programme')
  return { status: 'success', messageKey: 'action.session.saved' }
}

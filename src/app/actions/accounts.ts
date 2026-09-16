'use server'

import { revalidatePath } from 'next/cache'
import { requireProfile } from '@/lib/auth'
import {
  createStudentAccounts,
  deleteStudent,
  resetStudentPin,
  submittedRowsSchema,
  updateStudentDetails,
} from '@/lib/accounts/server'
import type { ActionState, CreateStudentsState, ResetPinState } from '@/lib/types'

// Every action re-authorizes. A Server Action is a public POST endpoint, so only rendering the form
// for staff is not a security boundary.

export async function createStudentsAction(
  _previousState: CreateStudentsState,
  formData: FormData,
): Promise<CreateStudentsState> {
  const actor = await requireProfile(['teacher', 'jari_admin'])

  let rows: unknown = null
  try {
    rows = JSON.parse(String(formData.get('rows') ?? '[]'))
  } catch {
    rows = null
  }
  const parsed = submittedRowsSchema.safeParse(rows)
  if (!parsed.success) {
    return {
      status: 'error',
      messageKey: 'action.accounts.invalidRows',
      created: [],
      problems: [],
      completed: false,
    }
  }

  const result = await createStudentAccounts(actor, {
    schoolId: formData.get('schoolId'),
    rows: parsed.data,
  })

  if (result.created.length > 0) {
    revalidatePath('/students')
    revalidatePath('/dashboard')
    revalidatePath('/programme')
  }
  return result
}

export async function resetStudentPinAction(
  _previousState: ResetPinState,
  formData: FormData,
): Promise<ResetPinState> {
  const actor = await requireProfile(['teacher', 'jari_admin'])
  return resetStudentPin(actor, formData.get('studentId'))
}

export async function updateStudentAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireProfile(['teacher', 'jari_admin'])
  const result = await updateStudentDetails(actor, {
    studentId: formData.get('studentId'),
    fullName: String(formData.get('fullName') ?? ''),
    grade: String(formData.get('grade') ?? ''),
  })

  if (result.status === 'success') {
    revalidatePath('/students')
    revalidatePath('/dashboard')
    revalidatePath('/review')
  }
  return result
}

export async function deleteStudentAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireProfile(['teacher', 'jari_admin'])
  const result = await deleteStudent(actor, formData.get('studentId'))

  if (result.status === 'success') {
    revalidatePath('/students')
    revalidatePath('/dashboard')
    revalidatePath('/programme')
  }
  return result
}

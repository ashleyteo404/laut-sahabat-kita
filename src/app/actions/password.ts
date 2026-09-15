'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { STUDENT_EMAIL_DOMAIN } from '@/lib/accounts/credentials'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { ActionMessageKey } from '@/lib/i18n/dictionaries/en'
import type { ActionState } from '@/lib/types'

const MIN_PASSWORD_LENGTH = 8
/** Supabase Auth hashes passwords with bcrypt, which ignores input beyond 72 bytes. */
const MAX_PASSWORD_LENGTH = 72

function fail(messageKey: ActionMessageKey): ActionState {
  return { status: 'error', messageKey }
}

/**
 * The origin the reset link should return to. Server Actions already reject requests whose Origin
 * does not match the Host, and Supabase only redirects to URLs on the project's allow list.
 */
async function requestOrigin(): Promise<string | null> {
  const headerList = await headers()
  const origin = headerList.get('origin')
  if (origin) return origin

  const host = headerList.get('x-forwarded-host') ?? headerList.get('host')
  if (!host) return null
  return `${headerList.get('x-forwarded-proto') ?? 'https'}://${host}`
}

/**
 * Staff password recovery by email. The response is the same whether or not an account exists, so
 * the form cannot be used to discover who has one.
 */
export async function requestPasswordResetAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identifier = String(formData.get('email') ?? '').trim()
  if (identifier && !identifier.includes('@')) return fail('action.forgot.studentAccount')

  const parsed = z.email().safeParse(identifier)
  if (!parsed.success) return fail('action.forgot.invalidEmail')
  const email = parsed.data.toLowerCase()

  // Student logins use placeholder addresses that can never receive mail; a teacher resets their PIN.
  if (email.endsWith(`@${STUDENT_EMAIL_DOMAIN}`)) return fail('action.forgot.studentAccount')

  const origin = await requestOrigin()
  if (!origin) return fail('action.forgot.failed')

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm`,
  })

  if (error) {
    if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
      return fail('action.forgot.tooManyRequests')
    }
    return fail('action.forgot.failed')
  }

  return { status: 'success', messageKey: 'action.forgot.sent' }
}

export async function updatePasswordAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Reached through a recovery session or an ordinary one. Students manage PINs through a teacher.
  await requireProfile(['teacher', 'jari_admin'])

  const password = String(formData.get('password') ?? '')
  const confirmation = String(formData.get('confirmPassword') ?? '')
  if (password.length < MIN_PASSWORD_LENGTH) return fail('action.reset.tooShort')
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_LENGTH) {
    return fail('action.reset.tooLong')
  }
  if (password !== confirmation) return fail('action.reset.mismatch')

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    if (error.code === 'same_password') return fail('action.reset.samePassword')
    if (error.code === 'weak_password') return fail('action.reset.weak')
    return fail('action.reset.failed')
  }

  // Whoever triggered the reset may not be the only one holding a session; end the others.
  await supabase.auth.signOut({ scope: 'others' })
  redirect('/dashboard')
}

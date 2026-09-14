'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { isValidUsername, normalizeUsername, studentEmailFor } from '@/lib/accounts/credentials'
import { createClient } from '@/lib/supabase/server'
import type { ActionMessageKey } from '@/lib/i18n/dictionaries/en'
import type { ActionState } from '@/lib/types'

const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(254),
  password: z.string().min(6),
})

/**
 * Supabase Auth returns English prose. Mapping the small set of codes we can act on keeps the
 * message translatable and stops backend text reaching the sign-in form verbatim.
 */
const loginErrorKeys: Record<string, ActionMessageKey> = {
  invalid_credentials: 'action.login.invalidCredentials',
  email_not_confirmed: 'action.login.emailNotConfirmed',
  over_request_rate_limit: 'action.login.tooManyAttempts',
}

/**
 * Staff sign in with an email address; students with a username, which maps deterministically to
 * their placeholder login address. No profile lookup is needed or possible before sign-in.
 */
function resolveLoginEmail(
  identifier: string,
): { email: string } | { messageKey: ActionMessageKey } {
  if (identifier.includes('@')) {
    const parsed = z.email().safeParse(identifier)
    return parsed.success ? { email: parsed.data } : { messageKey: 'action.login.invalidEmail' }
  }

  const username = normalizeUsername(identifier)
  return isValidUsername(username)
    ? { email: studentEmailFor(username) }
    : { messageKey: 'action.login.invalidUsername' }
}

export async function loginAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get('identifier'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return {
      status: 'error',
      messageKey:
        parsed.error.issues[0]?.path[0] === 'password'
          ? 'action.login.passwordTooShort'
          : 'action.login.invalidIdentifier',
    }
  }

  const login = resolveLoginEmail(parsed.data.identifier)
  if ('messageKey' in login) return { status: 'error', messageKey: login.messageKey }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: login.email,
    password: parsed.data.password,
  })
  if (error) {
    return {
      status: 'error',
      messageKey: (error.code && loginErrorKeys[error.code]) ?? 'action.login.failed',
    }
  }

  redirect('/dashboard')
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

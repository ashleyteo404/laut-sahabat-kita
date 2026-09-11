'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ActionMessageKey } from '@/lib/i18n/dictionaries/en'
import type { ActionState } from '@/lib/types'

const loginSchema = z.object({
  email: z.email(),
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

export async function loginAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return {
      status: 'error',
      messageKey:
        parsed.error.issues[0]?.path[0] === 'password'
          ? 'action.login.passwordTooShort'
          : 'action.login.invalidEmail',
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
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

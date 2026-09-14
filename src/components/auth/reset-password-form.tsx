'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { updatePasswordAction } from '@/app/actions/password'
import { useActionMessage, useT } from '@/lib/i18n/client'
import type { ActionState } from '@/lib/types'

const initialState: ActionState = { status: 'idle' }

function SubmitButton() {
  const { pending } = useFormStatus()
  const t = useT()
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? t('reset.submitPending') : t('reset.submit')}
    </button>
  )
}

export function ResetPasswordForm({ email }: { email: string | null }) {
  const [state, action] = useActionState(updatePasswordAction, initialState)
  const t = useT()
  const actionMessage = useActionMessage()

  return (
    <form className="auth-form" action={action}>
      <span className="eyebrow">{t('reset.eyebrow')}</span>
      <h2>{t('reset.heading')}</h2>
      <p>{t('reset.intro')}</p>
      <div className="form-error" role="alert">
        {state.status === 'error' ? actionMessage(state.messageKey, state.messageValues) : ''}
      </div>
      {/* Lets password managers attach the new password to the right account. */}
      {email ? (
        <input type="text" name="username" autoComplete="username" value={email} readOnly hidden />
      ) : null}
      <div className="field">
        <label htmlFor="new-password">{t('reset.passwordLabel')}</label>
        <input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
        />
      </div>
      <div className="field">
        <label htmlFor="confirm-password">{t('reset.confirmLabel')}</label>
        <input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
        />
      </div>
      <SubmitButton />
    </form>
  )
}

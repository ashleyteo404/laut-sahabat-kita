'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { requestPasswordResetAction } from '@/app/actions/password'
import { useActionMessage, useT } from '@/lib/i18n/client'
import type { ActionState } from '@/lib/types'

const initialState: ActionState = { status: 'idle' }

function SubmitButton() {
  const { pending } = useFormStatus()
  const t = useT()
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? t('forgot.submitPending') : t('forgot.submit')}
    </button>
  )
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordResetAction, initialState)
  const t = useT()
  const actionMessage = useActionMessage()

  return (
    <form className="auth-form" action={action}>
      <span className="eyebrow">{t('forgot.eyebrow')}</span>
      <h2>{t('forgot.heading')}</h2>
      <p>{t('forgot.intro')}</p>
      {state.status === 'success' ? (
        <div className="form-success" role="status">
          {actionMessage(state.messageKey, state.messageValues)}
        </div>
      ) : (
        <div className="form-error" role="alert">
          {state.status === 'error' ? actionMessage(state.messageKey, state.messageValues) : ''}
        </div>
      )}
      <div className="field">
        <label htmlFor="reset-email">{t('forgot.emailLabel')}</label>
        <input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          placeholder={t('forgot.emailPlaceholder')}
        />
      </div>
      <SubmitButton />
      <small>{t('forgot.studentNote')}</small>
      <Link className="text-btn auth-back" href="/login">
        {t('forgot.backToLogin')}
      </Link>
    </form>
  )
}

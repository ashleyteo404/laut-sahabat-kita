'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { loginAction } from '@/app/actions/auth'
import { useActionMessage, useT } from '@/lib/i18n/client'
import type { ActionState } from '@/lib/types'

const initialState: ActionState = { status: 'idle' }

function SubmitButton() {
  const { pending } = useFormStatus()
  const t = useT()
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? t('login.submitPending') : t('login.submit')}
    </button>
  )
}

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialState)
  const t = useT()
  const actionMessage = useActionMessage()

  return (
    <form className="auth-form" action={action}>
      <span className="eyebrow">{t('login.eyebrow')}</span>
      <h2>{t('login.heading')}</h2>
      <p>{t('login.intro')}</p>
      <div className="form-error" role="alert">
        {state.status === 'error' ? actionMessage(state.messageKey, state.messageValues) : ''}
      </div>
      <div className="field">
        <label htmlFor="email">{t('login.emailLabel')}</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t('login.emailPlaceholder')}
        />
      </div>
      <div className="field">
        <label htmlFor="password">{t('login.passwordLabel')}</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          placeholder={t('login.passwordPlaceholder')}
        />
      </div>
      <SubmitButton />
      <small>{t('login.footnote')}</small>
    </form>
  )
}

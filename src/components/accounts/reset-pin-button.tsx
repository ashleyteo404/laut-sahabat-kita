'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { resetStudentPinAction } from '@/app/actions/accounts'
import { useActionMessage, useT } from '@/lib/i18n/client'
import type { ResetPinState } from '@/lib/types'

const initialState: ResetPinState = { status: 'idle' }

function ResetButton({ studentName }: { studentName: string }) {
  const { pending } = useFormStatus()
  const t = useT()
  return (
    <button
      className="btn outline sm"
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(t('accounts.reset.confirm', { name: studentName }))) {
          event.preventDefault()
        }
      }}
    >
      {pending ? t('accounts.reset.pending') : t('accounts.reset.button')}
    </button>
  )
}

export function ResetPinButton({
  studentId,
  studentName,
}: {
  studentId: string
  studentName: string
}) {
  const [state, action] = useActionState(resetStudentPinAction, initialState)
  const t = useT()
  const actionMessage = useActionMessage()

  return (
    <form action={action} className="reset-pin">
      <input type="hidden" name="studentId" value={studentId} />
      {state.status === 'success' && state.pin ? (
        // Shown once: the button is hidden so a second click cannot silently replace this PIN.
        <span className="pin-reveal" role="status">
          {t('accounts.reset.newPin')}: <strong className="credential">{state.pin}</strong>
          <small>{t('accounts.reset.shownOnce')}</small>
        </span>
      ) : (
        <ResetButton studentName={studentName} />
      )}
      {state.status === 'error' ? (
        <small className="form-error">{actionMessage(state.messageKey, state.messageValues)}</small>
      ) : null}
    </form>
  )
}

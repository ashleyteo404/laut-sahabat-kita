'use client'

import { useActionState, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { resetStudentPinAction } from '@/app/actions/accounts'
import { useActionMessage, useT } from '@/lib/i18n/client'
import type { ResetPinState } from '@/lib/types'

const initialState: ResetPinState = { status: 'idle' }

function ConfirmResetButton() {
  const { pending } = useFormStatus()
  const t = useT()
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? t('accounts.reset.pending') : t('accounts.reset.confirmButton')}
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
  const dialog = useRef<HTMLDialogElement>(null)
  const newPin = state.status === 'success' ? state.pin : null

  return (
    <div className="reset-pin">
      <button className="btn outline sm" type="button" onClick={() => dialog.current?.showModal()}>
        {t('accounts.reset.button')}
      </button>

      {/* Kept beside the row as well, so closing the dialog does not lose a PIN shown only once. */}
      {newPin ? (
        <span className="pin-reveal" role="status">
          {t('accounts.reset.newPin')}: <strong className="credential">{newPin}</strong>
          <small>{t('accounts.reset.shownOnce')}</small>
        </span>
      ) : null}
      {state.status === 'error' ? (
        <small className="form-error" role="alert">
          {actionMessage(state.messageKey, state.messageValues)}
        </small>
      ) : null}

      <dialog
        className="student-dialog"
        ref={dialog}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close()
        }}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">{t('accounts.reset.button')}</span>
            <h2>{t('accounts.reset.title', { name: studentName })}</h2>
          </div>
          <button
            className="close"
            type="button"
            aria-label={t('accounts.close')}
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {newPin ? (
            <>
              <p>{t('accounts.reset.doneBody')}</p>
              <p className="pin-display">
                <span>{t('accounts.reset.newPin')}</span>
                <strong className="credential">{newPin}</strong>
              </p>
              <p className="results-warning">{t('accounts.reset.shownOnce')}</p>
              <div className="modal-actions">
                <button className="btn" type="button" onClick={() => dialog.current?.close()}>
                  {t('accounts.close')}
                </button>
              </div>
            </>
          ) : (
            <>
              <p>{t('accounts.reset.body')}</p>
              <form action={action}>
                <input type="hidden" name="studentId" value={studentId} />
                {state.status === 'error' ? (
                  <p className="form-error" role="alert">
                    {actionMessage(state.messageKey, state.messageValues)}
                  </p>
                ) : null}
                <div className="modal-actions">
                  <button
                    className="btn outline"
                    type="button"
                    onClick={() => dialog.current?.close()}
                  >
                    {t('accounts.cancel')}
                  </button>
                  <ConfirmResetButton />
                </div>
              </form>
            </>
          )}
        </div>
      </dialog>
    </div>
  )
}

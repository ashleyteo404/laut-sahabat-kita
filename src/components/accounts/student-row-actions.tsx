'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { deleteStudentAction, updateStudentAction } from '@/app/actions/accounts'
import { MAX_FULL_NAME_LENGTH, MAX_GRADE_LENGTH } from '@/lib/accounts/credentials'
import { useActionMessage, useT } from '@/lib/i18n/client'
import type { ActionState } from '@/lib/types'

const initialState: ActionState = { status: 'idle' }

function SaveButton() {
  const { pending } = useFormStatus()
  const t = useT()
  return (
    <button className="btn sm" type="submit" disabled={pending}>
      {pending ? t('accounts.edit.saving') : t('accounts.edit.save')}
    </button>
  )
}

/** Icon-only, so the label lives in `aria-label` and `title` for screen readers and hover. */
function DeleteButton({ studentName }: { studentName: string }) {
  const { pending } = useFormStatus()
  const t = useT()
  const label = pending ? t('accounts.delete.pending') : t('accounts.delete.button')
  return (
    <button
      className="icon-btn danger"
      type="submit"
      disabled={pending}
      aria-label={label}
      title={label}
      onClick={(event) => {
        if (!window.confirm(t('accounts.delete.confirm', { name: studentName }))) {
          event.preventDefault()
        }
      }}
    >
      <Trash2 aria-hidden="true" size={15} />
    </button>
  )
}

/**
 * Correcting a mistyped name or grade, and removing an account created by mistake.
 *
 * `canDelete` only decides what is offered; the server re-checks that the student has no work, so a
 * stale page cannot delete a record.
 */
export function StudentRowActions({
  student,
  canDelete,
}: {
  student: { id: string; fullName: string; grade: string | null }
  canDelete: boolean
}) {
  const t = useT()
  const actionMessage = useActionMessage()
  const [editing, setEditing] = useState(false)
  const [updateState, updateAction] = useActionState(updateStudentAction, initialState)
  const [deleteState, deleteAction] = useActionState(deleteStudentAction, initialState)

  return (
    <div className="row-actions">
      {editing ? (
        <form action={updateAction} className="inline-edit">
          <input type="hidden" name="studentId" value={student.id} />
          <label>
            <span>{t('accounts.col.fullName')}</span>
            <input
              name="fullName"
              type="text"
              defaultValue={student.fullName}
              required
              maxLength={MAX_FULL_NAME_LENGTH}
              autoComplete="off"
            />
          </label>
          <label>
            <span>{t('accounts.col.grade')}</span>
            <input
              name="grade"
              type="text"
              defaultValue={student.grade ?? ''}
              maxLength={MAX_GRADE_LENGTH}
              autoComplete="off"
            />
          </label>
          <div className="inline-edit-actions">
            <SaveButton />
            <button className="btn outline sm" type="button" onClick={() => setEditing(false)}>
              {t('accounts.edit.close')}
            </button>
          </div>
          {updateState.status !== 'idle' ? (
            <small
              className={updateState.status === 'error' ? 'form-error' : 'form-success'}
              role="status"
            >
              {actionMessage(updateState.messageKey, updateState.messageValues)}
            </small>
          ) : null}
        </form>
      ) : null}

      <div className="row-action-buttons">
        {editing ? null : (
          <button
            className="icon-btn"
            type="button"
            aria-label={t('accounts.edit.button')}
            title={t('accounts.edit.button')}
            onClick={() => setEditing(true)}
          >
            <Pencil aria-hidden="true" size={15} />
          </button>
        )}

        {canDelete ? (
          <form action={deleteAction}>
            <input type="hidden" name="studentId" value={student.id} />
            <DeleteButton studentName={student.fullName} />
          </form>
        ) : (
          // Kept visible but disabled, so the row explains why deletion is unavailable.
          <button
            className="icon-btn danger"
            type="button"
            disabled
            aria-label={t('accounts.delete.blocked')}
            title={t('accounts.delete.blocked')}
          >
            <Trash2 aria-hidden="true" size={15} />
          </button>
        )}
      </div>

      {deleteState.status === 'error' ? (
        <small className="form-error" role="alert">
          {actionMessage(deleteState.messageKey, deleteState.messageValues)}
        </small>
      ) : null}
    </div>
  )
}

'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { useActionState, useEffect, useRef, useState } from 'react'
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
    <button className="btn" type="submit" disabled={pending}>
      {pending ? t('accounts.edit.saving') : t('accounts.edit.save')}
    </button>
  )
}

/** Stays disabled until the acknowledgement is ticked, because deleting cannot be undone. */
function ConfirmDeleteButton({ acknowledged }: { acknowledged: boolean }) {
  const { pending } = useFormStatus()
  const t = useT()
  return (
    <button className="btn danger-solid" type="submit" disabled={!acknowledged || pending}>
      {pending ? t('accounts.delete.pending') : t('accounts.delete.confirmButton')}
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
  const editDialog = useRef<HTMLDialogElement>(null)
  const deleteDialog = useRef<HTMLDialogElement>(null)
  const [acknowledged, setAcknowledged] = useState(false)
  const [updateState, updateAction] = useActionState(updateStudentAction, initialState)
  const [deleteState, deleteAction] = useActionState(deleteStudentAction, initialState)

  // Close on a saved change; the row behind the dialog has already re-rendered with the new values.
  useEffect(() => {
    if (updateState.status === 'success') editDialog.current?.close()
  }, [updateState])

  // A refused delete (for example, the student has work) is reported next to the row, not in a dialog.
  useEffect(() => {
    if (deleteState.status === 'error') deleteDialog.current?.close()
  }, [deleteState])

  function openDeleteDialog() {
    setAcknowledged(false)
    deleteDialog.current?.showModal()
  }

  return (
    <div className="row-actions">
      <div className="row-action-buttons">
        <button
          className="icon-btn"
          type="button"
          aria-label={t('accounts.edit.button')}
          title={t('accounts.edit.button')}
          onClick={() => editDialog.current?.showModal()}
        >
          <Pencil aria-hidden="true" size={15} />
        </button>

        {canDelete ? (
          <button
            className="icon-btn danger"
            type="button"
            aria-label={t('accounts.delete.button')}
            title={t('accounts.delete.button')}
            onClick={openDeleteDialog}
          >
            <Trash2 aria-hidden="true" size={15} />
          </button>
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

      {updateState.status === 'success' ? (
        <small className="form-success" role="status">
          {actionMessage(updateState.messageKey, updateState.messageValues)}
        </small>
      ) : null}
      {deleteState.status === 'error' ? (
        <small className="form-error" role="alert">
          {actionMessage(deleteState.messageKey, deleteState.messageValues)}
        </small>
      ) : null}

      <dialog
        className="student-dialog"
        ref={editDialog}
        onClick={(event) => {
          if (event.target === editDialog.current) editDialog.current.close()
        }}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">{t('accounts.edit.button')}</span>
            <h2>{t('accounts.edit.title', { name: student.fullName })}</h2>
          </div>
          <button
            className="close"
            type="button"
            aria-label={t('accounts.cancel')}
            onClick={() => editDialog.current?.close()}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>{t('accounts.edit.intro')}</p>
          <form action={updateAction}>
            <input type="hidden" name="studentId" value={student.id} />
            <div className="field">
              <label htmlFor={`full-name-${student.id}`}>{t('accounts.col.fullName')}</label>
              <input
                id={`full-name-${student.id}`}
                name="fullName"
                type="text"
                defaultValue={student.fullName}
                required
                maxLength={MAX_FULL_NAME_LENGTH}
                autoComplete="off"
              />
            </div>
            <div className="field">
              <label htmlFor={`grade-${student.id}`}>{t('accounts.col.grade')}</label>
              <input
                id={`grade-${student.id}`}
                name="grade"
                type="text"
                defaultValue={student.grade ?? ''}
                maxLength={MAX_GRADE_LENGTH}
                autoComplete="off"
              />
            </div>
            {updateState.status === 'error' ? (
              <p className="form-error" role="alert">
                {actionMessage(updateState.messageKey, updateState.messageValues)}
              </p>
            ) : null}
            <div className="modal-actions">
              <button
                className="btn outline"
                type="button"
                onClick={() => editDialog.current?.close()}
              >
                {t('accounts.cancel')}
              </button>
              <SaveButton />
            </div>
          </form>
        </div>
      </dialog>

      <dialog
        className="student-dialog"
        ref={deleteDialog}
        onClick={(event) => {
          if (event.target === deleteDialog.current) deleteDialog.current.close()
        }}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">{t('accounts.delete.button')}</span>
            <h2>{t('accounts.delete.title', { name: student.fullName })}</h2>
          </div>
          <button
            className="close"
            type="button"
            aria-label={t('accounts.cancel')}
            onClick={() => deleteDialog.current?.close()}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>{t('accounts.delete.body')}</p>
          <form action={deleteAction}>
            <input type="hidden" name="studentId" value={student.id} />
            <label className="dialog-ack">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.currentTarget.checked)}
              />
              <span>{t('accounts.delete.acknowledge')}</span>
            </label>
            <div className="modal-actions">
              <button
                className="btn outline"
                type="button"
                onClick={() => deleteDialog.current?.close()}
              >
                {t('accounts.cancel')}
              </button>
              <ConfirmDeleteButton acknowledged={acknowledged} />
            </div>
          </form>
        </div>
      </dialog>
    </div>
  )
}

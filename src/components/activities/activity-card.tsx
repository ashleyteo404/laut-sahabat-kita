'use client'

import { CloudUpload, RotateCw, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useActionMessage, useT } from '@/lib/i18n/client'
import {
  getQueuedSubmission,
  QUEUE_CHANGED_EVENT,
  type QueuedSubmission,
  removeQueuedSubmission,
  requestBackgroundSubmissionSync,
  saveQueuedSubmission,
  SUBMISSION_SYNCED_EVENT,
  syncQueuedSubmissions,
} from '@/lib/offline/submission-queue'
import type { Activity, Submission } from '@/lib/types'

// Narrow unions rather than the whole key space: t() can then prove none of these interpolate.
type ActivityErrorKey =
  | 'action.submission.reflectionTooShort'
  | 'action.submission.photoRequired'
  | 'action.submission.photoTooLarge'
  | 'action.submission.photoWrongType'
  | 'activity.deviceSaveFailed'
  | 'activity.deviceRetryFailed'
  | 'activity.deviceRemoveFailed'

type ActivityMessageKey =
  | 'activity.saved'
  | 'activity.uploadedField'
  | 'activity.uploadedOnline'
  | 'activity.retryUploaded'
  | 'activity.stillWaiting'

function SubmitButton({ field, saving }: { field: boolean; saving: boolean }) {
  const t = useT()
  return (
    <button className="btn" type="submit" disabled={saving}>
      {saving
        ? t('activity.submit.saving')
        : field
          ? t('activity.submit.field')
          : t('activity.submit.online')}
    </button>
  )
}

export function ActivityCard({
  activity,
  submission,
  studentId,
}: {
  activity: Activity
  submission?: Submission
  studentId: string
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const reflectionRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const t = useT()
  const actionMessage = useActionMessage()
  const [queuedSubmission, setQueuedSubmission] = useState<QueuedSubmission | null>(null)
  const [saving, setSaving] = useState(false)
  // Feedback is held as dictionary keys so it re-renders in the reader's current language.
  const [messageKey, setMessageKey] = useState<ActivityMessageKey | null>(null)
  const [errorKey, setErrorKey] = useState<ActivityErrorKey | null>(null)
  const isComplete = submission?.status === 'approved'
  const isPending = submission?.status === 'pending'
  const isQueued = Boolean(queuedSubmission)
  const canSubmit = !isComplete && !isPending && !isQueued
  const draftKey = `lsk-reflection-${studentId}-${activity.id}`

  const refreshQueuedSubmission = useCallback(async () => {
    try {
      setQueuedSubmission(await getQueuedSubmission(studentId, activity.id))
    } catch {
      setQueuedSubmission(null)
    }
  }, [studentId, activity.id])

  useEffect(() => {
    const initialRefreshFrame = window.requestAnimationFrame(() => {
      void refreshQueuedSubmission()
    })
    const handleQueueChange = () => void refreshQueuedSubmission()
    const handleSynced = () => {
      void refreshQueuedSubmission()
      router.refresh()
    }
    window.addEventListener(QUEUE_CHANGED_EVENT, handleQueueChange)
    window.addEventListener(SUBMISSION_SYNCED_EVENT, handleSynced)
    return () => {
      window.cancelAnimationFrame(initialRefreshFrame)
      window.removeEventListener(QUEUE_CHANGED_EVENT, handleQueueChange)
      window.removeEventListener(SUBMISSION_SYNCED_EVENT, handleSynced)
    }
  }, [refreshQueuedSubmission, router])

  useEffect(() => {
    if (canSubmit && reflectionRef.current) {
      reflectionRef.current.value = localStorage.getItem(draftKey) ?? ''
    }
  }, [canSubmit, draftKey])

  /** Whatever the queue last recorded, rendered in the current language. */
  function queuedError(saved: QueuedSubmission | null) {
    if (!saved) return null
    if (saved.lastErrorKey) {
      return actionMessage(saved.lastErrorKey, saved.lastErrorValues ?? undefined)
    }
    return saved.lastError
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorKey(null)
    setMessageKey(null)

    const formData = new FormData(event.currentTarget)
    const reflection = String(formData.get('reflection') ?? '').trim()
    const photoValue = formData.get('photo')
    const photo = photoValue instanceof File && photoValue.size > 0 ? photoValue : null

    // These keys are deliberately the same ones the upload endpoint returns, so the two validation
    // layers cannot drift apart.
    if (reflection.length < 10) {
      setErrorKey('action.submission.reflectionTooShort')
      return
    }
    if (activity.mode === 'field' && !photo) {
      setErrorKey('action.submission.photoRequired')
      return
    }
    if (photo && photo.size > 3 * 1024 * 1024) {
      setErrorKey('action.submission.photoTooLarge')
      return
    }
    if (photo && !['image/jpeg', 'image/png', 'image/webp'].includes(photo.type)) {
      setErrorKey('action.submission.photoWrongType')
      return
    }

    setSaving(true)
    const queued: QueuedSubmission = {
      id: crypto.randomUUID(),
      studentId,
      activityId: activity.id,
      reflection,
      photo,
      photoName: photo?.name ?? null,
      photoType: photo?.type ?? null,
      createdAt: new Date().toISOString(),
      attempts: 0,
      state: 'queued',
      lastError: null,
    }

    try {
      await saveQueuedSubmission(queued)
      setQueuedSubmission(queued)
      formRef.current?.reset()
      localStorage.removeItem(draftKey)
      setMessageKey('activity.saved')

      void requestBackgroundSubmissionSync().catch(() => undefined)
      if (navigator.onLine) {
        await syncQueuedSubmissions(studentId)
        const remaining = await getQueuedSubmission(studentId, activity.id)
        setQueuedSubmission(remaining)
        if (!remaining) {
          setMessageKey(
            activity.mode === 'field' ? 'activity.uploadedField' : 'activity.uploadedOnline',
          )
          dialogRef.current?.close()
          router.refresh()
        }
      }
    } catch {
      setErrorKey('activity.deviceSaveFailed')
    } finally {
      setSaving(false)
    }
  }

  async function retryQueuedSubmission() {
    setSaving(true)
    setErrorKey(null)
    try {
      await syncQueuedSubmissions(studentId, true)
      const saved = await getQueuedSubmission(studentId, activity.id)
      setQueuedSubmission(saved)
      if (!saved) {
        setMessageKey('activity.retryUploaded')
        dialogRef.current?.close()
        router.refresh()
      } else if (!saved.lastErrorKey && !saved.lastError) {
        setMessageKey('activity.stillWaiting')
      }
    } catch {
      setErrorKey('activity.deviceRetryFailed')
    } finally {
      setSaving(false)
    }
  }

  async function discardQueuedSubmission() {
    if (!queuedSubmission) return
    if (!window.confirm(t('activity.confirmRemove'))) return
    try {
      await removeQueuedSubmission(queuedSubmission.id)
      setQueuedSubmission(null)
      setMessageKey(null)
    } catch {
      setErrorKey('activity.deviceRemoveFailed')
    }
  }

  const modeLabel = activity.mode === 'field' ? t('activity.mode.field') : t('activity.mode.online')

  return (
    <>
      <article className="module-card">
        <div className="module-card-top">
          <span className="module-icon">{activity.icon}</span>
          <span className={`module-mode ${activity.mode}`}>{modeLabel}</span>
        </div>
        <h3>{activity.title}</h3>
        <p>{activity.description}</p>
        <div className="module-meta">
          <span>▷ {t('activity.minutes', { minutes: activity.minutes })}</span>
          <button type="button" onClick={() => dialogRef.current?.showModal()}>
            {isComplete
              ? t('activity.open.review')
              : isPending
                ? t('activity.open.pending')
                : isQueued
                  ? t('activity.open.queued')
                  : submission?.status === 'returned'
                    ? t('activity.open.returned')
                    : t('activity.open.begin')}{' '}
            →
          </button>
        </div>
      </article>
      <dialog
        className="activity-dialog"
        ref={dialogRef}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current.close()
        }}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">{modeLabel}</span>
            <h2>{activity.title}</h2>
          </div>
          <button className="close" type="button" onClick={() => dialogRef.current?.close()}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>{activity.description}</p>
          <div className="steps">
            {activity.steps.map((step, index) => (
              <div className="step" key={index}>
                <b>{index + 1}</b>
                <span>{step}</span>
              </div>
            ))}
          </div>
          {submission?.status === 'returned' && (
            <div className="quote">
              {t('activity.returnedBy')} {submission.review_note || t('activity.returnedFallback')}
            </div>
          )}
          {!canSubmit ? (
            <div className="empty">
              <span>{isQueued ? <CloudUpload size={23} /> : isComplete ? '✓' : '▷'}</span>
              <strong>
                {isQueued
                  ? queuedSubmission?.state === 'needs_attention'
                    ? t('activity.state.needsAttention')
                    : t('activity.state.savedOnDevice')
                  : isComplete
                    ? t('activity.state.complete')
                    : t('activity.state.awaitingApproval')}
              </strong>
              <p>{queuedSubmission?.reflection ?? submission?.reflection}</p>
              {isQueued ? (
                <>
                  <small className="queued-detail">
                    {(errorKey && t(errorKey)) ??
                      queuedError(queuedSubmission) ??
                      (messageKey && t(messageKey)) ??
                      t('activity.queued.autoUpload')}
                  </small>
                  <div className="queued-actions">
                    <button
                      className="btn sm"
                      type="button"
                      disabled={saving}
                      onClick={retryQueuedSubmission}
                    >
                      <RotateCw size={14} />{' '}
                      {saving ? t('sync.syncing') : t('activity.queued.syncNow')}
                    </button>
                    <button
                      className="btn outline sm"
                      type="button"
                      disabled={saving}
                      onClick={discardQueuedSubmission}
                    >
                      <Trash2 size={14} /> {t('activity.queued.remove')}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit}>
              <input type="hidden" name="activityId" value={activity.id} />
              {activity.mode === 'field' && (
                <div className="field">
                  <label htmlFor={`photo-${activity.id}`}>{t('activity.photoLabel')}</label>
                  <div className="upload">
                    <input
                      id={`photo-${activity.id}`}
                      name="photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      required
                    />
                    <strong>{t('activity.photoPrompt')}</strong>
                    <small>{t('activity.photoHint')}</small>
                  </div>
                </div>
              )}
              <div className="field">
                <label htmlFor={`reflection-${activity.id}`}>
                  {activity.mode === 'field'
                    ? t('activity.reflection.fieldLabel')
                    : t('activity.reflection.onlineLabel')}
                </label>
                <textarea
                  id={`reflection-${activity.id}`}
                  ref={reflectionRef}
                  name="reflection"
                  required
                  minLength={10}
                  maxLength={2000}
                  placeholder={t('activity.reflection.placeholder')}
                  onChange={(event) => localStorage.setItem(draftKey, event.currentTarget.value)}
                />
                <small className="draft-note">{t('activity.draftNote')}</small>
              </div>
              {errorKey && (
                <p className="form-error" role="alert">
                  {t(errorKey)}
                </p>
              )}
              {messageKey && <p className="form-success">{t(messageKey)}</p>}
              <div className="modal-actions">
                <button
                  className="btn outline"
                  type="button"
                  onClick={() => dialogRef.current?.close()}
                >
                  {t('activity.cancel')}
                </button>
                <SubmitButton field={activity.mode === 'field'} saving={saving} />
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  )
}

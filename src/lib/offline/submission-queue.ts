'use client'

import type { ActionMessageKey } from '@/lib/i18n/dictionaries/en'

const DATABASE_NAME = 'lsk-offline'
const DATABASE_VERSION = 1
const OUTBOX_STORE = 'submission-outbox'

export const QUEUE_CHANGED_EVENT = 'lsk:submission-queue-changed'
export const SUBMISSION_SYNCED_EVENT = 'lsk:submission-synced'
export const BACKGROUND_SYNC_TAG = 'lsk-submission-sync'

export interface QueuedSubmission {
  id: string
  studentId: string
  activityId: string
  reflection: string
  photo: Blob | null
  photoName: string | null
  photoType: string | null
  createdAt: string
  attempts: number
  state: 'queued' | 'needs_attention'
  lastError: string | null
  /**
   * Optional so rows written before this field existed still satisfy the type; the IndexedDB
   * version stays at 1 because no index or keyPath changed.
   */
  lastErrorKey?: ActionMessageKey | null
  lastErrorValues?: Record<string, string | number> | null
}

export interface SubmissionSyncResult {
  synced: number
  remaining: number
  authRequired: boolean
}

interface SyncManagerRegistration extends ServiceWorkerRegistration {
  sync?: { register(tag: string): Promise<void> }
}

interface ActiveSync {
  includeNeedsAttention: boolean
  promise: Promise<SubmissionSyncResult>
}

const activeSyncs = new Map<string, ActiveSync>()

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new Error('The device database request failed.'))
  })
}

function transactionComplete(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('The device database transaction failed.'))
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('The device database transaction was cancelled.'))
  })
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (database.objectStoreNames.contains(OUTBOX_STORE)) return
      const store = database.createObjectStore(OUTBOX_STORE, { keyPath: 'id' })
      store.createIndex('by_student', 'studentId')
      store.createIndex('by_student_activity', ['studentId', 'activityId'])
      store.createIndex('by_created_at', 'createdAt')
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Could not open device storage.'))
  })
}

async function withStore<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const database = await openDatabase()
  try {
    const transaction = database.transaction(OUTBOX_STORE, mode)
    const completion = transactionComplete(transaction)
    const result = await requestResult(operation(transaction.objectStore(OUTBOX_STORE)))
    await completion
    return result
  } finally {
    database.close()
  }
}

function announceQueueChange() {
  window.dispatchEvent(new Event(QUEUE_CHANGED_EVENT))
}

export async function saveQueuedSubmission(submission: QueuedSubmission) {
  await withStore('readwrite', (store) => store.put(submission))
  announceQueueChange()
}

export async function removeQueuedSubmission(id: string) {
  await withStore('readwrite', (store) => store.delete(id))
  announceQueueChange()
}

export async function listQueuedSubmissions(studentId?: string) {
  if (studentId) {
    return withStore('readonly', (store) =>
      store.index('by_student').getAll(IDBKeyRange.only(studentId)),
    ) as Promise<QueuedSubmission[]>
  }
  return withStore('readonly', (store) => store.getAll()) as Promise<QueuedSubmission[]>
}

export async function getQueuedSubmission(studentId: string, activityId: string) {
  const matches = (await withStore('readonly', (store) =>
    store.index('by_student_activity').getAll(IDBKeyRange.only([studentId, activityId])),
  )) as QueuedSubmission[]
  return matches.sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0] ?? null
}

async function recordSyncFailure(
  submission: QueuedSubmission,
  message: string,
  messageKey: ActionMessageKey,
  messageValues: Record<string, string | number> | null = null,
  permanent = false,
) {
  await withStore('readwrite', (store) =>
    store.put({
      ...submission,
      attempts: submission.attempts + 1,
      state: permanent ? 'needs_attention' : 'queued',
      lastError: message,
      lastErrorKey: messageKey,
      lastErrorValues: messageValues,
    } satisfies QueuedSubmission),
  )
}

function formDataFor(submission: QueuedSubmission) {
  const formData = new FormData()
  formData.set('activityId', submission.activityId)
  formData.set('clientSubmissionId', submission.id)
  formData.set('studentId', submission.studentId)
  formData.set('reflection', submission.reflection)
  if (submission.photo) {
    formData.set('photo', submission.photo, submission.photoName ?? 'field-photo.jpg')
  }
  return formData
}

async function performSync(
  studentId?: string,
  includeNeedsAttention = false,
): Promise<SubmissionSyncResult> {
  const submissions = (await listQueuedSubmissions(studentId)).filter(
    (submission) => includeNeedsAttention || submission.state !== 'needs_attention',
  )
  let synced = 0
  let authRequired = false

  for (const submission of submissions) {
    let response: Response
    try {
      response = await fetch('/api/submissions', {
        method: 'POST',
        body: formDataFor(submission),
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
    } catch {
      await recordSyncFailure(
        submission,
        'Waiting for an internet connection.',
        'action.sync.waitingForConnection',
      )
      break
    }

    const contentType = response.headers.get('content-type') ?? ''
    const payload = contentType.includes('application/json')
      ? ((await response.json().catch(() => ({}))) as {
          message?: string
          messageKey?: ActionMessageKey
        })
      : {}

    if (response.ok) {
      await withStore('readwrite', (store) => store.delete(submission.id))
      synced += 1
      continue
    }

    const message = payload.message ?? `Upload failed (${response.status}).`
    const messageKey = payload.messageKey ?? 'action.sync.uploadFailed'
    // Only the generic fallback interpolates a status code; endpoint-supplied keys are static.
    const messageValues = payload.messageKey ? null : { status: response.status }
    if (response.status === 401) {
      authRequired = true
      await recordSyncFailure(submission, message, messageKey, messageValues)
      break
    }
    if (response.status === 403) {
      await recordSyncFailure(submission, message, messageKey, messageValues)
      continue
    }

    const permanent = [400, 404, 409, 413, 422].includes(response.status)
    await recordSyncFailure(submission, message, messageKey, messageValues, permanent)
    if (response.status === 429 || response.status >= 500) break
  }

  const remaining = (await listQueuedSubmissions(studentId)).length
  announceQueueChange()
  if (synced > 0) window.dispatchEvent(new Event(SUBMISSION_SYNCED_EVENT))
  return { synced, remaining, authRequired }
}

export function syncQueuedSubmissions(studentId?: string, includeNeedsAttention = false) {
  const key = studentId ?? '*'
  const active = activeSyncs.get(key)
  if (active) {
    if (!includeNeedsAttention || active.includeNeedsAttention) return active.promise

    const queued: ActiveSync = {
      includeNeedsAttention: true,
      promise: active.promise.then(() => performSync(studentId, true)),
    }
    activeSyncs.set(key, queued)
    queued.promise.then(
      () => {
        if (activeSyncs.get(key) === queued) activeSyncs.delete(key)
      },
      () => {
        if (activeSyncs.get(key) === queued) activeSyncs.delete(key)
      },
    )
    return queued.promise
  }

  const started: ActiveSync = {
    includeNeedsAttention,
    promise: performSync(studentId, includeNeedsAttention),
  }
  activeSyncs.set(key, started)
  started.promise.then(
    () => {
      if (activeSyncs.get(key) === started) activeSyncs.delete(key)
    },
    () => {
      if (activeSyncs.get(key) === started) activeSyncs.delete(key)
    },
  )
  return started.promise
}

export async function requestBackgroundSubmissionSync() {
  if (!('serviceWorker' in navigator)) return false
  const registration = (await navigator.serviceWorker.ready) as SyncManagerRegistration
  if (!registration.sync) return false
  await registration.sync.register(BACKGROUND_SYNC_TAG)
  return true
}

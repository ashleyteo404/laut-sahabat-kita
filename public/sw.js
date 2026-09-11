const CACHE_PREFIX = 'lsk-'
const SHELL_CACHE = `${CACHE_PREFIX}shell-v5`
const ASSET_CACHE = `${CACHE_PREFIX}assets-v5`
const OFFLINE_URL = '/offline.html'
const OFFLINE_DATABASE = 'lsk-offline'
const OFFLINE_DATABASE_VERSION = 1
const OUTBOX_STORE = 'submission-outbox'
const SUBMISSION_SYNC_TAG = 'lsk-submission-sync'
const PRECACHE = [
  OFFLINE_URL,
  '/ocean-passport-icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
]

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed.'))
  })
}

function transactionComplete(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () =>
      reject(transaction.error || new Error('IndexedDB transaction failed.'))
    transaction.onabort = () =>
      reject(transaction.error || new Error('IndexedDB transaction aborted.'))
  })
}

function openOfflineDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DATABASE, OFFLINE_DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (database.objectStoreNames.contains(OUTBOX_STORE)) return
      const store = database.createObjectStore(OUTBOX_STORE, { keyPath: 'id' })
      store.createIndex('by_student', 'studentId')
      store.createIndex('by_student_activity', ['studentId', 'activityId'])
      store.createIndex('by_created_at', 'createdAt')
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Could not open offline storage.'))
  })
}

async function accessOutbox(mode, operation) {
  const database = await openOfflineDatabase()
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

function submissionFormData(submission) {
  const formData = new FormData()
  formData.set('activityId', submission.activityId)
  formData.set('clientSubmissionId', submission.id)
  formData.set('studentId', submission.studentId)
  formData.set('reflection', submission.reflection)
  if (submission.photo) {
    formData.set('photo', submission.photo, submission.photoName || 'field-photo.jpg')
  }
  return formData
}

async function notifyWindows(synced, remaining) {
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  windows.forEach((client) =>
    client.postMessage({ type: 'LSK_SUBMISSION_SYNC_COMPLETE', synced, remaining }),
  )
}

async function syncSubmissionOutbox() {
  const submissions = await accessOutbox('readonly', (store) => store.getAll())
  let synced = 0
  let retryNeeded = false

  for (const submission of submissions) {
    if (submission.state === 'needs_attention') continue
    let response
    try {
      response = await fetch('/api/submissions', {
        method: 'POST',
        body: submissionFormData(submission),
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
    } catch {
      submission.attempts += 1
      // The worker never translates; it records the key for the page to render in its own language.
      submission.lastError = 'Waiting for an internet connection.'
      submission.lastErrorKey = 'action.sync.waitingForConnection'
      submission.lastErrorValues = null
      await accessOutbox('readwrite', (store) => store.put(submission))
      retryNeeded = true
      break
    }

    if (response.ok) {
      await accessOutbox('readwrite', (store) => store.delete(submission.id))
      synced += 1
      continue
    }

    const contentType = response.headers.get('content-type') || ''
    const payload = contentType.includes('application/json')
      ? await response.json().catch(() => ({}))
      : {}
    submission.attempts += 1
    submission.lastError = payload.message || `Upload failed (${response.status}).`
    submission.lastErrorKey = payload.messageKey || 'action.sync.uploadFailed'
    submission.lastErrorValues = payload.messageKey ? null : { status: response.status }
    if ([400, 404, 409, 413, 422].includes(response.status)) {
      submission.state = 'needs_attention'
    }
    await accessOutbox('readwrite', (store) => store.put(submission))

    if (response.status === 401 || response.status === 429 || response.status >= 500) {
      retryNeeded = true
      break
    }
  }

  const remaining = (await accessOutbox('readonly', (store) => store.count())) || 0
  await notifyWindows(synced, remaining)
  if (retryNeeded) throw new Error('Submission sync will retry later.')
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith(CACHE_PREFIX) && ![SHELL_CACHE, ASSET_CACHE].includes(key),
            )
            .map((key) => caches.delete(key)),
        ),
      ),
  )
  self.clients.claim()
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
  if (event.data?.type === 'SYNC_SUBMISSIONS') event.waitUntil(syncSubmissionOutbox())
})

self.addEventListener('sync', (event) => {
  if (event.tag === SUBMISSION_SYNC_TAG) event.waitUntil(syncSubmissionOutbox())
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  if (event.request.headers.has('range')) return
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)))
    return
  }

  if (
    ['style', 'script'].includes(event.request.destination) ||
    url.pathname === '/manifest.webmanifest'
  ) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        try {
          const response = await fetch(event.request)
          if (response.ok) void cache.put(event.request, response.clone())
          return response
        } catch {
          return (
            (await cache.match(event.request)) ||
            new Response('', { status: 503, statusText: 'Offline' })
          )
        }
      }),
    )
    return
  }

  if (['font', 'image'].includes(event.request.destination)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request)
        const network = fetch(event.request)
          .then((response) => {
            if (response.ok) void cache.put(event.request, response.clone())
            return response
          })
          .catch(
            () =>
              cached ||
              new Response('', {
                status: 503,
                statusText: 'Offline',
              }),
          )
        return cached || network
      }),
    )
  }
})

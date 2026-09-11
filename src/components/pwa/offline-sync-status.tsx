'use client'

import { CloudUpload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useT } from '@/lib/i18n/client'
import {
  listQueuedSubmissions,
  QUEUE_CHANGED_EVENT,
  requestBackgroundSubmissionSync,
  SUBMISSION_SYNCED_EVENT,
  syncQueuedSubmissions,
} from '@/lib/offline/submission-queue'

export function OfflineSyncStatus({ studentId }: { studentId: string }) {
  const t = useT()
  const [queuedCount, setQueuedCount] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const syncingRef = useRef(false)
  const router = useRouter()

  const refreshCount = useCallback(async () => {
    try {
      setQueuedCount((await listQueuedSubmissions(studentId)).length)
    } catch {
      setQueuedCount(0)
    }
  }, [studentId])

  const syncNow = useCallback(
    async (includeNeedsAttention = false) => {
      if (!navigator.onLine || syncingRef.current) return
      syncingRef.current = true
      setSyncing(true)
      try {
        const result = await syncQueuedSubmissions(studentId, includeNeedsAttention)
        setQueuedCount(result.remaining)
        if (result.synced > 0) router.refresh()
        if (result.remaining > 0) void requestBackgroundSubmissionSync().catch(() => undefined)
      } catch {
        await refreshCount()
      } finally {
        syncingRef.current = false
        setSyncing(false)
      }
    },
    [refreshCount, router, studentId],
  )

  useEffect(() => {
    const handleQueueChange = () => void refreshCount()
    const handleSynced = () => {
      void refreshCount()
      router.refresh()
    }
    const handleReconnect = () => void syncNow()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void syncNow()
    }
    const handleWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'LSK_SUBMISSION_SYNC_COMPLETE') return
      void refreshCount()
      if (event.data.synced > 0) router.refresh()
    }

    const initialSyncFrame = window.requestAnimationFrame(() => {
      void refreshCount().then(() => {
        if (navigator.onLine) void syncNow()
      })
    })
    void navigator.storage?.persist?.().catch(() => undefined)
    window.addEventListener(QUEUE_CHANGED_EVENT, handleQueueChange)
    window.addEventListener(SUBMISSION_SYNCED_EVENT, handleSynced)
    window.addEventListener('online', handleReconnect)
    window.addEventListener('focus', handleReconnect)
    window.addEventListener('pageshow', handleReconnect)
    document.addEventListener('visibilitychange', handleVisibility)
    navigator.serviceWorker?.addEventListener('message', handleWorkerMessage)
    return () => {
      window.cancelAnimationFrame(initialSyncFrame)
      window.removeEventListener(QUEUE_CHANGED_EVENT, handleQueueChange)
      window.removeEventListener(SUBMISSION_SYNCED_EVENT, handleSynced)
      window.removeEventListener('online', handleReconnect)
      window.removeEventListener('focus', handleReconnect)
      window.removeEventListener('pageshow', handleReconnect)
      document.removeEventListener('visibilitychange', handleVisibility)
      navigator.serviceWorker?.removeEventListener('message', handleWorkerMessage)
    }
  }, [refreshCount, router, syncNow])

  if (queuedCount === 0 && !syncing) return null

  return (
    <button
      className="pwa-sync-button"
      type="button"
      disabled={syncing || queuedCount === 0}
      title={syncing ? t('sync.uploading') : t('sync.uploadNow')}
      onClick={() => void syncNow(true)}
    >
      <CloudUpload aria-hidden="true" size={16} />
      <span>{syncing ? t('sync.syncing') : t('sync.waiting', { count: queuedCount })}</span>
    </button>
  )
}

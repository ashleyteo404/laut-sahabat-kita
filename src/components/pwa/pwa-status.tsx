'use client'

import { Download, RefreshCw, WifiOff } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useT } from '@/lib/i18n/client'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type PwaAction = 'install' | 'update' | 'ios' | 'manual' | null

interface PwaContextValue {
  action: PwaAction
  runAction: () => Promise<void> | void
}

const PwaContext = createContext<PwaContextValue>({ action: null, runAction: () => undefined })

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const t = useT()
  const [offline, setOffline] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [runningStandalone, setRunningStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [environmentReady, setEnvironmentReady] = useState(false)
  const reloadForUpdate = useRef(false)

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    const handleInstalled = () => {
      setInstallPrompt(null)
      setRunningStandalone(true)
    }
    const handleControllerChange = () => {
      if (!reloadForUpdate.current) return
      reloadForUpdate.current = false
      window.location.reload()
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .then((registration) => {
          if (registration.waiting) setWaitingWorker(registration.waiting)
          registration.addEventListener('updatefound', () => {
            const worker = registration.installing
            worker?.addEventListener('statechange', () => {
              if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(worker)
              }
            })
          })
          void registration.update()
        })
        .catch(() => undefined)
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
    }

    const update = () => setOffline(!navigator.onLine)
    const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
    const initialStatusFrame = window.requestAnimationFrame(() => {
      update()
      setRunningStandalone(
        window.matchMedia('(display-mode: standalone)').matches ||
          Boolean(navigatorWithStandalone.standalone),
      )
      setIsIos(/iPad|iPhone|iPod/.test(navigator.userAgent))
      setEnvironmentReady(true)
    })
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.cancelAnimationFrame(initialStatusFrame)
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
      navigator.serviceWorker?.removeEventListener('controllerchange', handleControllerChange)
    }
  }, [])

  const installApp = useCallback(async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }, [installPrompt])

  const updateApp = useCallback(() => {
    if (!waitingWorker) return
    reloadForUpdate.current = true
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
  }, [waitingWorker])

  const action: PwaAction = waitingWorker
    ? 'update'
    : environmentReady && !runningStandalone && installPrompt
      ? 'install'
      : environmentReady && !runningStandalone && isIos
        ? 'ios'
        : environmentReady && !runningStandalone
          ? 'manual'
          : null

  const value = useMemo<PwaContextValue>(
    () => ({
      action,
      runAction:
        action === 'update' ? updateApp : action === 'install' ? installApp : () => undefined,
    }),
    [action, installApp, updateApp],
  )

  return (
    <PwaContext.Provider value={value}>
      {offline ? (
        <div className="offline-banner" role="status">
          <WifiOff aria-hidden="true" size={15} />
          {t('pwa.offlineBanner')}
        </div>
      ) : null}
      {children}
    </PwaContext.Provider>
  )
}

export function PwaInstallButton() {
  const { action, runAction } = useContext(PwaContext)
  const t = useT()
  const [showInstallHelp, setShowInstallHelp] = useState(false)

  if (!action) return null

  const isUpdate = action === 'update'
  const Icon = isUpdate ? RefreshCw : Download
  const label = isUpdate ? t('pwa.updateApp') : t('pwa.installApp')

  function handleClick() {
    if (action === 'ios' || action === 'manual') {
      setShowInstallHelp((visible) => !visible)
      return
    }
    void runAction()
  }

  return (
    <div className="pwa-install-control">
      <button
        className="pwa-install-button"
        type="button"
        aria-expanded={action === 'ios' || action === 'manual' ? showInstallHelp : undefined}
        onClick={handleClick}
      >
        <Icon aria-hidden="true" size={16} />
        <span>{label}</span>
      </button>
      {showInstallHelp && (action === 'ios' || action === 'manual') ? (
        <small className="pwa-install-help" role="status">
          {action === 'ios' ? t('pwa.installHelp.ios') : t('pwa.installHelp.manual')}
        </small>
      ) : null}
    </div>
  )
}

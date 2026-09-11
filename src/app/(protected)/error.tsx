'use client'

import { useT } from '@/lib/i18n/client'

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useT()
  return (
    <div className="panel empty">
      <span>⚠</span>
      <strong>{t('error.title')}</strong>
      <p>{t('error.body')}</p>
      <button className="btn" onClick={reset}>
        {t('error.retry')}
      </button>
    </div>
  )
}

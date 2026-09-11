import type { Metadata } from 'next'
import Link from 'next/link'
import { getWorkspaceData } from '@/lib/data'
import { requireProfile } from '@/lib/auth'
import { getLocale, getTranslator } from '@/lib/i18n/server'
import { formatDate } from '@/lib/utils'
import type { UiMessageKey } from '@/lib/i18n/dictionaries/en'
import type { SubmissionStatus } from '@/lib/types'

const statusKey = {
  pending: 'status.pending',
  approved: 'status.approved',
  returned: 'status.returned',
} as const satisfies Record<SubmissionStatus, UiMessageKey>

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t('meta.journal.title') }
}

export default async function JournalPage() {
  await requireProfile(['student'])
  const [t, locale] = await Promise.all([getTranslator(), getLocale()])
  const data = await getWorkspaceData()
  const mine = data.submissions.filter((item) => item.student_id === data.profile.id)
  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">{t('journal.eyebrow')}</span>
          <h1>{t('journal.heading')}</h1>
          <p>{t('journal.intro')}</p>
        </div>
        <Link className="btn" href="/explore">
          {t('journal.add')}
        </Link>
      </div>
      <div className="panel">
        <div className="activity-list">
          {mine.length ? (
            mine.map((item) => {
              const activity = data.activities.find(
                (candidate) => candidate.id === item.activity_id,
              )
              if (!activity) return null
              return (
                <article className="activity-row journal-entry" key={item.id}>
                  {item.evidenceUrl ? (
                    <a
                      className="activity-ico evidence-thumb"
                      href={item.evidenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={t('journal.openPhoto', { title: activity.title })}
                      style={{ backgroundImage: `url(${item.evidenceUrl})` }}
                    />
                  ) : (
                    <span className="activity-ico">{activity.icon}</span>
                  )}
                  <span className="activity-info">
                    <strong>{activity.title}</strong>
                    <small>
                      {formatDate(item.created_at, locale)} · “{item.reflection}”
                    </small>
                    {item.review_note && (
                      <small>{t('journal.teacherNote', { note: item.review_note })}</small>
                    )}
                  </span>
                  <span className={`status ${item.status}`}>{t(statusKey[item.status])}</span>
                </article>
              )
            })
          ) : (
            <div className="empty">
              <span>✎</span>
              <strong>{t('journal.emptyTitle')}</strong>
              <p>{t('journal.emptyBody')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

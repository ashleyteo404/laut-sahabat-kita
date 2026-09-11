import type { Metadata } from 'next'
import { ReviewCard } from '@/components/review/review-card'
import { getWorkspaceData } from '@/lib/data'
import { requireProfile } from '@/lib/auth'
import { getTranslator } from '@/lib/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t('meta.review.title') }
}

export default async function ReviewPage() {
  await requireProfile(['teacher', 'jari_admin'])
  const t = await getTranslator()
  const data = await getWorkspaceData()
  const pending = data.submissions.filter((item) => item.status === 'pending')
  const reviewed = data.submissions.filter((item) => item.status !== 'pending')
  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">{t('reviewPage.eyebrow')}</span>
          <h1>{t('reviewPage.heading')}</h1>
          <p>{t('reviewPage.intro')}</p>
        </div>
        <span className="status pending">
          {t('reviewPage.pendingCount', { count: pending.length })}
        </span>
      </div>
      <section className="panel">
        <div className="panel-head">
          <h3>{t('reviewPage.needsReview')}</h3>
        </div>
        <div className="review-list">
          {pending.length ? (
            pending.map((item) => {
              const activity = data.activities.find(
                (candidate) => candidate.id === item.activity_id,
              )
              return activity ? (
                <ReviewCard key={item.id} submission={item} activity={activity} />
              ) : null
            })
          ) : (
            <div className="empty">
              <span>✓</span>
              <strong>{t('reviewPage.emptyTitle')}</strong>
              <p>{t('reviewPage.emptyBody')}</p>
            </div>
          )}
        </div>
      </section>
      {reviewed.length > 0 && (
        <section className="section panel">
          <div className="panel-head">
            <h3>{t('reviewPage.recentlyReviewed')}</h3>
          </div>
          <div className="review-list">
            {reviewed.slice(0, 10).map((item) => {
              const activity = data.activities.find(
                (candidate) => candidate.id === item.activity_id,
              )
              return activity ? (
                <ReviewCard key={item.id} submission={item} activity={activity} />
              ) : null
            })}
          </div>
        </section>
      )}
    </div>
  )
}

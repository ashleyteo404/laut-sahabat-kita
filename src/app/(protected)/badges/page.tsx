import type { Metadata } from 'next'
import { BadgeCard } from '@/components/badges/badge-card'
import { getWorkspaceData } from '@/lib/data'
import { requireProfile } from '@/lib/auth'
import { getTranslator } from '@/lib/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t('meta.badges.title') }
}

export default async function BadgesPage() {
  await requireProfile(['student'])
  const t = await getTranslator()
  const data = await getWorkspaceData()
  const { activities, badges } = data
  const mine = data.submissions.filter((item) => item.student_id === data.profile.id)
  const learning = new Set(
    data.awards
      .filter((item) => item.student_id === data.profile.id && item.award_tier === 'learning')
      .map((item) => item.badge_id),
  )
  const explorer = new Set(
    data.awards
      .filter((item) => item.student_id === data.profile.id && item.award_tier === 'explorer')
      .map((item) => item.badge_id),
  )
  const pending = new Set(
    mine
      .filter((item) => item.status === 'pending')
      .map((item) => activities.find((a) => a.id === item.activity_id)?.badgeId)
      .filter(Boolean),
  )
  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">{t('badges.eyebrow')}</span>
          <h1>{t('badges.heading')}</h1>
          <p>{t('badges.intro')}</p>
        </div>
        <div className="segmented">
          <span className="active">{t('badges.learningCount', { count: learning.size })}</span>
          <span>{t('badges.explorerCount', { count: explorer.size })}</span>
        </div>
      </div>
      <div className="badge-grid">
        {badges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            status={
              explorer.has(badge.id)
                ? 'explorer'
                : learning.has(badge.id)
                  ? 'learning'
                  : pending.has(badge.id)
                    ? 'pending'
                    : 'locked'
            }
          />
        ))}
      </div>
    </div>
  )
}

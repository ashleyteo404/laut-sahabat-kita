import type { Metadata } from 'next'
import { BadgeCard } from '@/components/badges/badge-card'
import { getWorkspaceData } from '@/lib/data'
import { requireProfile } from '@/lib/auth'
import { getTranslator } from '@/lib/i18n/server'
import { initials } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t('meta.passport.title') }
}

export default async function PassportPage() {
  await requireProfile(['student'])
  const t = await getTranslator()
  const data = await getWorkspaceData()
  const { badges } = data
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
  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">{t('passport.eyebrow')}</span>
          <h1>{t('passport.heading')}</h1>
          <p>{t('passport.intro')}</p>
        </div>
      </div>
      <section className="passport">
        <div className="passport-main">
          <div className="passport-label">{t('passport.label')}</div>
          <div className="passport-person">
            <div className="avatar">{initials(data.profile.full_name)}</div>
            <div>
              <h2>{data.profile.full_name}</h2>
              <p>
                {t('passport.schoolGrade', {
                  school: data.profile.schools?.name ?? t('brand.name'),
                  grade: data.profile.grade ?? '—',
                })}
              </p>
            </div>
          </div>
          <div className="passport-id">
            <div>
              <span>{t('passport.number')}</span>
              <strong>
                LSK-{data.profile.joined_year}-{data.profile.id.slice(0, 4).toUpperCase()}
              </strong>
            </div>
            <div>
              <span>{t('passport.village')}</span>
              <strong>{data.profile.village ?? data.profile.schools?.village ?? '—'}</strong>
            </div>
            <div>
              <span>{t('passport.joined')}</span>
              <strong>{data.profile.joined_year}</strong>
            </div>
          </div>
        </div>
        <div className="passport-side">
          <div className="seal">
            <div>
              <span>≈</span>
              <strong>{t('passport.seal')}</strong>
              <small>{t('passport.sealPlace')}</small>
            </div>
          </div>
        </div>
      </section>
      <section className="section two-col">
        <div className="panel">
          <div className="panel-head">
            <h3>{t('passport.outdoorRecord')}</h3>
          </div>
          <div className="impact-grid compact">
            <div>
              <strong>{data.studentLearning.session_count}</strong>
              <span>{t('passport.sessionCount')}</span>
            </div>
            <div>
              <strong>
                {t('unit.hoursShort', {
                  value: (data.studentLearning.learning_minutes / 60).toFixed(1),
                })}
              </strong>
              <span>{t('passport.learningTime')}</span>
            </div>
            <div>
              <strong>{data.studentLearning.habitats.length}</strong>
              <span>{t('passport.habitats')}</span>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <h3>{t('passport.places')}</h3>
          </div>
          <div className="tag-list">
            {data.studentLearning.habitats.length ? (
              data.studentLearning.habitats.map((habitat) => (
                <span className="filter-chip active" key={habitat}>
                  {habitat}
                </span>
              ))
            ) : (
              <p className="muted">{t('passport.placesEmpty')}</p>
            )}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t('badges.eyebrow')}</span>
            <h2>{t('passport.badgesHeading')}</h2>
            <p>{t('passport.badgesIntro')}</p>
          </div>
        </div>
        <div className="badge-grid">
          {badges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              status={
                explorer.has(badge.id) ? 'explorer' : learning.has(badge.id) ? 'learning' : 'locked'
              }
            />
          ))}
        </div>
      </section>
    </div>
  )
}

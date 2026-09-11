import Link from 'next/link'
import { IslandCard } from '@/components/islands/island-card'
import { StatCard } from '@/components/ui/stat-card'
import { getTranslator } from '@/lib/i18n/server'
import { percentage } from '@/lib/utils'
import type { WorkspaceData } from '@/lib/types'

export async function StudentDashboard({ data }: { data: WorkspaceData }) {
  const t = await getTranslator()
  const { activities, islands } = data
  const approved = data.submissions.filter(
    (item) => item.student_id === data.profile.id && item.status === 'approved',
  )
  const completedIds = new Set(approved.map((item) => item.activity_id))
  const awardCount = data.awards.filter((award) => award.student_id === data.profile.id).length
  const progress = percentage(completedIds.size, activities.length)
  const habitats = new Set(
    [...completedIds]
      .map((id) => activities.find((activity) => activity.id === id)?.islandId)
      .filter(Boolean),
  ).size
  const activityMinutes = [...completedIds].reduce(
    (sum, id) => sum + (activities.find((activity) => activity.id === id)?.minutes ?? 0),
    0,
  )
  const learningMinutes = data.studentLearning.learning_minutes || activityMinutes
  const habitatCount = new Set([
    ...data.studentLearning.habitats,
    ...[...completedIds]
      .map((id) => activities.find((activity) => activity.id === id)?.islandId)
      .filter((value): value is string => Boolean(value)),
  ]).size

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker">✦ {t('dashboard.student.kicker')}</span>
          <h1>
            {t('dashboard.student.greeting')}
            <br />
            {data.profile.full_name.split(' ')[0]}!
          </h1>
          <p>{t('dashboard.student.intro')}</p>
          <div className="hero-actions">
            <Link className="btn light" href="/explore">
              {t('dashboard.student.continue')}
            </Link>
            <Link className="btn ghost" href="/passport">
              {t('dashboard.student.viewPassport')}
            </Link>
          </div>
        </div>
        <div className="hero-progress">
          <div className="progress-label">
            <small>{t('dashboard.student.overallJourney')}</small>
            <strong>{progress}%</strong>
          </div>
          <div className="progress">
            <i style={{ width: `${progress}%` }} />
          </div>
          <small>
            {t('dashboard.student.progressCount', {
              done: completedIds.size,
              total: activities.length,
            })}
          </small>
        </div>
      </section>
      <section className="section">
        <div className="stat-grid">
          <StatCard icon="✦" value={awardCount} label={t('dashboard.student.stat.badges')} />
          <StatCard
            icon="⌁"
            value={completedIds.size}
            label={t('dashboard.student.stat.activities')}
          />
          <StatCard
            icon="◷"
            value={t('unit.hoursShort', { value: (learningMinutes / 60).toFixed(1) })}
            label={t('dashboard.student.stat.time')}
          />
          <StatCard
            icon="◎"
            value={habitatCount || habitats}
            label={t('dashboard.student.stat.habitats')}
          />
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t('dashboard.student.islandsEyebrow')}</span>
            <h2>{t('dashboard.student.islandsHeading')}</h2>
            <p>{t('dashboard.student.islandsIntro')}</p>
          </div>
          <Link className="text-btn" href="/explore">
            {t('dashboard.student.seeAll')}
          </Link>
        </div>
        <div className="journey-grid">
          {islands.map((island) => {
            const islandActivities = activities.filter((a) => a.islandId === island.id)
            const done = islandActivities.filter((a) => completedIds.has(a.id)).length
            return (
              <IslandCard
                key={island.id}
                island={island}
                progress={percentage(done, islandActivities.length)}
                activityCount={islandActivities.length}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}

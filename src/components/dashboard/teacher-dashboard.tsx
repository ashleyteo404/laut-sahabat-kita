import Link from 'next/link'
import { ReviewCard } from '@/components/review/review-card'
import { StatCard } from '@/components/ui/stat-card'
import { getLocale, getTranslator } from '@/lib/i18n/server'
import { formatLongDate } from '@/lib/utils'
import type { WorkspaceData } from '@/lib/types'

export async function TeacherDashboard({ data }: { data: WorkspaceData }) {
  const [t, locale] = await Promise.all([getTranslator(), getLocale()])
  const pending = data.submissions.filter((item) => item.status === 'pending')
  const learners = data.people.filter((person) => person.role === 'student')
  const approved = data.submissions.filter((item) => item.status === 'approved').length
  const fieldSessions = data.sessions.filter((session) => session.session_type === 'field').length
  return (
    <div className="page">
      <section className="teacher-hero">
        <div>
          <span className="eyebrow">{formatLongDate(new Date(), locale)}</span>
          <h1>{t('dashboard.teacher.greeting', { name: data.profile.full_name })}</h1>
          <p>{t('dashboard.teacher.intro')}</p>
        </div>
        <div className="queue-pill">
          <span>
            {t('dashboard.teacher.awaiting')}
            <br />
            {t('dashboard.teacher.yourReview')}
          </span>
          <strong>{pending.length}</strong>
          <Link className="btn light sm" href="/review">
            {t('dashboard.teacher.reviewNow')}
          </Link>
        </div>
      </section>
      <section className="section">
        <div className="stat-grid">
          <StatCard icon="♙" value={learners.length} label={t('dashboard.teacher.stat.students')} />
          <StatCard icon="✓" value={approved} label={t('dashboard.teacher.stat.activities')} />
          <StatCard
            icon="✦"
            value={data.awards.length}
            label={t('dashboard.teacher.stat.badges')}
          />
          <StatCard
            icon="⌁"
            value={fieldSessions}
            label={t('dashboard.teacher.stat.fieldSessions')}
          />
        </div>
      </section>
      <section className="section two-col">
        <div className="panel">
          <div className="panel-head">
            <h3>{t('dashboard.teacher.delivery')}</h3>
            <Link className="text-btn" href="/sessions">
              {t('dashboard.teacher.logSession')}
            </Link>
          </div>
          <div className="impact-grid compact">
            <div>
              <strong>{data.sessions.length}</strong>
              <span>{t('dashboard.teacher.sessions')}</span>
            </div>
            <div>
              <strong>{data.attendance.filter((record) => record.present).length}</strong>
              <span>{t('dashboard.teacher.attendances')}</span>
            </div>
            <div>
              <strong>
                {Math.round(
                  data.sessions.reduce((sum, session) => sum + session.duration_minutes, 0) / 60,
                )}
              </strong>
              <span>{t('dashboard.teacher.teachingHours')}</span>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <h3>{t('dashboard.teacher.habitats')}</h3>
          </div>
          <div className="tag-list">
            {[...new Set(data.sessions.map((session) => session.habitat).filter(Boolean))].map(
              (habitat) => (
                <span className="filter-chip active" key={habitat}>
                  {habitat}
                </span>
              ),
            )}
            {data.sessions.every((session) => !session.habitat) && (
              <p className="muted">{t('dashboard.teacher.habitatsEmpty')}</p>
            )}
          </div>
        </div>
      </section>
      <section className="section panel">
        <div className="panel-head">
          <h3>{t('dashboard.teacher.recent')}</h3>
          <Link className="text-btn" href="/review">
            {t('dashboard.teacher.viewQueue')}
          </Link>
        </div>
        <div className="review-list">
          {pending.length ? (
            pending.slice(0, 4).map((item) => {
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
    </div>
  )
}

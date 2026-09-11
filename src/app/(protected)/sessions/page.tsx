import type { Metadata } from 'next'
import { SessionForm } from '@/components/sessions/session-form'
import { requireProfile } from '@/lib/auth'
import { getWorkspaceData } from '@/lib/data'
import { getLocale, getTranslator } from '@/lib/i18n/server'
import { formatShortMonth } from '@/lib/utils'
import type { UiMessageKey } from '@/lib/i18n/dictionaries/en'
import type { SessionType } from '@/lib/types'

const sessionTypeKey = {
  field: 'session.type.field',
  online: 'session.type.online',
  classroom: 'session.type.classroom',
  community: 'session.type.community',
} as const satisfies Record<SessionType, UiMessageKey>

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t('meta.sessions.title') }
}

export default async function SessionsPage() {
  await requireProfile(['teacher', 'jari_admin'])
  const [t, locale] = await Promise.all([getTranslator(), getLocale()])
  const data = await getWorkspaceData()
  const students = data.people.filter((person) => person.role === 'student')
  const islandNames = new Map(data.islands.map((island) => [island.id, island.name]))

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">{t('sessions.eyebrow')}</span>
          <h1>{t('sessions.heading')}</h1>
          <p>{t('sessions.intro')}</p>
        </div>
      </div>
      <section className="panel">
        <div className="panel-head">
          <h3>{t('sessions.logHeading')}</h3>
          <span className="status earned">{t('sessions.savedToSupabase')}</span>
        </div>
        <SessionForm students={students} islands={data.islands} />
      </section>
      <section className="section panel">
        <div className="panel-head">
          <h3>{t('sessions.recentHeading')}</h3>
          <span className="eyebrow">
            {t('sessions.recordedCount', { count: data.sessions.length })}
          </span>
        </div>
        {data.sessions.length ? (
          <div className="session-list">
            {data.sessions.map((session) => (
              <article className="session-card" key={session.id}>
                <div className="session-date">
                  <strong>{new Date(`${session.occurred_on}T00:00:00`).getDate()}</strong>
                  <span>
                    {formatShortMonth(new Date(`${session.occurred_on}T00:00:00`), locale)}
                  </span>
                </div>
                <div>
                  <span className="eyebrow">
                    {t(sessionTypeKey[session.session_type])} ·{' '}
                    {islandNames.get(session.island_id ?? '') ?? t('sessions.generalLsk')}
                  </span>
                  <h3>{session.title}</h3>
                  <p>
                    {session.teacher_reflection ||
                      session.field_observation ||
                      t('sessions.noReflection')}
                  </p>
                </div>
                <div className="session-metrics">
                  <strong>{session.attendanceCount}</strong>
                  <span>{t('sessions.students')}</span>
                  <strong>{session.duration_minutes}</strong>
                  <span>{t('sessions.minutes')}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <span>◷</span>
            <strong>{t('sessions.emptyTitle')}</strong>
            <p>{t('sessions.emptyBody')}</p>
          </div>
        )}
      </section>
    </div>
  )
}

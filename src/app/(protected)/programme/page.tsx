import type { Metadata } from 'next'
import { requireProfile } from '@/lib/auth'
import { getWorkspaceData } from '@/lib/data'
import { StatCard } from '@/components/ui/stat-card'
import { getTranslator } from '@/lib/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t('meta.programme.title') }
}

export default async function ProgrammePage() {
  await requireProfile(['jari_admin'])
  const t = await getTranslator()
  const data = await getWorkspaceData()
  const students = data.people.filter((person) => person.role === 'student')
  const teachers = data.people.filter((person) => person.role === 'teacher')
  const schools = new Map(
    data.people
      .filter((person) => person.schools)
      .map((person) => [person.schools!.id, person.schools!]),
  )
  const villages = new Set(
    data.people.map((person) => person.village ?? person.schools?.village).filter(Boolean),
  )
  const attendance = data.attendance.filter((record) => record.present).length
  const learningMinutes = data.sessions.reduce(
    (sum, session) => sum + session.duration_minutes * session.attendanceCount,
    0,
  )
  const explorerBadges = data.awards.filter((award) => award.award_tier === 'explorer').length
  const learningBadges = data.awards.filter((award) => award.award_tier === 'learning').length

  return (
    <div className="page">
      <section className="teacher-hero programme-hero">
        <div>
          <span className="eyebrow">{t('programme.eyebrow')}</span>
          <h1>{t('programme.heading')}</h1>
          <p>{t('programme.intro')}</p>
        </div>
        <div className="queue-pill">
          <span>
            {t('programme.pilotLine1')}
            <br />
            {t('programme.pilotLine2')}
          </span>
          <strong>{data.islands.length}</strong>
        </div>
      </section>
      <section className="section">
        <div className="stat-grid">
          <StatCard icon="⌂" value={schools.size} label={t('programme.stat.schools')} />
          <StatCard icon="◎" value={villages.size} label={t('programme.stat.villages')} />
          <StatCard icon="♙" value={students.length} label={t('programme.stat.students')} />
          <StatCard icon="✎" value={teachers.length} label={t('programme.stat.teachers')} />
        </div>
      </section>
      <section className="section two-col">
        <div className="panel">
          <div className="panel-head">
            <h3>{t('programme.participation')}</h3>
          </div>
          <div className="impact-grid">
            <div>
              <strong>{data.sessions.length}</strong>
              <span>{t('programme.sessions')}</span>
            </div>
            <div>
              <strong>
                {data.sessions.filter((session) => session.session_type === 'field').length}
              </strong>
              <span>{t('programme.fieldVisits')}</span>
            </div>
            <div>
              <strong>{attendance}</strong>
              <span>{t('programme.attendances')}</span>
            </div>
            <div>
              <strong>{Math.round(learningMinutes / 60)}</strong>
              <span>{t('programme.learningHours')}</span>
            </div>
            <div>
              <strong>{data.submissions.length}</strong>
              <span>{t('programme.documented')}</span>
            </div>
            <div>
              <strong>{data.submissions.filter((item) => item.status === 'pending').length}</strong>
              <span>{t('programme.awaitingReview')}</span>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <h3>{t('programme.pathways')}</h3>
          </div>
          <div className="pathway-summary">
            <div className="badge-medal">✦</div>
            <div>
              <strong>{learningBadges}</strong>
              <span>{t('programme.learningBadges')}</span>
            </div>
            <div>
              <strong>{explorerBadges}</strong>
              <span>{t('programme.explorerBadges')}</span>
            </div>
          </div>
        </div>
      </section>
      <section className="section panel">
        <div className="panel-head">
          <h3>{t('programme.reach')}</h3>
        </div>
        <table className="student-table">
          <thead>
            <tr>
              <th>{t('programme.col.school')}</th>
              <th>{t('programme.col.village')}</th>
              <th>{t('programme.col.students')}</th>
              <th>{t('programme.col.teachers')}</th>
            </tr>
          </thead>
          <tbody>
            {[...schools.values()].map((school) => (
              <tr key={school.id}>
                <td>
                  <strong>{school.name}</strong>
                </td>
                <td>{school.village ?? '—'}</td>
                <td>{students.filter((student) => student.school_id === school.id).length}</td>
                <td>{teachers.filter((teacher) => teacher.school_id === school.id).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

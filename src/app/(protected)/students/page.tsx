import type { Metadata } from 'next'
import { getWorkspaceData } from '@/lib/data'
import { requireProfile } from '@/lib/auth'
import { getTranslator } from '@/lib/i18n/server'
import { initials } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t('meta.students.title') }
}

export default async function StudentsPage() {
  await requireProfile(['teacher', 'jari_admin'])
  const t = await getTranslator()
  const data = await getWorkspaceData()
  const { activities } = data
  const students = data.people.filter((person) => person.role === 'student')
  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">{data.profile.schools?.name ?? t('brand.name')}</span>
          <h1>{t('students.heading')}</h1>
          <p>{t('students.intro')}</p>
        </div>
      </div>
      <section className="panel">
        <table className="student-table">
          <thead>
            <tr>
              <th>{t('students.col.student')}</th>
              <th>{t('students.col.class')}</th>
              <th>{t('students.col.activities')}</th>
              <th>{t('students.col.badges')}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const complete = data.submissions.filter(
                (item) => item.student_id === student.id && item.status === 'approved',
              ).length
              const awards = data.awards.filter((item) => item.student_id === student.id).length
              return (
                <tr key={student.id}>
                  <td>
                    <div className="student-name">
                      <span className="avatar">{initials(student.full_name)}</span>
                      {student.full_name}
                    </div>
                  </td>
                  <td>{student.grade ?? '—'}</td>
                  <td>
                    {complete} / {activities.length}
                  </td>
                  <td>{awards}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="empty">
            <span>♙</span>
            <strong>{t('students.emptyTitle')}</strong>
            <p>{t('students.emptyBody')}</p>
          </div>
        )}
      </section>
    </div>
  )
}

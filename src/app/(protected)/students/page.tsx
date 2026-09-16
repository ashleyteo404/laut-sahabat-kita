import type { Metadata } from 'next'
import Link from 'next/link'
import { ResetPinButton } from '@/components/accounts/reset-pin-button'
import { StudentRowActions } from '@/components/accounts/student-row-actions'
import { getWorkspaceData } from '@/lib/data'
import { requireProfile } from '@/lib/auth'
import { getTranslator } from '@/lib/i18n/server'
import { isAccountAdminConfigured } from '@/lib/supabase/admin'
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
  const canManageAccounts = isAccountAdminConfigured()

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">{data.profile.schools?.name ?? t('brand.name')}</span>
          <h1>{t('students.heading')}</h1>
          <p>{t('students.intro')}</p>
        </div>
        <Link className="btn" href="/students/add">
          {t('students.addButton')}
        </Link>
      </div>
      <section className="panel">
        <div className="table-scroll">
          <table className="student-table">
            <thead>
              <tr>
                <th>{t('students.col.student')}</th>
                <th>{t('students.col.class')}</th>
                <th>{t('students.col.username')}</th>
                <th>{t('students.col.activities')}</th>
                <th>{t('students.col.badges')}</th>
                {canManageAccounts ? (
                  <>
                    <th>{t('students.col.signIn')}</th>
                    <th>{t('students.col.manage')}</th>
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const complete = data.submissions.filter(
                  (item) => item.student_id === student.id && item.status === 'approved',
                ).length
                const awards = data.awards.filter((item) => item.student_id === student.id).length
                // Deleting cascades to every record referencing the student, so it is only offered
                // while there is nothing to lose. The server checks this again.
                const hasWork =
                  data.submissions.some((item) => item.student_id === student.id) ||
                  data.awards.some((item) => item.student_id === student.id) ||
                  data.attendance.some((item) => item.student_id === student.id)
                return (
                  <tr key={student.id}>
                    <td>
                      <div className="student-name">
                        <span className="avatar">{initials(student.full_name)}</span>
                        {student.full_name}
                      </div>
                    </td>
                    <td>{student.grade ?? '—'}</td>
                    <td className={student.username ? 'credential' : 'muted'}>
                      {student.username ?? t('accounts.emailSignIn')}
                    </td>
                    <td>
                      {complete} / {activities.length}
                    </td>
                    <td>{awards}</td>
                    {canManageAccounts ? (
                      <>
                        <td>
                          {/* PIN reset applies to username accounts; email accounts stay with the admin. */}
                          {student.username ? (
                            <ResetPinButton
                              studentId={student.id}
                              studentName={student.full_name}
                            />
                          ) : null}
                        </td>
                        <td>
                          <StudentRowActions
                            student={{
                              id: student.id,
                              fullName: student.full_name,
                              grade: student.grade,
                            }}
                            canDelete={!hasWork}
                          />
                        </td>
                      </>
                    ) : null}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
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

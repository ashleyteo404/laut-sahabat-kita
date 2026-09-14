import type { Metadata } from 'next'
import Link from 'next/link'
import { AddStudentsForm } from '@/components/accounts/add-students-form'
import { MAX_STUDENTS_PER_BATCH } from '@/lib/accounts/credentials'
import { requireProfile } from '@/lib/auth'
import { getTranslator } from '@/lib/i18n/server'
import { isAccountAdminConfigured } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// A full class is one admin API call per student, so allow longer than the default duration.
export const maxDuration = 60

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t('meta.studentsAdd.title') }
}

export default async function AddStudentsPage() {
  const profile = await requireProfile(['teacher', 'jari_admin'])
  const t = await getTranslator()
  const configured = isAccountAdminConfigured()

  let schools: { id: string; name: string }[] = []
  if (configured && profile.role === 'jari_admin') {
    const supabase = await createClient()
    const { data } = await supabase.from('schools').select('id, name').order('name')
    schools = data ?? []
  }

  const blocker = !configured
    ? 'notConfigured'
    : profile.role === 'teacher' && !profile.school_id
      ? 'noSchool'
      : profile.role === 'jari_admin' && schools.length === 0
        ? 'noSchools'
        : null

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">{t('studentsAdd.eyebrow')}</span>
          <h1>{t('studentsAdd.heading')}</h1>
          <p>{t('studentsAdd.intro')}</p>
        </div>
        <Link className="btn outline no-print" href="/students">
          {t('studentsAdd.back')}
        </Link>
      </div>
      {blocker === 'notConfigured' ? (
        <section className="panel empty">
          <span>⚙</span>
          <strong>{t('studentsAdd.notConfiguredTitle')}</strong>
          <p>{t('studentsAdd.notConfiguredBody')}</p>
        </section>
      ) : blocker === 'noSchool' ? (
        <section className="panel empty">
          <span>⌂</span>
          <strong>{t('studentsAdd.noSchoolTitle')}</strong>
          <p>{t('studentsAdd.noSchoolBody')}</p>
        </section>
      ) : blocker === 'noSchools' ? (
        <section className="panel empty">
          <span>⌂</span>
          <strong>{t('studentsAdd.noSchoolsTitle')}</strong>
          <p>{t('studentsAdd.noSchoolsBody')}</p>
        </section>
      ) : (
        <AddStudentsForm
          role={profile.role === 'jari_admin' ? 'jari_admin' : 'teacher'}
          schools={schools}
          schoolName={profile.schools?.name ?? null}
          maxRows={MAX_STUDENTS_PER_BATCH}
        />
      )}
    </div>
  )
}

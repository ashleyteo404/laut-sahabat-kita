import type { Metadata } from 'next'
import { StudentDashboard } from '@/components/dashboard/student-dashboard'
import { TeacherDashboard } from '@/components/dashboard/teacher-dashboard'
import { getWorkspaceData } from '@/lib/data'
import { getTranslator } from '@/lib/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t('meta.dashboard.title') }
}

export default async function DashboardPage() {
  const data = await getWorkspaceData()
  return data.profile.role === 'student' ? (
    <StudentDashboard data={data} />
  ) : (
    <TeacherDashboard data={data} />
  )
}

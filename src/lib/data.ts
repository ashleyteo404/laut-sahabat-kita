import { requireProfile } from '@/lib/auth'
import { getFallbackContent } from '@/lib/content'
import { getLocale, getTranslator } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { createClient } from '@/lib/supabase/server'
import type {
  Activity,
  Badge,
  BadgeTier,
  Island,
  LearningMode,
  LearningSession,
  Profile,
  SessionAttendance,
  StudentBadge,
  StudentLearningSummary,
  Submission,
  WorkspaceData,
} from '@/lib/types'

interface ActivityRow {
  id: string
  island_id: string
  badge_id: string
  title: string
  title_ind: string | null
  description: string | null
  description_ind: string | null
  mode: LearningMode
  duration_minutes: number
  steps: unknown
  steps_ind: unknown
}

interface IslandRow {
  id: string
  name: string
  name_ind: string | null
  tagline: string | null
  tagline_ind: string | null
  description: string | null
  description_ind: string | null
}

interface BadgeRow {
  id: string
  name: string
  name_ind: string | null
  icon: string | null
  description: string | null
  description_ind: string | null
}

/** Indonesian when a translation exists, English otherwise. */
function pickText(english: string | null, indonesian: string | null, locale: Locale): string {
  const preferred = locale === 'id' ? indonesian : english
  return preferred?.trim() || english?.trim() || ''
}

/**
 * Falls back as a whole array rather than element by element: a half-translated ordered instruction
 * list is worse than a consistently English one. `activities_steps_ind_shape` enforces equal length.
 */
function pickSteps(english: unknown, indonesian: unknown, locale: Locale): string[] {
  const preferred = locale === 'id' && Array.isArray(indonesian) ? indonesian : english
  return Array.isArray(preferred) ? preferred.map(String) : []
}

interface StudentLearningSummaryRow {
  session_count: number | string | null
  learning_minutes: number | string | null
  habitats: unknown
}

function mapContent(
  islandRows: IslandRow[],
  activityRows: ActivityRow[],
  badgeRows: BadgeRow[],
  locale: Locale,
  badgeFallbackName: string,
) {
  const islands: Island[] = islandRows.map((row) => ({
    id: row.id,
    name: pickText(row.name, row.name_ind, locale),
    tagline: pickText(row.tagline, row.tagline_ind, locale),
    description: pickText(row.description, row.description_ind, locale),
    className: row.id === 'bidara' ? '' : row.id,
  }))
  const badges: Badge[] = badgeRows.map((row) => ({
    id: row.id,
    name: pickText(row.name, row.name_ind, locale),
    icon: row.icon ?? '✦',
    description: pickText(row.description, row.description_ind, locale),
  }))
  const badgeById = new Map(badges.map((badge) => [badge.id, badge]))
  const activities: Activity[] = activityRows.map((row) => ({
    id: row.id,
    islandId: row.island_id,
    badgeId: row.badge_id,
    badgeName: badgeById.get(row.badge_id)?.name ?? badgeFallbackName,
    title: pickText(row.title, row.title_ind, locale),
    mode: row.mode,
    icon: badgeById.get(row.badge_id)?.icon ?? '✦',
    minutes: row.duration_minutes,
    description: pickText(row.description, row.description_ind, locale),
    steps: pickSteps(row.steps, row.steps_ind, locale),
  }))

  return { islands, activities, badges }
}

export async function getWorkspaceData(): Promise<WorkspaceData> {
  const profile = await requireProfile()
  const [locale, t] = await Promise.all([getLocale(), getTranslator()])
  const supabase = await createClient()

  const [submissionResult, peopleResult, islandResult, activityResult, badgeResult] =
    await Promise.all([
      supabase
        .from('submissions')
        .select(
          'id, client_submission_id, student_id, activity_id, reflection, evidence_path, status, review_note, created_at, reviewed_at',
        )
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select(
          'id, full_name, role, school_id, village, grade, joined_year, schools(id, name, village)',
        )
        .order('full_name'),
      supabase
        .from('islands')
        .select('id, name, name_ind, tagline, tagline_ind, description, description_ind')
        .order('sort_order'),
      supabase
        .from('activities')
        .select(
          'id, island_id, badge_id, title, title_ind, description, description_ind, mode, duration_minutes, steps, steps_ind',
        )
        .eq('published', true)
        .order('sort_order'),
      supabase
        .from('badges')
        .select('id, name, name_ind, description, description_ind, icon')
        .order('name'),
    ])

  if (submissionResult.error) throw submissionResult.error
  if (peopleResult.error) throw peopleResult.error

  const content =
    islandResult.error || activityResult.error || badgeResult.error
      ? getFallbackContent(locale)
      : mapContent(
          (islandResult.data ?? []) as IslandRow[],
          (activityResult.data ?? []) as ActivityRow[],
          (badgeResult.data ?? []) as BadgeRow[],
          locale,
          t('content.badgeFallback'),
        )

  const people = (peopleResult.data ?? []) as unknown as Profile[]
  const names = new Map(people.map((person) => [person.id, person.full_name]))
  const submissions = (await Promise.all(
    (submissionResult.data ?? []).map(async (submission) => {
      const signedUrl = submission.evidence_path
        ? await supabase.storage.from('evidence').createSignedUrl(submission.evidence_path, 3600)
        : null

      return {
        ...submission,
        evidenceUrl: signedUrl?.data?.signedUrl ?? null,
        studentName: names.get(submission.student_id) ?? t('content.studentFallback'),
      }
    }),
  )) as Submission[]

  const awardResult = await supabase
    .from('student_badges')
    .select('student_id, badge_id, award_tier, awarded_at')
  let awards: StudentBadge[]

  if (awardResult.error && ['42703', 'PGRST204'].includes(awardResult.error.code)) {
    const legacyAwards = await supabase
      .from('student_badges')
      .select('student_id, badge_id, awarded_at')
    if (legacyAwards.error) throw legacyAwards.error
    awards = (legacyAwards.data ?? []).map((award) => ({
      ...award,
      award_tier: 'learning' as BadgeTier,
    }))
  } else {
    if (awardResult.error) throw awardResult.error
    awards = (awardResult.data ?? []) as StudentBadge[]
  }

  let sessions: LearningSession[] = []
  let attendance: SessionAttendance[] = []
  let studentLearning: StudentLearningSummary = {
    session_count: 0,
    learning_minutes: 0,
    habitats: [],
  }
  if (profile.role !== 'student') {
    const [sessionResult, attendanceResult] = await Promise.all([
      supabase
        .from('learning_sessions')
        .select(
          'id, school_id, teacher_id, island_id, title, session_type, occurred_on, duration_minutes, habitat, teacher_reflection, field_observation, created_at',
        )
        .order('occurred_on', { ascending: false }),
      supabase.from('session_attendance').select('session_id, student_id, present'),
    ])

    if (!sessionResult.error && !attendanceResult.error) {
      attendance = (attendanceResult.data ?? []) as SessionAttendance[]
      sessions = (sessionResult.data ?? []).map((session) => ({
        ...session,
        attendanceCount: attendance.filter(
          (record) => record.session_id === session.id && record.present,
        ).length,
      })) as LearningSession[]
    }
  } else {
    const summaryResult = await supabase.rpc('get_my_learning_record')
    if (!summaryResult.error && summaryResult.data?.[0]) {
      const summary = summaryResult.data[0] as StudentLearningSummaryRow
      studentLearning = {
        session_count: Number(summary.session_count ?? 0),
        learning_minutes: Number(summary.learning_minutes ?? 0),
        habitats: Array.isArray(summary.habitats)
          ? summary.habitats.filter((habitat): habitat is string => typeof habitat === 'string')
          : [],
      }
    }
  }

  return {
    profile,
    submissions,
    people,
    awards,
    sessions,
    attendance,
    studentLearning,
    ...content,
  }
}

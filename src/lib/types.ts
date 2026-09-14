import type { ActionMessageKey } from '@/lib/i18n/dictionaries/en'

export type UserRole = 'student' | 'teacher' | 'jari_admin'
export type LearningMode = 'online' | 'field'
export type SubmissionStatus = 'pending' | 'approved' | 'returned'
export type BadgeTier = 'learning' | 'explorer'
export type SessionType = 'online' | 'classroom' | 'field' | 'community'

export interface School {
  id: string
  name: string
  village: string | null
}

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  school_id: string | null
  village: string | null
  grade: string | null
  /** Set for students with username + PIN sign-in; null for staff and email-based accounts. */
  username: string | null
  joined_year: number
  schools: School | null
}

export interface Island {
  id: string
  name: string
  tagline: string
  description: string
  className: string
}

export interface Activity {
  id: string
  islandId: string
  title: string
  mode: LearningMode
  icon: string
  minutes: number
  badgeId: string
  badgeName: string
  description: string
  steps: string[]
}

export interface Badge {
  id: string
  name: string
  icon: string
  description: string
}

export interface Submission {
  id: string
  client_submission_id: string
  student_id: string
  activity_id: string
  reflection: string
  evidence_path: string | null
  evidenceUrl: string | null
  status: SubmissionStatus
  review_note: string | null
  created_at: string
  reviewed_at: string | null
  studentName: string
}

export interface StudentBadge {
  student_id: string
  badge_id: string
  award_tier: BadgeTier
  awarded_at: string
}

export interface LearningSession {
  id: string
  school_id: string
  teacher_id: string
  island_id: string | null
  title: string
  session_type: SessionType
  occurred_on: string
  duration_minutes: number
  habitat: string | null
  teacher_reflection: string | null
  field_observation: string | null
  created_at: string
  attendanceCount: number
}

export interface SessionAttendance {
  session_id: string
  student_id: string
  present: boolean
}

export interface StudentLearningSummary {
  session_count: number
  learning_minutes: number
  habitats: string[]
}

export interface WorkspaceData {
  profile: Profile
  submissions: Submission[]
  people: Profile[]
  awards: StudentBadge[]
  islands: Island[]
  activities: Activity[]
  badges: Badge[]
  sessions: LearningSession[]
  attendance: SessionAttendance[]
  studentLearning: StudentLearningSummary
}

export interface ActionState {
  status: 'idle' | 'success' | 'error'
  /**
   * A dictionary key rather than a resolved string: queued-submission messages are stored in
   * IndexedDB and rendered later, possibly after the reader has switched language.
   */
  messageKey?: ActionMessageKey
  messageValues?: Record<string, string | number>
}

/** Returned once to the teacher who created the account. The PIN is never stored in plain text. */
export interface CreatedStudentCredential {
  row: number
  fullName: string
  grade: string | null
  username: string
  pin: string
}

export interface StudentRowProblem {
  /** 1-based position in the submitted table, so the form can point at the right row. */
  row: number
  fullName: string
  messageKey: ActionMessageKey
}

export interface CreateStudentsState extends ActionState {
  created: CreatedStudentCredential[]
  problems: StudentRowProblem[]
  /** False when validation rejected the batch before any account was created. */
  completed: boolean
}

export interface ResetPinState extends ActionState {
  pin?: string
}

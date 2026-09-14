import 'server-only'

import { randomInt } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import {
  isAcceptablePin,
  isValidUsername,
  MAX_FULL_NAME_LENGTH,
  MAX_GRADE_LENGTH,
  MAX_STUDENTS_PER_BATCH,
  normalizeUsername,
  studentEmailFor,
  usernameBase,
} from '@/lib/accounts/credentials'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { ActionMessageKey } from '@/lib/i18n/dictionaries/en'
import type {
  CreatedStudentCredential,
  CreateStudentsState,
  Profile,
  ResetPinState,
  StudentRowProblem,
} from '@/lib/types'

/**
 * Teacher-managed student accounts.
 *
 * Callers must already have authorized the actor with `requireProfile`. Everything trust-sensitive is
 * decided here from the actor's own profile, never from the request: the role is always `student`,
 * and a teacher's students always land in the teacher's school.
 */

const submittedRowSchema = z.object({
  fullName: z.string().max(500),
  grade: z.string().max(100),
  username: z.string().max(100),
  pin: z.string().max(100),
})

/** Blank rows are allowed through and skipped, so the cap on raw rows is looser than the real one. */
export const submittedRowsSchema = z.array(submittedRowSchema).max(MAX_STUDENTS_PER_BATCH * 4)

export type SubmittedRow = z.infer<typeof submittedRowSchema>

interface PreparedRow {
  row: number
  fullName: string
  grade: string | null
  username: string
  usernameChosen: boolean
  pin: string
}

const AUTO_USERNAME_ATTEMPTS = 5

function generatePin(): string {
  for (;;) {
    const pin = String(randomInt(0, 1_000_000)).padStart(6, '0')
    if (isAcceptablePin(pin)) return pin
  }
}

function suggestUsername(fullName: string): string {
  return `${usernameBase(fullName)}${randomInt(100, 1000)}`
}

function failedState(
  messageKey: ActionMessageKey,
  extra: Partial<CreateStudentsState> = {},
): CreateStudentsState {
  return { status: 'error', messageKey, created: [], problems: [], completed: false, ...extra }
}

async function resolveSchoolId(
  actor: Profile,
  requestedSchoolId: unknown,
): Promise<{ schoolId: string } | { messageKey: ActionMessageKey }> {
  if (actor.role === 'teacher') {
    // Deliberately ignores any school sent by the client.
    return actor.school_id
      ? { schoolId: actor.school_id }
      : { messageKey: 'action.accounts.noSchool' }
  }
  if (actor.role !== 'jari_admin') return { messageKey: 'action.accounts.notAllowed' }

  const parsed = z.uuid().safeParse(requestedSchoolId)
  if (!parsed.success) return { messageKey: 'action.accounts.invalidSchool' }

  const supabase = await createClient()
  const { data } = await supabase.from('schools').select('id').eq('id', parsed.data).maybeSingle()
  return data ? { schoolId: data.id } : { messageKey: 'action.accounts.invalidSchool' }
}

function prepareRows(rows: SubmittedRow[]): {
  prepared: PreparedRow[]
  problems: StudentRowProblem[]
} {
  const prepared: PreparedRow[] = []
  const problems: StudentRowProblem[] = []

  rows.forEach((raw, index) => {
    const row = index + 1
    const fullName = raw.fullName.trim().replace(/\s+/g, ' ')
    const grade = raw.grade.trim()
    const username = normalizeUsername(raw.username)
    const pin = raw.pin.trim()
    if (!fullName && !grade && !username && !pin) return

    const report = (messageKey: ActionMessageKey) => problems.push({ row, fullName, messageKey })
    if (!fullName) return report('action.accounts.nameRequired')
    if (fullName.length > MAX_FULL_NAME_LENGTH) return report('action.accounts.nameTooLong')
    if (grade.length > MAX_GRADE_LENGTH) return report('action.accounts.gradeTooLong')
    if (username && !isValidUsername(username)) return report('action.accounts.usernameInvalid')
    if (pin && !isAcceptablePin(pin)) return report('action.accounts.pinInvalid')

    prepared.push({
      row,
      fullName,
      grade: grade || null,
      username,
      usernameChosen: Boolean(username),
      pin: pin || generatePin(),
    })
  })

  const counts = new Map<string, number>()
  for (const entry of prepared) {
    if (entry.usernameChosen) counts.set(entry.username, (counts.get(entry.username) ?? 0) + 1)
  }
  for (const entry of prepared) {
    if ((counts.get(entry.username) ?? 0) > 1) {
      problems.push({
        row: entry.row,
        fullName: entry.fullName,
        messageKey: 'action.accounts.usernameDuplicate',
      })
    }
  }

  return { prepared, problems: problems.sort((left, right) => left.row - right.row) }
}

async function findTakenUsernames(
  admin: SupabaseClient,
  usernames: string[],
): Promise<Set<string>> {
  if (usernames.length === 0) return new Set()
  const { data, error } = await admin.from('profiles').select('username').in('username', usernames)
  if (error) throw error
  return new Set((data ?? []).map((profile) => String(profile.username)))
}

type CreateOutcome =
  { ok: true; credential: CreatedStudentCredential } | { ok: false; messageKey: ActionMessageKey }

async function createOneStudent(
  admin: SupabaseClient,
  entry: PreparedRow,
  schoolId: string,
  reserved: Set<string>,
): Promise<CreateOutcome> {
  const attempts = entry.usernameChosen ? 1 : AUTO_USERNAME_ATTEMPTS

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const username = entry.usernameChosen ? entry.username : suggestUsername(entry.fullName)
    if (!entry.usernameChosen) {
      if (reserved.has(username)) continue
      if ((await findTakenUsernames(admin, [username])).size > 0) continue
    }

    const { data, error } = await admin.auth.admin.createUser({
      email: studentEmailFor(username),
      password: entry.pin,
      email_confirm: true,
    })
    if (error || !data.user) {
      if (error?.code === 'email_exists') {
        if (entry.usernameChosen) return { ok: false, messageKey: 'action.accounts.usernameTaken' }
        continue
      }
      return { ok: false, messageKey: 'action.accounts.createFailed' }
    }

    const userId = data.user.id
    // The auth trigger has already inserted a default profile; upsert also covers projects where
    // the trigger is missing.
    const { error: profileError } = await admin.from('profiles').upsert(
      {
        id: userId,
        full_name: entry.fullName,
        grade: entry.grade,
        username,
        role: 'student',
        school_id: schoolId,
      },
      { onConflict: 'id' },
    )
    if (profileError) {
      // Never leave a login without a correctly assigned profile behind.
      await admin.auth.admin.deleteUser(userId)
      if (profileError.code === '23505') {
        if (entry.usernameChosen) return { ok: false, messageKey: 'action.accounts.usernameTaken' }
        continue
      }
      return { ok: false, messageKey: 'action.accounts.createFailed' }
    }

    reserved.add(username)
    return {
      ok: true,
      credential: {
        row: entry.row,
        fullName: entry.fullName,
        grade: entry.grade,
        username,
        pin: entry.pin,
      },
    }
  }

  return { ok: false, messageKey: 'action.accounts.createFailed' }
}

export async function createStudentAccounts(
  actor: Profile,
  input: { schoolId: unknown; rows: SubmittedRow[] },
): Promise<CreateStudentsState> {
  const admin = createAdminClient()
  if (!admin) return failedState('action.accounts.notConfigured')

  const school = await resolveSchoolId(actor, input.schoolId)
  if ('messageKey' in school) return failedState(school.messageKey)

  // Phase 1: validate everything and create nothing if any row is wrong, so a teacher never has to
  // work out which half of a class list already exists.
  const { prepared, problems } = prepareRows(input.rows)
  if (problems.length === 0 && prepared.length === 0) return failedState('action.accounts.noRows')
  if (prepared.length > MAX_STUDENTS_PER_BATCH) {
    return failedState('action.accounts.tooManyRows', {
      messageValues: { max: MAX_STUDENTS_PER_BATCH },
    })
  }

  let taken: Set<string>
  try {
    taken = await findTakenUsernames(
      admin,
      prepared.filter((entry) => entry.usernameChosen).map((entry) => entry.username),
    )
  } catch {
    return failedState('action.accounts.createFailed')
  }
  for (const entry of prepared) {
    if (entry.usernameChosen && taken.has(entry.username)) {
      problems.push({
        row: entry.row,
        fullName: entry.fullName,
        messageKey: 'action.accounts.usernameTaken',
      })
    }
  }
  if (problems.length > 0) {
    return failedState('action.accounts.fixRows', {
      problems: problems.sort((left, right) => left.row - right.row),
    })
  }

  // Phase 2: auth user creation is not transactional, so each row succeeds or fails on its own and
  // the result reports exactly what happened. Sequential to respect admin API rate limits.
  const created: CreatedStudentCredential[] = []
  const failures: StudentRowProblem[] = []
  const reserved = new Set(
    prepared.filter((entry) => entry.usernameChosen).map((entry) => entry.username),
  )

  for (const entry of prepared) {
    let outcome: CreateOutcome
    try {
      outcome = await createOneStudent(admin, entry, school.schoolId, reserved)
    } catch {
      outcome = { ok: false, messageKey: 'action.accounts.createFailed' }
    }
    if (outcome.ok) created.push(outcome.credential)
    else failures.push({ row: entry.row, fullName: entry.fullName, messageKey: outcome.messageKey })
  }

  if (failures.length === 0) {
    return {
      status: 'success',
      messageKey: 'action.accounts.created',
      messageValues: { count: created.length },
      created,
      problems: [],
      completed: true,
    }
  }

  return {
    status: created.length > 0 ? 'success' : 'error',
    messageKey: created.length > 0 ? 'action.accounts.partial' : 'action.accounts.noneCreated',
    messageValues: { created: created.length, failed: failures.length },
    created,
    problems: failures,
    completed: true,
  }
}

export async function resetStudentPin(actor: Profile, studentId: unknown): Promise<ResetPinState> {
  const admin = createAdminClient()
  if (!admin) return { status: 'error', messageKey: 'action.accounts.notConfigured' }
  if (actor.role !== 'teacher' && actor.role !== 'jari_admin') {
    return { status: 'error', messageKey: 'action.accounts.notAllowed' }
  }

  const parsed = z.uuid().safeParse(studentId)
  if (!parsed.success) return { status: 'error', messageKey: 'action.accounts.resetNotAllowed' }

  // Read through the signed-in user's own client, so row-level security decides what is visible
  // before the secret-key client is ever used.
  const supabase = await createClient()
  const { data: student } = await supabase
    .from('profiles')
    .select('id, role, school_id')
    .eq('id', parsed.data)
    .maybeSingle()

  const sameSchool =
    actor.role === 'jari_admin' || (actor.school_id && student?.school_id === actor.school_id)
  if (!student || student.role !== 'student' || !sameSchool) {
    return { status: 'error', messageKey: 'action.accounts.resetNotAllowed' }
  }

  const pin = generatePin()
  const { error } = await admin.auth.admin.updateUserById(student.id, { password: pin })
  if (error) return { status: 'error', messageKey: 'action.accounts.resetFailed' }

  return { status: 'success', messageKey: 'action.accounts.resetDone', pin }
}

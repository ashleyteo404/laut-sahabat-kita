/**
 * Rules for student sign-in credentials, shared by the browser (form and CSV checks) and the server
 * (the authoritative checks). Contains no randomness and no secrets, so it is safe to import anywhere.
 */

/** Must match the `profiles_username_format` constraint in `supabase/schema.sql`. */
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,31}$/

/**
 * `.invalid` is reserved (RFC 2606) and can never receive mail. Supabase Auth requires an email, so a
 * student's login address is derived from the username instead of being stored or looked up.
 */
export const STUDENT_EMAIL_DOMAIN = 'students.laut-sahabat-kita.invalid'

export const MAX_STUDENTS_PER_BATCH = 60
export const MAX_FULL_NAME_LENGTH = 80
export const MAX_GRADE_LENGTH = 10

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase()
}

export function isValidUsername(value: string): boolean {
  return USERNAME_PATTERN.test(value)
}

/** Deterministic, so signing in needs no lookup: anonymous visitors cannot read profiles. */
export function studentEmailFor(username: string): string {
  return `${normalizeUsername(username)}@${STUDENT_EMAIL_DOMAIN}`
}

/**
 * The readable part of a suggested username: the first name with accents removed, lowercased and
 * reduced to letters and digits. The caller appends random digits.
 *
 * Balinese and Sasak names often open with a short title word ("I Wayan", "Ni Luh", "Lalu"), so the
 * first word of at least three letters is preferred over a literal first word.
 */
export function usernameBase(fullName: string): string {
  const words = fullName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9]/g, '').slice(0, 24))
    .filter(Boolean)
  return words.find((word) => word.length >= 3) ?? words.find((word) => word.length >= 2) ?? 'siswa'
}

/** Six digits, not all the same and not a straight run such as 123456 or 987654. */
export function isAcceptablePin(pin: string): boolean {
  if (!/^\d{6}$/.test(pin)) return false
  if (/^(\d)\1{5}$/.test(pin)) return false

  const steps = new Set<number>()
  for (let index = 1; index < pin.length; index += 1) {
    steps.add(Number(pin[index]) - Number(pin[index - 1]))
  }
  return !(steps.size === 1 && (steps.has(1) || steps.has(-1)))
}

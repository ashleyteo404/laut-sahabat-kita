/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Verifies what the TypeScript compiler cannot.
 *
 * `id.ts` is typed against `en.ts`, so key parity is already a build error. Message *values* are
 * plain strings, so nothing stops a translation from dropping or renaming a `{placeholder}` its
 * English source declares — which renders a literal `{name}` to a student.
 *
 * Reads the dictionaries as text rather than importing them, so it needs no TypeScript runtime.
 */

const { readFileSync } = require('node:fs')
const { join } = require('node:path')

const SECTION = /^\s*\/\/\s*──\s*(.+?)\s*──/
const ENTRY = /^\s*'([^']+)':\s*(.*)$/
const PLACEHOLDER = /\{(\w+)\}/g

function parseDictionary(relativePath) {
  const lines = readFileSync(join(process.cwd(), relativePath), 'utf8').split(/\r?\n/)
  const entries = new Map()
  let section = ''

  for (let index = 0; index < lines.length; index += 1) {
    const sectionMatch = SECTION.exec(lines[index])
    if (sectionMatch) {
      section = sectionMatch[1]
      continue
    }

    const entryMatch = ENTRY.exec(lines[index])
    if (!entryMatch) continue

    const [, key] = entryMatch
    let rest = entryMatch[2].trim()
    // Prettier wraps long values onto the following line.
    if (rest === '' || rest === "'") {
      index += 1
      rest = (lines[index] ?? '').trim()
    }

    const valueMatch = /^'(.*)',?$/.exec(rest)
    if (valueMatch) entries.set(key, { section, value: valueMatch[1] })
  }

  return entries
}

function placeholdersOf(value) {
  return new Set(Array.from(value.matchAll(PLACEHOLDER), (match) => match[1]))
}

function describe(set) {
  return set.size ? [...set].sort().join(', ') : '(none)'
}

function main() {
  const english = parseDictionary('src/lib/i18n/dictionaries/en.ts')
  const indonesian = parseDictionary('src/lib/i18n/dictionaries/id.ts')

  if (english.size === 0) {
    throw new Error('Parsed zero English messages. The dictionary format may have changed.')
  }

  const failures = []

  for (const [key, { value }] of english) {
    const translation = indonesian.get(key)
    if (!translation) {
      failures.push(`${key}: missing from id.ts`)
      continue
    }

    const expected = placeholdersOf(value)
    const actual = placeholdersOf(translation.value)
    const same = expected.size === actual.size && [...expected].every((name) => actual.has(name))
    if (!same) {
      failures.push(`${key}: placeholders en=${describe(expected)} id=${describe(actual)}`)
    }
  }

  for (const key of indonesian.keys()) {
    if (!english.has(key)) failures.push(`${key}: present in id.ts but not in en.ts`)
  }

  if (failures.length > 0) {
    console.error(`i18n check failed (${failures.length} problem(s)):`)
    for (const failure of failures) console.error(`  ${failure}`)
    process.exitCode = 1
    return
  }

  console.log(`i18n check passed: ${english.size} messages, placeholders consistent.`)
}

main()

import { MAX_STUDENTS_PER_BATCH } from '@/lib/accounts/credentials'

/**
 * Class-list CSV parsing for teacher-managed accounts. Pure and dependency-free, so it runs in the
 * browser: a teacher reviews the parsed rows before anything is sent to the server, which validates
 * them again regardless.
 */

export const CSV_COLUMNS = ['full_name', 'grade', 'username', 'pin'] as const

export interface StudentRowInput {
  fullName: string
  grade: string
  username: string
  pin: string
}

export type CsvErrorKey =
  | 'accounts.csv.empty'
  | 'accounts.csv.missingColumn'
  | 'accounts.csv.missingName'
  | 'accounts.csv.tooManyRows'
  | 'accounts.csv.unclosedQuote'

export interface CsvError {
  key: CsvErrorKey
  line?: number
}

export interface CsvParseResult {
  rows: StudentRowInput[]
  errors: CsvError[]
}

interface CsvRecord {
  line: number
  fields: string[]
}

/**
 * Excel with Indonesian regional settings saves semicolon-separated files, so the delimiter is taken
 * from whichever of `,` or `;` appears more often in the header line, outside quotes.
 */
function detectDelimiter(text: string): ',' | ';' {
  let commas = 0
  let semicolons = 0
  let quoted = false
  for (const character of text) {
    if (character === '"') quoted = !quoted
    else if (!quoted && (character === '\n' || character === '\r')) break
    else if (!quoted && character === ',') commas += 1
    else if (!quoted && character === ';') semicolons += 1
  }
  return semicolons > commas ? ';' : ','
}

/** RFC 4180 subset: quoted fields, doubled quotes, delimiters and line breaks inside quotes. */
function readRecords(
  text: string,
  delimiter: string,
): { records: CsvRecord[]; unclosedAt?: number } {
  const records: CsvRecord[] = []
  let fields: string[] = []
  let field = ''
  let quoted = false
  let line = 1
  let recordLine = 1
  let quoteLine = 0

  const pushRecord = () => {
    fields.push(field)
    if (fields.some((value) => value.trim() !== '')) records.push({ line: recordLine, fields })
    fields = []
    field = ''
  }

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]

    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        if (character === '\n') line += 1
        field += character
      }
      continue
    }

    if (character === '"') {
      quoted = true
      quoteLine = line
    } else if (character === delimiter) {
      fields.push(field)
      field = ''
    } else if (character === '\r' || character === '\n') {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      pushRecord()
      line += 1
      recordLine = line
    } else {
      field += character
    }
  }

  if (quoted) return { records, unclosedAt: quoteLine }
  pushRecord()
  return { records }
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

export function parseStudentCsv(input: string): CsvParseResult {
  const text = input.replace(/^﻿/, '')
  if (text.trim() === '') return { rows: [], errors: [{ key: 'accounts.csv.empty' }] }

  const { records, unclosedAt } = readRecords(text, detectDelimiter(text))
  if (unclosedAt)
    return { rows: [], errors: [{ key: 'accounts.csv.unclosedQuote', line: unclosedAt }] }

  const [header, ...body] = records
  const columns = (header?.fields ?? []).map(normalizeHeader)
  const indexOf = (name: (typeof CSV_COLUMNS)[number]) => columns.indexOf(name)
  if (indexOf('full_name') === -1) {
    return { rows: [], errors: [{ key: 'accounts.csv.missingColumn' }] }
  }
  if (body.length > MAX_STUDENTS_PER_BATCH) {
    return { rows: [], errors: [{ key: 'accounts.csv.tooManyRows' }] }
  }

  const read = (record: CsvRecord, name: (typeof CSV_COLUMNS)[number]) => {
    const position = indexOf(name)
    return position === -1 ? '' : (record.fields[position] ?? '').trim()
  }

  const rows: StudentRowInput[] = []
  const errors: CsvError[] = []
  for (const record of body) {
    const row = {
      fullName: read(record, 'full_name'),
      grade: read(record, 'grade'),
      username: read(record, 'username'),
      pin: read(record, 'pin'),
    }
    if (!row.fullName) errors.push({ key: 'accounts.csv.missingName', line: record.line })
    rows.push(row)
  }

  return { rows, errors }
}

function quote(value: string): string {
  return /[",;\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** Comma-separated with a byte-order mark, so Excel opens UTF-8 names correctly. */
export function toCsv(header: readonly string[], rows: readonly (readonly string[])[]): string {
  const lines = [header, ...rows].map((row) => row.map(quote).join(','))
  return `﻿${lines.join('\r\n')}\r\n`
}

'use client'

import { type ChangeEvent, Fragment, useActionState, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createStudentsAction } from '@/app/actions/accounts'
import { MAX_FULL_NAME_LENGTH, MAX_GRADE_LENGTH } from '@/lib/accounts/credentials'
import {
  CSV_COLUMNS,
  parseStudentCsv,
  toCsv,
  type CsvError,
  type StudentRowInput,
} from '@/lib/accounts/csv'
import { useActionMessage, useT } from '@/lib/i18n/client'
import type { CreateStudentsState } from '@/lib/types'

interface EditableRow extends StudentRowInput {
  key: number
}

type CsvProblem = CsvError | { key: 'accounts.csv.unreadable'; line?: undefined }

const INITIAL_ROW_COUNT = 3

const EXAMPLE_ROWS = [
  ['Siti Rahmawati', '5', '', ''],
  ['Budi Santoso', '5', 'budi.5a', ''],
  ['Wayan Putra', '6', 'wayan.6b', '482915'],
]

const initialState: CreateStudentsState = {
  status: 'idle',
  created: [],
  problems: [],
  completed: false,
}

function blankRows(count: number, firstKey: number): EditableRow[] {
  return Array.from({ length: count }, (_, index) => ({
    key: firstKey + index,
    fullName: '',
    grade: '',
    username: '',
    pin: '',
  }))
}

function downloadCsv(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function SubmitButton() {
  const { pending } = useFormStatus()
  const t = useT()
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? t('accounts.submitPending') : t('accounts.submit')}
    </button>
  )
}

export function AddStudentsForm({
  role,
  schools,
  schoolName,
  maxRows,
}: {
  role: 'teacher' | 'jari_admin'
  schools: { id: string; name: string }[]
  schoolName: string | null
  maxRows: number
}) {
  const t = useT()
  const actionMessage = useActionMessage()
  const nextKey = useRef(INITIAL_ROW_COUNT)
  const [rows, setRows] = useState<EditableRow[]>(() => blankRows(INITIAL_ROW_COUNT, 0))
  const [schoolId, setSchoolId] = useState('')
  const [csvProblems, setCsvProblems] = useState<CsvProblem[]>([])
  const [csvLoaded, setCsvLoaded] = useState<{ count: number; file: string } | null>(null)
  const [state, formAction] = useActionState(createStudentsAction, initialState)
  // Tracked by identity rather than copied into state, so no effect is needed to react to results.
  const [dismissedState, setDismissedState] = useState<CreateStudentsState | null>(null)
  const [editedSinceState, setEditedSinceState] = useState<CreateStudentsState | null>(null)

  const showResults = state.completed && state !== dismissedState
  const showValidation = state.status === 'error' && !state.completed && state !== editedSinceState
  const rowProblems = new Map(
    showValidation ? state.problems.map((problem) => [problem.row, problem]) : [],
  )

  function takeKey() {
    const key = nextKey.current
    nextKey.current += 1
    return key
  }

  function updateRow(key: number, field: keyof StudentRowInput, value: string) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, [field]: value } : row)))
    setEditedSinceState(state)
  }

  function addRow() {
    setRows((current) =>
      current.length >= maxRows ? current : [...current, ...blankRows(1, takeKey())],
    )
  }

  function removeRow(key: number) {
    setRows((current) =>
      current.length === 1 ? current : current.filter((row) => row.key !== key),
    )
    setEditedSinceState(state)
  }

  async function handleCsv(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ''
    if (!file) return

    let text: string
    try {
      text = await file.text()
    } catch {
      setCsvProblems([{ key: 'accounts.csv.unreadable' }])
      setCsvLoaded(null)
      return
    }

    const result = parseStudentCsv(text)
    setCsvProblems(result.errors)
    if (result.rows.length > 0) {
      setRows(result.rows.map((row) => ({ ...row, key: takeKey() })))
      setCsvLoaded({ count: result.rows.length, file: file.name })
      setEditedSinceState(state)
    } else {
      setCsvLoaded(null)
    }
  }

  function csvProblemText(problem: CsvProblem) {
    switch (problem.key) {
      case 'accounts.csv.empty':
        return t('accounts.csv.empty')
      case 'accounts.csv.missingColumn':
        return t('accounts.csv.missingColumn')
      case 'accounts.csv.missingName':
        return t('accounts.csv.missingName', { line: problem.line ?? 0 })
      case 'accounts.csv.tooManyRows':
        return t('accounts.csv.tooManyRows', { max: maxRows })
      case 'accounts.csv.unclosedQuote':
        return t('accounts.csv.unclosedQuote', { line: problem.line ?? 0 })
      case 'accounts.csv.unreadable':
        return t('accounts.csv.unreadable')
    }
  }

  function startOver() {
    const failedRows = new Set(state.problems.map((problem) => problem.row))
    const retry = rows.filter((_, index) => failedRows.has(index + 1))
    setRows(retry.length > 0 ? retry : blankRows(INITIAL_ROW_COUNT, takeKey() + 1))
    nextKey.current += INITIAL_ROW_COUNT + 1
    setDismissedState(state)
    setEditedSinceState(state)
    setCsvLoaded(null)
    setCsvProblems([])
  }

  if (showResults) {
    return (
      <section className="panel results-panel">
        <div className="panel-head">
          <h3>{t('accounts.results.heading')}</h3>
          <span className={`status ${state.problems.length > 0 ? 'pending' : 'earned'}`}>
            {actionMessage(state.messageKey, state.messageValues)}
          </span>
        </div>

        {state.created.length > 0 ? (
          <>
            <p className="results-warning" role="note">
              {t('accounts.results.warning')}
            </p>
            <p className="muted">{t('accounts.results.signInHint')}</p>
            <div className="table-scroll">
              <table className="student-table credentials-table">
                <thead>
                  <tr>
                    <th>{t('accounts.col.fullName')}</th>
                    <th>{t('accounts.col.grade')}</th>
                    <th>{t('accounts.col.username')}</th>
                    <th>{t('accounts.col.pin')}</th>
                  </tr>
                </thead>
                <tbody>
                  {state.created.map((student) => (
                    <tr key={student.username}>
                      <td>{student.fullName}</td>
                      <td>{student.grade ?? '—'}</td>
                      <td className="credential">{student.username}</td>
                      <td className="credential">{student.pin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        {state.problems.length > 0 ? (
          <div className="section">
            <h4>{t('accounts.results.failedHeading')}</h4>
            <div className="table-scroll">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>{t('accounts.col.row')}</th>
                    <th>{t('accounts.col.fullName')}</th>
                    <th>{t('accounts.results.problem')}</th>
                  </tr>
                </thead>
                <tbody>
                  {state.problems.map((problem) => (
                    <tr key={problem.row}>
                      <td>{problem.row}</td>
                      <td>{problem.fullName}</td>
                      <td className="form-error">{actionMessage(problem.messageKey)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div className="form-actions no-print">
          {state.created.length > 0 ? (
            <>
              <button className="btn" type="button" onClick={() => window.print()}>
                {t('accounts.results.print')}
              </button>
              <button
                className="btn outline"
                type="button"
                onClick={() =>
                  downloadCsv(
                    `student-accounts-${new Date().toISOString().slice(0, 10)}.csv`,
                    toCsv(
                      CSV_COLUMNS,
                      state.created.map((student) => [
                        student.fullName,
                        student.grade ?? '',
                        student.username,
                        student.pin,
                      ]),
                    ),
                  )
                }
              >
                {t('accounts.results.download')}
              </button>
            </>
          ) : null}
          <button className="btn outline" type="button" onClick={startOver}>
            {t('accounts.results.addMore')}
          </button>
        </div>
      </section>
    )
  }

  return (
    <form action={formAction} className="add-students">
      <input
        type="hidden"
        name="rows"
        value={JSON.stringify(
          rows.map((row) => ({
            fullName: row.fullName,
            grade: row.grade,
            username: row.username,
            pin: row.pin,
          })),
        )}
      />

      {role === 'jari_admin' ? (
        <div className="field school-field">
          <label htmlFor="school-id">{t('accounts.schoolLabel')}</label>
          <select
            id="school-id"
            name="schoolId"
            required
            value={schoolId}
            onChange={(event) => setSchoolId(event.currentTarget.value)}
          >
            <option value="">{t('accounts.schoolPlaceholder')}</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="muted">{t('accounts.schoolFixed', { school: schoolName ?? '—' })}</p>
      )}

      <section className="panel section">
        <div className="panel-head">
          <h3>{t('accounts.manualHeading')}</h3>
          <span className="eyebrow">{t('accounts.rowLimit', { max: maxRows })}</span>
        </div>
        <p className="muted">{t('accounts.manualIntro')}</p>
        <div className="table-scroll">
          <table className="student-table row-editor">
            <thead>
              <tr>
                <th>{t('accounts.col.row')}</th>
                <th>{t('accounts.col.fullName')}</th>
                <th>{t('accounts.col.grade')}</th>
                <th>{t('accounts.col.username')}</th>
                <th>{t('accounts.col.pin')}</th>
                <th aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const rowNumber = index + 1
                const problem = rowProblems.get(rowNumber)
                return (
                  <Fragment key={row.key}>
                    <tr className={problem ? 'row-invalid' : undefined}>
                      <td className="row-number">{rowNumber}</td>
                      <td>
                        <input
                          type="text"
                          aria-label={`${t('accounts.col.fullName')} ${rowNumber}`}
                          aria-invalid={problem ? true : undefined}
                          value={row.fullName}
                          maxLength={MAX_FULL_NAME_LENGTH}
                          autoComplete="off"
                          onChange={(event) =>
                            updateRow(row.key, 'fullName', event.currentTarget.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="narrow"
                          aria-label={`${t('accounts.col.grade')} ${rowNumber}`}
                          value={row.grade}
                          maxLength={MAX_GRADE_LENGTH}
                          autoComplete="off"
                          onChange={(event) =>
                            updateRow(row.key, 'grade', event.currentTarget.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          aria-label={`${t('accounts.col.username')} ${rowNumber}`}
                          value={row.username}
                          placeholder={t('accounts.autoPlaceholder')}
                          maxLength={32}
                          autoComplete="off"
                          autoCapitalize="none"
                          spellCheck={false}
                          onChange={(event) =>
                            updateRow(row.key, 'username', event.currentTarget.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="narrow"
                          aria-label={`${t('accounts.col.pin')} ${rowNumber}`}
                          value={row.pin}
                          placeholder={t('accounts.autoPlaceholder')}
                          inputMode="numeric"
                          maxLength={6}
                          autoComplete="off"
                          onChange={(event) => updateRow(row.key, 'pin', event.currentTarget.value)}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="row-remove"
                          aria-label={t('accounts.removeRow', { row: rowNumber })}
                          disabled={rows.length === 1}
                          onClick={() => removeRow(row.key)}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                    {problem ? (
                      <tr className="row-problem">
                        <td />
                        <td colSpan={5}>
                          <small className="form-error">
                            {t('accounts.rowProblem', {
                              row: rowNumber,
                              problem: actionMessage(problem.messageKey),
                            })}
                          </small>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="btn outline sm"
            disabled={rows.length >= maxRows}
            onClick={addRow}
          >
            {t('accounts.addRow')}
          </button>
        </div>
      </section>

      <section className="panel section">
        <div className="panel-head">
          <h3>{t('accounts.csvHeading')}</h3>
          <button
            type="button"
            className="btn outline sm"
            onClick={() =>
              downloadCsv('student-accounts-template.csv', toCsv(CSV_COLUMNS, EXAMPLE_ROWS))
            }
          >
            {t('accounts.csvTemplate')}
          </button>
        </div>
        <p className="muted">{t('accounts.csvIntro')}</p>
        <div className="upload">
          <input
            type="file"
            accept=".csv,text/csv"
            aria-label={t('accounts.csvChoose')}
            onChange={(event) => void handleCsv(event)}
          />
          <strong>{t('accounts.csvChoose')}</strong>
          <small>CSV · UTF-8</small>
        </div>
        {csvLoaded ? (
          <p className="form-success" role="status">
            {t('accounts.csvLoaded', { count: csvLoaded.count, file: csvLoaded.file })}
          </p>
        ) : null}
        {csvProblems.length > 0 ? (
          <ul className="csv-problems" role="alert">
            {csvProblems.map((problem, index) => (
              <li key={`${problem.key}-${problem.line ?? index}`} className="form-error">
                {csvProblemText(problem)}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="csv-format">
          <strong>{t('accounts.csvFormatHeading')}</strong>
          <p>{t('accounts.csvFormatHeader')}</p>
          <div className="table-scroll">
            <table className="student-table">
              <thead>
                <tr>
                  <th>{t('accounts.csvFormatColumn')}</th>
                  <th>{t('accounts.csvFormatRequired')}</th>
                  <th>{t('accounts.csvFormatMeaning')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>full_name</code>
                  </td>
                  <td>{t('accounts.csvFormatYes')}</td>
                  <td>{t('accounts.csvFormatFullName')}</td>
                </tr>
                <tr>
                  <td>
                    <code>grade</code>
                  </td>
                  <td>{t('accounts.csvFormatNo')}</td>
                  <td>{t('accounts.csvFormatGrade')}</td>
                </tr>
                <tr>
                  <td>
                    <code>username</code>
                  </td>
                  <td>{t('accounts.csvFormatNo')}</td>
                  <td>{t('accounts.csvFormatUsername')}</td>
                </tr>
                <tr>
                  <td>
                    <code>pin</code>
                  </td>
                  <td>{t('accounts.csvFormatNo')}</td>
                  <td>{t('accounts.csvFormatPin')}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>{t('accounts.csvFormatExample')}</p>
          <pre>
            {[CSV_COLUMNS.join(','), ...EXAMPLE_ROWS.map((row) => row.join(','))].join('\n')}
          </pre>
          <p className="muted">{t('accounts.csvFormatNotes', { max: maxRows })}</p>
        </div>
      </section>

      {showValidation ? (
        <p className="form-error" role="alert">
          {actionMessage(state.messageKey, state.messageValues)}
        </p>
      ) : null}
      <div className="form-actions">
        <SubmitButton />
      </div>
    </form>
  )
}

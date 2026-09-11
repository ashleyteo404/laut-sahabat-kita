'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createLearningSessionAction } from '@/app/actions/learning'
import { useActionMessage, useT } from '@/lib/i18n/client'
import type { ActionState, Island, Profile } from '@/lib/types'

const initialState: ActionState = { status: 'idle' }

function SaveButton() {
  const { pending } = useFormStatus()
  const t = useT()
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? t('session.savePending') : t('session.save')}
    </button>
  )
}

export function SessionForm({ students, islands }: { students: Profile[]; islands: Island[] }) {
  const router = useRouter()
  const t = useT()
  const actionMessage = useActionMessage()
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action] = useActionState(createLearningSessionAction, initialState)

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset()
      router.refresh()
    }
  }, [state.status, router])

  return (
    <form ref={formRef} action={action} className="session-form">
      <div className="form-grid">
        <div className="field">
          <label htmlFor="session-title">{t('session.titleLabel')}</label>
          <input
            id="session-title"
            name="title"
            type="text"
            required
            minLength={3}
            maxLength={120}
            placeholder={t('session.titlePlaceholder')}
          />
        </div>
        <div className="field">
          <label htmlFor="session-type">{t('session.settingLabel')}</label>
          <select id="session-type" name="sessionType" defaultValue="field" required>
            <option value="field">{t('session.type.field')}</option>
            <option value="online">{t('session.type.online')}</option>
            <option value="classroom">{t('session.type.classroom')}</option>
            <option value="community">{t('session.type.community')}</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="occurred-on">{t('session.dateLabel')}</label>
          <input
            id="occurred-on"
            name="occurredOn"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="duration">{t('session.durationLabel')}</label>
          <input
            id="duration"
            name="durationMinutes"
            type="number"
            min={5}
            max={600}
            defaultValue={60}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="session-island">{t('session.islandLabel')}</label>
          <select id="session-island" name="islandId" defaultValue="">
            <option value="">{t('session.islandNone')}</option>
            {islands.map((island) => (
              <option key={island.id} value={island.id}>
                {island.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="habitat">{t('session.habitatLabel')}</label>
          <input
            id="habitat"
            name="habitat"
            type="text"
            maxLength={120}
            placeholder={t('session.habitatPlaceholder')}
          />
        </div>
      </div>
      <div className="field">
        <label>{t('session.studentsLabel')}</label>
        <div className="attendance-picker">
          {students.length ? (
            students.map((student) => (
              <label key={student.id} className="attendance-option">
                <input type="checkbox" name="studentIds" value={student.id} defaultChecked />
                <span>{student.full_name}</span>
                <small>{t('session.grade', { grade: student.grade ?? '—' })}</small>
              </label>
            ))
          ) : (
            <p className="muted">{t('session.noStudents')}</p>
          )}
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="teacher-reflection">{t('session.reflectionLabel')}</label>
          <textarea
            id="teacher-reflection"
            name="teacherReflection"
            maxLength={2000}
            placeholder={t('session.reflectionPlaceholder')}
          />
        </div>
        <div className="field">
          <label htmlFor="field-observation">{t('session.observationLabel')}</label>
          <textarea
            id="field-observation"
            name="fieldObservation"
            maxLength={2000}
            placeholder={t('session.observationPlaceholder')}
          />
        </div>
      </div>
      <div className="form-footer">
        <p className={state.status === 'error' ? 'form-error' : 'form-success'} role="status">
          {actionMessage(state.messageKey, state.messageValues)}
        </p>
        <SaveButton />
      </div>
    </form>
  )
}

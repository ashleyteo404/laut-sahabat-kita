'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { reviewSubmissionAction } from '@/app/actions/learning'
import { useActionMessage, useLocale, useT } from '@/lib/i18n/client'
import { formatDate } from '@/lib/utils'
import type { ActionState, Activity, Submission, SubmissionStatus } from '@/lib/types'
import type { UiMessageKey } from '@/lib/i18n/dictionaries/en'

const statusKey = {
  pending: 'status.pending',
  approved: 'status.approved',
  returned: 'status.returned',
} as const satisfies Record<SubmissionStatus, UiMessageKey>

const initialState: ActionState = { status: 'idle' }

function DecisionButtons() {
  const { pending } = useFormStatus()
  const t = useT()
  return (
    <div className="review-actions">
      <button
        className="approve"
        name="decision"
        value="approve"
        disabled={pending}
        title={t('review.approve')}
      >
        ✓
      </button>
      <button
        className="reject"
        name="decision"
        value="return"
        disabled={pending}
        title={t('review.return')}
      >
        ↶
      </button>
    </div>
  )
}

export function ReviewCard({
  submission,
  activity,
}: {
  submission: Submission
  activity: Activity
}) {
  const router = useRouter()
  const t = useT()
  const locale = useLocale()
  const actionMessage = useActionMessage()
  const [state, action] = useActionState(reviewSubmissionAction, initialState)

  useEffect(() => {
    if (state.status === 'success') router.refresh()
  }, [state.status, router])
  return (
    <article className="review-card expanded">
      {submission.evidenceUrl ? (
        <a
          className="thumb"
          href={submission.evidenceUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={t('review.openEvidence', { name: submission.studentName })}
          style={{
            backgroundImage: `url(${submission.evidenceUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ) : (
        <div className="thumb">{activity.icon}</div>
      )}
      <div className="review-info">
        <strong>
          {submission.studentName} · {activity.title}
        </strong>
        <span>
          {formatDate(submission.created_at, locale)} · {submission.reflection}
        </span>
        {submission.evidenceUrl && (
          <a
            className="evidence-link"
            href={submission.evidenceUrl}
            target="_blank"
            rel="noreferrer"
          >
            {t('review.viewPhoto')}
          </a>
        )}
      </div>
      {submission.status === 'pending' ? (
        <form action={action} className="review-form">
          <input type="hidden" name="submissionId" value={submission.id} />
          <input
            className="review-note"
            name="note"
            aria-label={t('review.noteLabel')}
            placeholder={t('review.notePlaceholder')}
            maxLength={500}
          />
          <DecisionButtons />
          {state.status === 'error' && (
            <small className="form-error">
              {actionMessage(state.messageKey, state.messageValues)}
            </small>
          )}
        </form>
      ) : (
        <span className={`status ${submission.status}`}>{t(statusKey[submission.status])}</span>
      )}
    </article>
  )
}

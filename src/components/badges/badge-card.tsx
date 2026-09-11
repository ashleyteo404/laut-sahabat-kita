import { getTranslator } from '@/lib/i18n/server'
import type { UiMessageKey } from '@/lib/i18n/dictionaries/en'
import type { Badge, SubmissionStatus } from '@/lib/types'

type BadgeDisplayStatus = SubmissionStatus | 'earned' | 'learning' | 'explorer' | 'locked'

const statusKey = {
  pending: 'status.pending',
  approved: 'status.approved',
  returned: 'status.returned',
  earned: 'status.earned',
  learning: 'status.learning',
  explorer: 'status.explorer',
  locked: 'status.locked',
} as const satisfies Record<BadgeDisplayStatus, UiMessageKey>

export async function BadgeCard({ badge, status }: { badge: Badge; status: BadgeDisplayStatus }) {
  const t = await getTranslator()
  const display = status === 'approved' ? 'earned' : status
  return (
    <article className={`badge-card ${display}`}>
      <span className={`badge-status status ${display}`}>{t(statusKey[display])}</span>
      <div>
        <div className="badge-medal">{badge.icon}</div>
        <h3>{badge.name}</h3>
        <p>{badge.description}</p>
      </div>
    </article>
  )
}

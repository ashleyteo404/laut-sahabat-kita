import Link from 'next/link'
import { getTranslator } from '@/lib/i18n/server'
import type { Island } from '@/lib/types'

export async function IslandCard({
  island,
  progress,
  activityCount,
}: {
  island: Island
  progress: number
  activityCount: number
}) {
  const t = await getTranslator()
  return (
    <article className="island-card">
      <div className={`island-art ${island.className}`}>
        <span className="art-label">{island.tagline}</span>
      </div>
      <div className="island-body">
        <div className="island-top">
          <h3>{island.name}</h3>
          <span>
            {t(activityCount === 1 ? 'island.activityCount.one' : 'island.activityCount.other', {
              count: activityCount,
            })}
          </span>
        </div>
        <p>{island.description}</p>
        <div className="island-foot">
          <div>
            <small>{t('island.explored', { progress })}</small>
            <div className="mini-progress">
              <i style={{ width: `${progress}%` }} />
            </div>
          </div>
          <Link className="btn sm outline" href={`/explore?island=${island.id}`}>
            {t('island.explore')}
          </Link>
        </div>
      </div>
    </article>
  )
}

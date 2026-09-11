import type { Metadata } from 'next'
import Link from 'next/link'
import { ActivityCard } from '@/components/activities/activity-card'
import { getWorkspaceData } from '@/lib/data'
import { requireProfile } from '@/lib/auth'
import { getTranslator } from '@/lib/i18n/server'
import type { LearningMode } from '@/lib/types'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t('meta.explore.title') }
}

interface ExplorePageProps {
  searchParams: Promise<{ island?: string; mode?: string }>
}

function filterHref(island: string, mode: string) {
  const params = new URLSearchParams()
  if (island !== 'all') params.set('island', island)
  if (mode !== 'all') params.set('mode', mode)
  const query = params.toString()
  return query ? `/explore?${query}` : '/explore'
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  await requireProfile(['student'])
  const t = await getTranslator()
  const data = await getWorkspaceData()
  const { activities, islands } = data
  const params = await searchParams
  const island = islands.some((item) => item.id === params.island) ? params.island! : 'all'
  const mode: LearningMode | 'all' =
    params.mode === 'online' || params.mode === 'field' ? params.mode : 'all'
  const mine = data.submissions.filter((item) => item.student_id === data.profile.id)
  const list = activities.filter(
    (activity) =>
      (island === 'all' || activity.islandId === island) &&
      (mode === 'all' || activity.mode === mode),
  )

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">{t('explore.eyebrow')}</span>
          <h1>{t('explore.heading')}</h1>
          <p>{t('explore.intro')}</p>
        </div>
        <div className="segmented">
          {(['all', 'online', 'field'] as const).map((value) => (
            <Link
              key={value}
              className={mode === value ? 'active' : ''}
              href={filterHref(island, value)}
            >
              {value === 'all'
                ? t('explore.filter.all')
                : value === 'online'
                  ? t('explore.filter.online')
                  : t('explore.filter.field')}
            </Link>
          ))}
        </div>
      </div>
      <div className="filter-row">
        <Link
          className={`filter-chip ${island === 'all' ? 'active' : ''}`}
          href={filterHref('all', mode)}
        >
          {t('explore.filter.allIslands')}
        </Link>
        {islands.map((item) => (
          <Link
            key={item.id}
            className={`filter-chip ${island === item.id ? 'active' : ''}`}
            href={filterHref(item.id, mode)}
          >
            {item.name}
          </Link>
        ))}
      </div>
      <div className="module-grid">
        {list.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            studentId={data.profile.id}
            submission={
              mine.find((item) => item.activity_id === activity.id && item.status !== 'returned') ??
              mine.find((item) => item.activity_id === activity.id)
            }
          />
        ))}
      </div>
    </div>
  )
}

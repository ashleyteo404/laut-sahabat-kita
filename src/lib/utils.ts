import { LOCALE_TAGS, type Locale } from '@/lib/i18n/config'

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

// `locale` is required rather than defaulting, so the compiler lists every call site that needs it.
export function formatDate(value: string | Date, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatLongDate(value: string | Date, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatShortMonth(value: string | Date, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], { month: 'short' }).format(new Date(value))
}

export function percentage(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

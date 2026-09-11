import type { NextRequest } from 'next/server'

export const LOCALES = ['en', 'id'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'id'

export const LOCALE_COOKIE = 'lsk-locale'

export const LOCALE_COOKIE_OPTIONS = {
  path: '/',
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
} as const

/** Region-qualified tags for `Intl`. The bare subtag is what `<html lang>` wants. */
export const LOCALE_TAGS: Record<Locale, string> = { en: 'en-GB', id: 'id-ID' }

/** Language names are written in their own language and are never translated. */
export const LOCALE_LABELS: Record<Locale, string> = { en: 'English', id: 'Bahasa Indonesia' }

export const LOCALE_SHORT_LABELS: Record<Locale, string> = { en: 'EN', id: 'ID' }

export function normalizeLocale(value: unknown): Locale | null {
  return LOCALES.includes(value as Locale) ? (value as Locale) : null
}

/**
 * Picks the best supported locale from an `Accept-Language` header, honouring `q=` weights.
 * `in` is the legacy ISO 639-1 code for Indonesian and is still emitted by older Android stacks.
 */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE

  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...parameters] = part.trim().split(';')
      const quality = parameters.find((value) => value.trim().startsWith('q='))
      return { tag: tag.trim().toLowerCase(), quality: quality ? Number(quality.split('=')[1]) : 1 }
    })
    .filter((entry) => entry.tag.length > 0 && Number.isFinite(entry.quality))
    .sort((left, right) => right.quality - left.quality)

  for (const { tag } of ranked) {
    if (tag === '*') break
    const base = tag.split('-')[0]
    if (base === 'id' || base === 'in') return 'id'
    if (base === 'en') return 'en'
  }

  return DEFAULT_LOCALE
}

/**
 * Resolves the request locale and writes it onto `request.cookies` so the very first render already
 * sees it. `updateSession()` builds its response with `NextResponse.next({ request })` afterwards,
 * which is what forwards the mutation on.
 */
export function applyLocale(request: NextRequest): { locale: Locale; isNew: boolean } {
  const existing = normalizeLocale(request.cookies.get(LOCALE_COOKIE)?.value)
  const locale = existing ?? localeFromAcceptLanguage(request.headers.get('accept-language'))
  if (!existing) request.cookies.set(LOCALE_COOKIE, locale)
  return { locale, isNew: !existing }
}

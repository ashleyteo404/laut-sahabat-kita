'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_OPTIONS,
  normalizeLocale,
} from '@/lib/i18n/config'

export async function setLocaleAction(formData: FormData) {
  const locale = normalizeLocale(formData.get('locale')) ?? DEFAULT_LOCALE
  const store = await cookies()
  store.set(LOCALE_COOKIE, locale, LOCALE_COOKIE_OPTIONS)
  // Invalidates the root layout so <html lang>, metadata and every server component re-render.
  revalidatePath('/', 'layout')
}

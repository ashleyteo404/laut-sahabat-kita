import 'server-only'

import { cookies } from 'next/headers'
import { cache } from 'react'
import { DEFAULT_LOCALE, LOCALE_COOKIE, normalizeLocale, type Locale } from '@/lib/i18n/config'
import {
  enSource,
  enUiSource,
  type Dictionary,
  type UiDictionary,
} from '@/lib/i18n/dictionaries/en'
import { id, idUi } from '@/lib/i18n/dictionaries/id'
import { createTranslator, type Translator } from '@/lib/i18n/translator'

/**
 * The dictionary map lives here and nowhere else. A client module importing it would pull both
 * languages into the browser bundle.
 */
const dictionaries: Record<Locale, Dictionary> = { en: enSource, id }
const uiDictionaries: Record<Locale, UiDictionary> = { en: enUiSource, id: idUi }

export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies()
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value) ?? DEFAULT_LOCALE
})

export const getTranslator = cache(async (): Promise<Translator> =>
  createTranslator(dictionaries[await getLocale()]),
)

/** The subset handed to `LocaleProvider`, so the RSC payload carries client strings only. */
export const getUiMessages = cache(
  async (): Promise<UiDictionary> => uiDictionaries[await getLocale()],
)

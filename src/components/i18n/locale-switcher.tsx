'use client'

import { Languages } from 'lucide-react'
import { setLocaleAction } from '@/app/actions/locale'
import { LOCALE_LABELS, LOCALE_SHORT_LABELS, LOCALES } from '@/lib/i18n/config'
import { useLocale } from '@/lib/i18n/client'

/**
 * A plain form so the language can be changed before hydration and with JavaScript disabled.
 * Language names are written in their own language, so nothing here comes from the dictionary.
 */
export function LocaleSwitcher() {
  const locale = useLocale()

  return (
    <form className="locale-switcher segmented" action={setLocaleAction}>
      <Languages aria-hidden="true" size={15} />
      {LOCALES.map((value) => (
        <button
          key={value}
          className={locale === value ? 'active' : ''}
          type="submit"
          name="locale"
          value={value}
          lang={value}
          aria-label={LOCALE_LABELS[value]}
          aria-current={locale === value ? 'true' : undefined}
        >
          {LOCALE_SHORT_LABELS[value]}
        </button>
      ))}
    </form>
  )
}

'use client'

import { createContext, useContext, useMemo } from 'react'
import type { Locale } from '@/lib/i18n/config'
import type { ActionMessageKey, UiDictionary, UiMessageKey } from '@/lib/i18n/dictionaries/en'
import { createTranslator, interpolate, type Translator } from '@/lib/i18n/translator'

interface LocaleContextValue {
  locale: Locale
  messages: UiDictionary
  t: Translator<UiMessageKey>
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale
  messages: UiDictionary
  children: React.ReactNode
}) {
  const value = useMemo<LocaleContextValue>(
    () => ({ locale, messages, t: createTranslator<UiMessageKey>(messages) }),
    [locale, messages],
  )
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

function useLocaleContext() {
  const value = useContext(LocaleContext)
  if (!value) throw new Error('useT and useLocale must be used inside LocaleProvider.')
  return value
}

export function useT() {
  return useLocaleContext().t
}

export function useLocale() {
  return useLocaleContext().locale
}

/**
 * Renders a message a Server Action, the upload endpoint or the service worker produced. Unlike
 * `t()`, the placeholder values arrive at runtime across a serialization boundary, so they cannot
 * be checked against the key at compile time.
 */
export function useActionMessage() {
  const { messages } = useLocaleContext()
  return (
    key: ActionMessageKey | null | undefined,
    values?: Record<string, string | number>,
    // `messages[key] ?? key` mirrors createTranslator: an unknown key renders visibly for
    // diagnosis instead of vanishing.
  ): string => (key ? interpolate(messages[key] ?? key, values) : '')
}

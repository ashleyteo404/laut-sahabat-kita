import type { NextRequest } from 'next/server'
import { applyLocale, LOCALE_COOKIE, LOCALE_COOKIE_OPTIONS } from '@/lib/i18n/config'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  // Route handlers read the locale cookie themselves. Skipping them keeps `Set-Cookie` off the JSON
  // responses the service worker consumes.
  if (request.nextUrl.pathname.startsWith('/api/')) return updateSession(request)

  const { locale, isNew } = applyLocale(request)
  const response = await updateSession(request)
  if (isNew) response.cookies.set(LOCALE_COOKIE, locale, LOCALE_COOKIE_OPTIONS)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|offline.html|manifest.webmanifest|ocean-passport-icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Landing point for password-recovery links.
 *
 * Two link shapes are accepted:
 * - `?token_hash=…&type=recovery` from a customised email template. Verified server-side, so it works
 *   even when the email is opened on a different device from the one that requested it.
 * - `?code=…` from the default template (PKCE). Only works in the browser that requested the reset,
 *   because the matching code verifier is a cookie set there.
 *
 * Both establish a session cookie; the response then goes to a fixed path. Nothing from the query
 * string is ever used as a redirect target.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const code = searchParams.get('code')

  const supabase = await createClient()
  let verified = false

  if (tokenHash && type === 'recovery') {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
    verified = !error
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    verified = !error
  }

  const destination = request.nextUrl.clone()
  destination.search = ''
  destination.pathname = verified ? '/reset-password' : '/login'
  if (!verified) destination.searchParams.set('reset', 'invalid')
  return NextResponse.redirect(destination)
}

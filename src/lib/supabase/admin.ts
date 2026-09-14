import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseEnv } from '@/lib/supabase/env'

/**
 * The only module that reads `SUPABASE_SECRET_KEY`.
 *
 * That key bypasses row-level security, so it must never be prefixed `NEXT_PUBLIC_` (which would
 * inline it into browser bundles), never be committed, and never be imported outside server-only
 * account code. Callers are responsible for authorizing the signed-in user before using this client.
 */
function readSecretKey(): string | null {
  return process.env.SUPABASE_SECRET_KEY?.trim() || null
}

export function isAccountAdminConfigured(): boolean {
  return readSecretKey() !== null
}

export function createAdminClient(): SupabaseClient | null {
  const secretKey = readSecretKey()
  if (!secretKey) return null

  const { url } = getSupabaseEnv()
  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

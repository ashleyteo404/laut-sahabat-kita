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
  const value = process.env.SUPABASE_SECRET_KEY?.trim()
  return value && isSecretKey(value) ? value : null
}

/**
 * Accepts only keys that can call the admin API: the `sb_secret_…` format, or a legacy JWT whose role
 * is `service_role`. A publishable or `anon` key pasted here by mistake would otherwise make every
 * admin call fail with a generic error, so it is treated as "not configured" instead.
 */
function isSecretKey(value: string): boolean {
  if (value.startsWith('sb_secret_')) return true
  if (!value.startsWith('eyJ')) return false
  try {
    const payload = JSON.parse(Buffer.from(value.split('.')[1] ?? '', 'base64url').toString('utf8'))
    return payload?.role === 'service_role'
  } catch {
    return false
  }
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

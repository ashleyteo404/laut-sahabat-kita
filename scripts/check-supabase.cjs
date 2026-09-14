/* eslint-disable @typescript-eslint/no-require-imports */

require('@next/env').loadEnvConfig(process.cwd())

function normalizeProjectUrl(value) {
  if (!value) return value

  return value
    .trim()
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/, '')
}

function loadConfig() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return {
      url: normalizeProjectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
      key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    }
  }

  global.window = {}
  require('../supabase-config.js')
  return {
    url: normalizeProjectUrl(window.LSK_SUPABASE_CONFIG?.url),
    key: window.LSK_SUPABASE_CONFIG?.publishableKey,
  }
}

async function main() {
  const { url, key } = loadConfig()
  if (!url || !key) throw new Error('Supabase credentials are not configured.')
  const checks = [
    ['islands', 'islands', 'id'],
    ['activities', 'activities', 'id'],
    ['submissions', 'submissions', 'id'],
    ['learning/explorer badges', 'student_badges', 'award_tier'],
    ['bilingual content', 'islands', 'name_ind'],
    ['student usernames', 'profiles', 'username'],
    ['learning sessions', 'learning_sessions', 'id'],
    ['attendance', 'session_attendance', 'session_id'],
  ]

  const failures = []
  for (const [name, table, column] of checks) {
    const response = await fetch(`${url}/rest/v1/${table}?select=${column}&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      const code = error.code ?? response.status
      if (code === '42501') {
        console.log(`${name}: ready (protected until sign-in)`)
        continue
      }

      const message = error.message ? ` - ${error.message}` : ''
      failures.push(code)
      console.log(`${name}: failed (${code}${message})`)
    } else {
      console.log(`${name}: ready`)
    }
  }

  const offlineResponse = await fetch(`${url}/rest/v1/rpc/offline_submission_schema_ready`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: '{}',
  })
  const offlinePayload = await offlineResponse.json().catch(() => false)
  if (offlineResponse.ok && offlinePayload === true) {
    console.log('offline submission sync: ready')
  } else {
    const error = offlinePayload && typeof offlinePayload === 'object' ? offlinePayload : {}
    const code = error.code ?? offlineResponse.status
    const message = error.message ? ` - ${error.message}` : ''
    failures.push(code)
    console.log(`offline submission sync: update required (${code}${message})`)
  }

  // A warning, not a failure: accounts are created by teachers and administrators, so public
  // self-registration should be switched off in Authentication settings.
  const settingsResponse = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
  const settings = await settingsResponse.json().catch(() => null)
  if (settings && settings.disable_signup === false) {
    console.warn(
      'public sign-up: WARNING enabled - turn off "Allow new users to sign up" in Supabase Authentication settings',
    )
  } else if (settings) {
    console.log('public sign-up: disabled')
  }

  if (failures.length > 0) {
    const schemaCodes = new Set(['42P01', 'PGRST202', 'PGRST204', 'PGRST205'])
    const needsSchemaUpdate = failures.some((code) => schemaCodes.has(String(code)))
    console.error(
      needsSchemaUpdate
        ? 'Run the current supabase/schema.sql in the Supabase SQL Editor.'
        : 'Database verification failed. Check the detailed errors above and your Supabase configuration.',
    )
    process.exitCode = 1
  }
}

main().catch((error) => {
  const detail = error.cause?.code ? ` (${error.cause.code})` : ''
  console.error(`${error.message}${detail}`)
  process.exitCode = 1
})

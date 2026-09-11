import { timingSafeEqual } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseEnv } from '@/lib/supabase/env'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const RESPONSE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
}

function jsonResponse(body: Record<string, string>, status: number) {
  return NextResponse.json(body, { status, headers: RESPONSE_HEADERS })
}

function tokensMatch(provided: string | null, expected: string) {
  if (!provided) return false

  const providedBuffer = Buffer.from(provided)
  const expectedBuffer = Buffer.from(expected)
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  )
}

export async function GET(request: NextRequest) {
  const expectedToken = process.env.UPTIME_HEALTHCHECK_TOKEN?.trim()
  if (!expectedToken || expectedToken.length < 32) {
    return jsonResponse({ status: 'unavailable' }, 503)
  }

  if (!tokensMatch(request.headers.get('x-healthcheck-token'), expectedToken)) {
    return jsonResponse({ status: 'unauthorized' }, 401)
  }

  try {
    const { url, publishableKey } = getSupabaseEnv()
    const response = await fetch(`${url}/rest/v1/rpc/project_healthcheck`, {
      method: 'POST',
      headers: {
        apikey: publishableKey,
        'Content-Type': 'application/json',
      },
      body: '{}',
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    })
    const databaseIsHealthy = response.ok && (await response.json().catch(() => false)) === true

    return databaseIsHealthy
      ? jsonResponse({ status: 'ok', database: 'reachable' }, 200)
      : jsonResponse({ status: 'unavailable' }, 503)
  } catch {
    return jsonResponse({ status: 'unavailable' }, 503)
  }
}

import type { NextConfig } from 'next'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

function normalizeSupabaseProjectUrl(value?: string) {
  if (!value) return value

  return value
    .trim()
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/, '')
}

function readLegacySupabaseConfig() {
  try {
    const source = readFileSync(join(process.cwd(), 'supabase-config.js'), 'utf8')
    return {
      url: source.match(/url:\s*['"]([^'"]+)['"]/)?.[1],
      key: source.match(/publishableKey:\s*['"]([^'"]+)['"]/)?.[1],
    }
  } catch {
    return {}
  }
}

// Compatibility bridge for the credentials already entered in the original
// prototype. New deployments should use .env.local / platform environment vars.
const legacyConfig = readLegacySupabaseConfig()
const supabaseUrl = normalizeSupabaseProjectUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? legacyConfig.url,
)

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? legacyConfig.key,
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.webmanifest',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
    ]
  },
}

export default nextConfig

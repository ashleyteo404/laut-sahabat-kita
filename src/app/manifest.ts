import type { MetadataRoute } from 'next'

/**
 * Deliberately static and bilingual. A manifest cannot follow the locale cookie: browsers fetch it
 * with credentials omitted unless the <link> carries crossorigin="use-credentials", which Next's
 * `metadata.manifest` does not emit; the service worker caches it; and the OS captures the name at
 * install time and never renames an installed app.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ocean Passport · Laut Sahabat Kita',
    short_name: 'Ocean Passport',
    description:
      'Teman belajar lapangan dan daring untuk Laut Sahabat Kita · A field and online learning companion.',
    id: '/',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#f3f7f2',
    theme_color: '#073f3b',
    lang: 'id',
    categories: ['education', 'lifestyle'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      { src: '/ocean-passport-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
    shortcuts: [
      { name: 'Jelajah aktivitas · Explore activities', short_name: 'Jelajah', url: '/explore' },
      { name: 'Paspor saya · My passport', short_name: 'Paspor', url: '/passport' },
    ],
  }
}

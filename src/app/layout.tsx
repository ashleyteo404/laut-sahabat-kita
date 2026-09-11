import type { Metadata, Viewport } from 'next'
import '../../styles.css'
import { LocaleProvider } from '@/lib/i18n/client'
import { getLocale, getTranslator, getUiMessages } from '@/lib/i18n/server'
import { PwaProvider } from '@/components/pwa/pwa-status'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return {
    applicationName: t('meta.applicationName'),
    title: { default: t('meta.default.title'), template: t('meta.title.template') },
    description: t('meta.description'),
    icons: {
      icon: [
        { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/ocean-passport-icon.svg', type: 'image/svg+xml' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'Ocean Passport',
    },
    formatDetection: { telephone: false },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#073f3b',
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [locale, messages] = await Promise.all([getLocale(), getUiMessages()])

  // LocaleProvider wraps PwaProvider because PwaProvider renders copy of its own.
  return (
    <html lang={locale}>
      <body>
        <LocaleProvider locale={locale} messages={messages}>
          <PwaProvider>{children}</PwaProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { LocaleSwitcher } from '@/components/i18n/locale-switcher'
import { requireProfile } from '@/lib/auth'
import { getTranslator } from '@/lib/i18n/server'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t('meta.reset.title') }
}

export default async function ResetPasswordPage() {
  // Signed-out visitors go to /login and students to /dashboard; a student's PIN is reset by a teacher.
  await requireProfile(['teacher', 'jari_admin'])
  const t = await getTranslator()

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const email = typeof data?.claims?.email === 'string' ? data.claims.email : null

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="brand">
          <div className="brand-mark">≈</div>
          <div>
            <strong>{t('brand.name')}</strong>
            <small>{t('brand.tagline')}</small>
          </div>
        </div>
        <div>
          <span className="hero-kicker">{t('loginPage.kicker')}</span>
          <h1>{t('loginPage.heading')}</h1>
        </div>
        <small>{t('loginPage.islands')}</small>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-locale">
          <LocaleSwitcher />
        </div>
        <ResetPasswordForm email={email} />
      </section>
    </main>
  )
}

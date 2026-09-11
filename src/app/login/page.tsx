import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { LocaleSwitcher } from '@/components/i18n/locale-switcher'
import { getTranslator } from '@/lib/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t('meta.login.title') }
}

export default async function LoginPage() {
  const t = await getTranslator()
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
          <p>{t('loginPage.intro')}</p>
        </div>
        <small>{t('loginPage.islands')}</small>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-locale">
          <LocaleSwitcher />
        </div>
        <LoginForm />
      </section>
    </main>
  )
}

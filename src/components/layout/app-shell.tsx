'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Compass,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  Waves,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { signOutAction } from '@/app/actions/auth'
import { LocaleSwitcher } from '@/components/i18n/locale-switcher'
import { OfflineSyncStatus } from '@/components/pwa/offline-sync-status'
import { PwaInstallButton } from '@/components/pwa/pwa-status'
import { useT } from '@/lib/i18n/client'
import { initials } from '@/lib/utils'
import type { UiMessageKey } from '@/lib/i18n/dictionaries/en'
import type { Profile, UserRole } from '@/lib/types'

// `as const` keeps each labelKey a single literal, which is what lets t() prove these messages
// take no interpolation values. A widening cast here would make every call demand an argument.
const studentNav = [
  { href: '/dashboard', labelKey: 'nav.dashboard.student', icon: LayoutDashboard },
  { href: '/explore', labelKey: 'nav.explore', icon: Compass },
  { href: '/passport', labelKey: 'nav.passport', icon: BookOpen },
  { href: '/badges', labelKey: 'nav.badges', icon: Award },
  { href: '/journal', labelKey: 'nav.journal', icon: NotebookPen },
] as const satisfies readonly { href: string; labelKey: UiMessageKey; icon: LucideIcon }[]

const teacherNav = [
  { href: '/dashboard', labelKey: 'nav.dashboard.staff', icon: LayoutDashboard },
  { href: '/review', labelKey: 'nav.review', icon: CheckCircle2 },
  { href: '/students', labelKey: 'nav.students', icon: Users },
  { href: '/sessions', labelKey: 'nav.sessions', icon: CalendarDays },
] as const satisfies readonly { href: string; labelKey: UiMessageKey; icon: LucideIcon }[]

const programmeNav = { href: '/programme', labelKey: 'nav.programme', icon: Waves } as const

const roleKey = {
  student: 'role.student',
  teacher: 'role.teacher',
  jari_admin: 'role.jariAdmin',
} as const satisfies Record<UserRole, UiMessageKey>

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const pathname = usePathname()
  const t = useT()
  const items =
    profile.role === 'student'
      ? studentNav
      : profile.role === 'jari_admin'
        ? [...teacherNav.filter((item) => item.href !== '/sessions'), programmeNav]
        : teacherNav
  const title =
    profile.role === 'student'
      ? t('shell.title.student')
      : profile.role === 'jari_admin'
        ? t('shell.title.jariAdmin')
        : t('shell.title.teacher')
  const role = t(roleKey[profile.role])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/dashboard">
          <div className="brand-mark">≈</div>
          <div>
            <strong>{t('brand.name')}</strong>
            <small>{t('brand.tagline')}</small>
          </div>
        </Link>
        <nav className="nav" aria-label={t('shell.nav.primary')}>
          {items.map(({ href, labelKey, icon: Icon }) => (
            <Link key={href} className={`nav-btn ${pathname === href ? 'active' : ''}`} href={href}>
              <span className="ico">
                <Icon size={18} />
              </span>
              <span>{t(labelKey)}</span>
            </Link>
          ))}
        </nav>
        <div className="role-card">
          <p>{t('shell.connectedAs', { role })}</p>
          <form action={signOutAction}>
            <button className="btn light sm" type="submit">
              <LogOut size={14} /> {t('shell.signOut')}
            </button>
          </form>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">{t('brand.name')}</div>
            <div className="top-title">{title}</div>
          </div>
          <div className="top-actions">
            {profile.role === 'student' ? <OfflineSyncStatus studentId={profile.id} /> : null}
            <LocaleSwitcher />
            <PwaInstallButton />
            <div
              className="profile-chip"
              aria-label={t('shell.profileLabel', { name: profile.full_name, role })}
            >
              <div className="avatar">{initials(profile.full_name)}</div>
              <div>
                <strong>{profile.full_name}</strong>
                <small>
                  {profile.role === 'student'
                    ? t('shell.subtitle.student')
                    : t('shell.affiliation', {
                        role:
                          profile.role === 'jari_admin'
                            ? t('roleTitle.jariAdmin')
                            : t('roleTitle.teacher'),
                        school: profile.schools?.name ?? t('brand.schoolFallback'),
                      })}
                </small>
              </div>
            </div>
          </div>
        </header>
        {children}
      </main>
      <nav className="mobile-nav" aria-label={t('shell.nav.mobile')}>
        {items.map(({ href, labelKey, icon: Icon }) => (
          <Link key={href} className={pathname === href ? 'active' : ''} href={href}>
            <span className="ico">
              <Icon size={19} />
            </span>
            <span>{t(labelKey)}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

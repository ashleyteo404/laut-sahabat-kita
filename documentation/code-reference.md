# Code reference

This reference explains the responsibility of every maintained code and configuration file in the
repository. Generated dependencies under `node_modules/` and build output under `.next/` are not
maintained source and are intentionally excluded.

## Root configuration and tooling

| File                 | Responsibility                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env.local.example` | Template for the two browser-safe Supabase environment variables. Contains no real credentials.                                                                                                               |
| `.gitignore`         | Excludes dependencies, build output, local environment files, TypeScript build state, and the legacy local credential file.                                                                                   |
| `.prettierignore`    | Excludes generated, dependency, environment, and SQL files from automatic formatting. SQL remains manually formatted.                                                                                         |
| `.prettierrc.json`   | Defines the repository's two-space, single-quote, no-semicolon formatting rules.                                                                                                                              |
| `eslint.config.mjs`  | Enables Next.js Core Web Vitals and TypeScript ESLint rules and ignores generated files.                                                                                                                      |
| `next-env.d.ts`      | Next.js-generated TypeScript declarations. It should not be edited manually.                                                                                                                                  |
| `next.config.ts`     | Enables strict React behavior, sets the Server Action body limit, supplies public Supabase configuration, supports the ignored legacy credential file, and sets no-cache headers for the manifest and worker. |
| `package.json`       | Declares supported Node/npm versions, runtime and development dependencies, and development/quality scripts.                                                                                                  |
| `package-lock.json`  | Reproducibly pins the complete npm dependency graph and integrity hashes.                                                                                                                                     |
| `tsconfig.json`      | Enables strict TypeScript, App Router-compatible module resolution, Next.js integration, and the `@/` source alias.                                                                                           |
| `styles.css`         | Global design tokens, layout, responsive behavior, component states, forms, dialogs, dashboards, PWA controls, and the language switcher.                                                                     |

`supabase-config.js` and `.env` may exist locally but are ignored. They are compatibility/operator
files, not tracked application source, and their values MUST not be copied into documentation.

## Continuous integration and scripts

| File                                         | Responsibility                                                                                                                                                                                                                                              |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/supabase-healthcheck.yml` | Runs a scheduled/manual read-only RPC call using GitHub secrets, with minimal repository permissions and concurrency control.                                                                                                                               |
| `scripts/check-i18n.cjs`                     | Verifies what the compiler cannot: that every Bahasa Indonesia message preserves the `{placeholder}` names its English source declares, and that neither dictionary has an orphan key.                                                                      |
| `scripts/check-supabase.cjs`                 | Loads local public credentials, calls representative REST endpoints, verifies offline-sync, bilingual-content and student-username schema readiness, warns while public sign-up is enabled, and prints actionable schema errors without displaying secrets. |
| `scripts/generate-pwa-icons.cjs`             | Uses Sharp to generate PNG favicons, Apple touch icons, regular icons, and a maskable icon from the source SVG.                                                                                                                                             |

## App Router

| File                                        | Responsibility                                                                                                                                                                                     |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/proxy.ts`                              | Next.js request entry point. Negotiates the request locale, then delegates session refresh and redirect behavior to the Supabase proxy helper. Must live under `src/` to be registered.            |
| `src/app/layout.tsx`                        | Root HTML layout, global CSS import, locale-aware metadata, `<html lang>`, icons, viewport settings, and the locale and PWA context providers.                                                     |
| `src/app/manifest.ts`                       | Generates the web app manifest, icons, standalone display behavior, and app shortcuts. Copy is deliberately static and bilingual.                                                                  |
| `src/app/page.tsx`                          | Redirects the site root to the role-aware dashboard.                                                                                                                                               |
| `src/app/login/page.tsx`                    | Public sign-in screen and programme introduction; shows a notice when a password-reset link was invalid or expired.                                                                                |
| `src/app/forgot-password/page.tsx`          | Public staff password-recovery request screen.                                                                                                                                                     |
| `src/app/reset-password/page.tsx`           | Teacher/administrator-only screen for choosing a new password after following a recovery link.                                                                                                     |
| `src/app/auth/confirm/route.ts`             | Recovery-link handler: verifies a `token_hash` or exchanges a PKCE `code` for a session, then redirects only to fixed paths.                                                                       |
| `src/app/(protected)/layout.tsx`            | Requires a current profile and wraps all private pages in the shared application shell.                                                                                                            |
| `src/app/(protected)/error.tsx`             | Client error boundary for protected routes with a retry action and no internal error disclosure.                                                                                                   |
| `src/app/(protected)/dashboard/page.tsx`    | Loads the workspace once and selects the student or staff dashboard from profile role.                                                                                                             |
| `src/app/(protected)/explore/page.tsx`      | Student-only activity catalogue with validated island/mode query filters and current submission state.                                                                                             |
| `src/app/(protected)/passport/page.tsx`     | Student-only identity, learning-session summary, habitat record, and badge passport.                                                                                                               |
| `src/app/(protected)/badges/page.tsx`       | Student-only learning/explorer badge collection with pending and locked states.                                                                                                                    |
| `src/app/(protected)/journal/page.tsx`      | Student-only chronological reflections, evidence thumbnails, review status, and teacher notes.                                                                                                     |
| `src/app/(protected)/review/page.tsx`       | Staff-only pending queue and recent review history scoped by RLS.                                                                                                                                  |
| `src/app/(protected)/students/page.tsx`     | Staff-only table of students, usernames, approved activities, and earned badges, with an Add students link and per-student PIN reset when account management is configured.                        |
| `src/app/(protected)/students/add/page.tsx` | Staff-only student account creation page. Resolves which school the actor may use, shows a clear state when the secret key or a school is missing, and sets `maxDuration` for class-sized batches. |
| `src/app/(protected)/sessions/page.tsx`     | Staff route for recording sessions/attendance and viewing recent learning delivery.                                                                                                                |
| `src/app/(protected)/programme/page.tsx`    | JARI-administrator-only aggregation of schools, villages, participation, hours, and badge pathways.                                                                                                |
| `src/app/actions/auth.ts`                   | Validates sign-in by email (staff) or username (students, mapped to their placeholder login address), maps Supabase Auth error codes to controlled message keys, signs out, and redirects.         |
| `src/app/actions/accounts.ts`               | Re-authorizes staff, parses submitted rows, and calls the account use case to create students or reset a PIN; revalidates affected routes.                                                         |
| `src/app/actions/password.ts`               | Staff password recovery: sends a reset email without revealing whether an account exists, refuses student identifiers, and updates a staff password then ends the account's other sessions.        |
| `src/app/actions/locale.ts`                 | Writes the language preference cookie and revalidates the root layout so every server-rendered surface re-renders in the chosen language.                                                          |
| `src/app/actions/learning.ts`               | Validates and authorizes teacher review and learning-session mutations, calls protected RPCs, and revalidates affected routes.                                                                     |
| `src/app/api/health/route.ts`               | Token-protected, non-cached monitoring endpoint that calls the data-free Supabase health RPC and returns controlled `200`, `401`, or `503` JSON.                                                   |
| `src/app/api/submissions/route.ts`          | Authenticated multipart submission endpoint used by foreground and service-worker sync; applies request-size checks and returns structured JSON carrying a message key and an English fallback.    |

## Components

| File                                             | Responsibility                                                                                                                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/layout/app-shell.tsx`            | Role-specific desktop/mobile navigation, user identity, sign-out, language switcher, install control, and student sync status.                                                              |
| `src/components/i18n/locale-switcher.tsx`        | Two-button English / Bahasa Indonesia form posting to the locale Server Action; works before hydration and without JavaScript.                                                              |
| `src/components/auth/login-form.tsx`             | Accessible client form connected to the sign-in Server Action, accepting an email or username, including pending and error states and a staff forgot-password link.                         |
| `src/components/auth/forgot-password-form.tsx`   | Staff recovery request form with a neutral confirmation message and guidance for students.                                                                                                  |
| `src/components/auth/reset-password-form.tsx`    | New-password and confirmation form connected to the password update Server Action.                                                                                                          |
| `src/components/accounts/add-students-form.tsx`  | Editable multi-row student entry, in-browser CSV loading with an on-screen format guide and template, row-level error marking, and a one-time credentials view with print and CSV download. |
| `src/components/accounts/reset-pin-button.tsx`   | Confirmed PIN reset for one student that reveals the new PIN once.                                                                                                                          |
| `src/components/dashboard/student-dashboard.tsx` | Computes student progress, badges, activity/session learning time, habitats, and island progress cards.                                                                                     |
| `src/components/dashboard/teacher-dashboard.tsx` | Computes staff queue, learner, badge, session, attendance, and habitat summaries and recent review cards.                                                                                   |
| `src/components/activities/activity-card.tsx`    | Activity display/dialog, reflection draft, client validation, photo selection, offline save, retry, removal, and current server/local status.                                               |
| `src/components/badges/badge-card.tsx`           | Reusable presentation of learning, explorer, pending, earned, and locked badge states.                                                                                                      |
| `src/components/islands/island-card.tsx`         | Island summary, progress indicator, activity count, and filtered Explore link.                                                                                                              |
| `src/components/pwa/pwa-status.tsx`              | Registers/updates the service worker, tracks connection/install state, provides install/update actions, and shows manual platform guidance.                                                 |
| `src/components/pwa/offline-sync-status.tsx`     | Counts the signed-in student's queued submissions and triggers retry on reconnect, focus, resume, worker messages, or user action.                                                          |
| `src/components/review/review-card.tsx`          | Displays private evidence/reflection and connects approve/return controls to the review Server Action.                                                                                      |
| `src/components/sessions/session-form.tsx`       | Session, attendance, habitat, observation, and reflection form connected to the session Server Action.                                                                                      |
| `src/components/ui/stat-card.tsx`                | Small shared statistic tile used by student, staff, and programme dashboards.                                                                                                               |

## Shared application libraries

| File                                  | Responsibility                                                                                                                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/types.ts`                    | Shared domain types for roles, content, submissions, badges, sessions, profiles, workspace data, and action responses.                                                                          |
| `src/lib/content.ts`                  | Bilingual typed fallback content for the three islands, initial badges, and pilot activities, resolved per locale by `getFallbackContent`.                                                      |
| `src/lib/utils.ts`                    | Name initials, locale-aware short/long/month date formatting, and guarded percentage calculation.                                                                                               |
| `src/lib/auth.ts`                     | Request-cached profile lookup and central page role enforcement through redirects.                                                                                                              |
| `src/lib/data.ts`                     | Server data-access layer: concurrent RLS queries, content mapping/fallback, private signed evidence URLs, badge compatibility, sessions, attendance, and student summary normalization.         |
| `src/lib/submissions/server.ts`       | Server-only submission use case: validation, identity/role checks, activity checks, duplicate detection, private upload, idempotent insert, cleanup, and route revalidation.                    |
| `src/lib/offline/submission-queue.ts` | Browser IndexedDB schema, queue CRUD, account-scoped foreground sync locks, retry classification with stored message keys, browser events, and Background Sync registration.                    |
| `src/lib/i18n/config.ts`              | Supported locales, default locale, cookie name and attributes, `Intl` tags, display labels, and `Accept-Language` negotiation. Safe in the proxy, on the server, and in the browser.            |
| `src/lib/i18n/translator.ts`          | Placeholder-checked `Translator` type, `{name}` interpolation, and the translator factory. Imports no dictionary.                                                                               |
| `src/lib/i18n/dictionaries/en.ts`     | English source of truth, split into browser-visible and server-only sections, plus the derived message-key and dictionary types.                                                                |
| `src/lib/i18n/dictionaries/id.ts`     | Bahasa Indonesia translations, type-checked for key parity against the English source.                                                                                                          |
| `src/lib/i18n/server.ts`              | Server-only locale and dictionary access: `getLocale`, `getTranslator`, and the browser-visible `getUiMessages` subset, all request-cached.                                                     |
| `src/lib/i18n/client.tsx`             | `LocaleProvider` plus the `useT`, `useLocale`, and `useActionMessage` hooks for client components.                                                                                              |
| `src/lib/accounts/credentials.ts`     | Shared, secret-free rules: username format and normalization, the username-to-login-address mapping, username suggestions, PIN acceptability, and batch limits.                                 |
| `src/lib/accounts/csv.ts`             | Dependency-free class-list CSV parsing (header row, comma or semicolon, BOM, quoting, row cap) and CSV writing for templates and credential downloads.                                          |
| `src/lib/accounts/server.ts`          | Server-only account use case: resolves the permitted school, validates the whole batch before creating anything, creates logins and profiles with rollback, generates PINs, resets PINs.        |
| `src/lib/supabase/admin.ts`           | Server-only Supabase client using `SUPABASE_SECRET_KEY`; the single module allowed to read that key. Returns null when it is not configured.                                                    |
| `src/lib/supabase/env.ts`             | Validates and returns the required public Supabase URL/key without exposing any privileged secret.                                                                                              |
| `src/lib/supabase/server.ts`          | Creates a cookie-aware Supabase server client; cookie writes safely defer to the proxy when invoked from Server Components.                                                                     |
| `src/lib/supabase/proxy.ts`           | Refreshes auth claims/cookies and performs optimistic login/protected-route redirects while preserving API JSON behavior; `/login` and `/forgot-password` are public and `/auth/*` always runs. |

## PWA public files

| File                             | Responsibility                                                                                                                                                                                     |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/sw.js`                   | Service worker with versioned shell/asset caches, an unauthenticated offline fallback, IndexedDB outbox access, Background Sync, and client notifications. Records message keys; never translates. |
| `public/offline.html`            | Static, dependency-free fallback shown only when a navigation request fails without connectivity. Ships Indonesian markup and swaps to English from the locale cookie.                             |
| `public/ocean-passport-icon.svg` | Editable source artwork for all PWA icons.                                                                                                                                                         |
| `public/icon-192.png`            | Standard 192-pixel manifest icon.                                                                                                                                                                  |
| `public/icon-512.png`            | Standard 512-pixel manifest icon.                                                                                                                                                                  |
| `public/icon-maskable-512.png`   | Maskable 512-pixel icon for adaptive mobile launchers.                                                                                                                                             |
| `public/apple-touch-icon.png`    | 180-pixel iOS home-screen icon.                                                                                                                                                                    |
| `public/favicon-32.png`          | 32-pixel browser favicon.                                                                                                                                                                          |

The PNG files are generated artifacts but are committed because browsers and deployment targets
request them directly.

## Supabase database files

| File                                                           | Responsibility                                                                                                                                                                                                                         |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/schema.sql`                                          | Canonical idempotent schema: enums, tables, indexes, Auth trigger, RLS helpers, submission/session RPCs, translation staleness trigger and review view, health functions, policies, private Storage, and bilingual pilot seed content. |
| `supabase/assign-users.example.sql`                            | Operator example for promoting/assigning Auth profiles to student, teacher, and optional administrator roles and schools.                                                                                                              |
| `supabase/migrations/20260821_requirements.sql`                | Marker that directs existing deployments to the canonical requirements-complete schema.                                                                                                                                                |
| `supabase/migrations/20260822_offline_submission_sync.sql`     | Adds client submission UUIDs, uniqueness indexes, and a readiness RPC for safe offline retries.                                                                                                                                        |
| `supabase/migrations/20260822_project_healthcheck.sql`         | Adds the minimal anonymous read-only health-check RPC used by GitHub Actions.                                                                                                                                                          |
| `supabase/migrations/20260823_evidence_security_hardening.sql` | Restricts evidence uploads to students and makes field submissions reference an existing, student-owned private object.                                                                                                                |
| `supabase/migrations/20260911_bilingual_content.sql`           | Adds Bahasa Indonesia content columns, translation review timestamps, the staleness trigger, the operator review queue view, and Indonesian pilot content.                                                                             |
| `supabase/migrations/20260911_translation_audit_followups.sql` | Relaxes the translated-steps constraint to a shape check so English content stays independently editable, and drops the unnecessary privilege elevation on the staleness trigger.                                                      |
| `supabase/migrations/20260914_student_usernames.sql`           | Adds the student `username` column with its format constraint and case-insensitive unique index. No policy or grant changes.                                                                                                           |

## Existing operator documentation

| File                                      | Responsibility                                                                      |
| ----------------------------------------- | ----------------------------------------------------------------------------------- |
| `README.md`                               | Project overview, basic commands, structure, and links into detailed documentation. |
| `SUPABASE_SETUP.md`                       | Step-by-step Supabase project, Auth, schema, user, PWA, and workflow setup.         |
| `OFFLINE_SYNC.md`                         | Concise activation and manual test guide for the IndexedDB submission outbox.       |
| `SUPABASE_KEEPALIVE.md`                   | Optional GitHub Actions health-check configuration and limitations.                 |
| `documentation/uptimerobot-monitoring.md` | UptimeRobot endpoint, token, monitor, response, and operational setup.              |

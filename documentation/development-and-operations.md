# Development and operations

## Prerequisites

- Node.js **20.19 or newer** (Node.js 22 LTS is a suitable team baseline)
- npm 10 or newer
- A Supabase project with permission to run SQL and manage Auth users
- A modern browser; Chrome/Edge is useful for PWA and offline testing

The repository declares the runtime requirement in `package.json`. Use the same Node major in local
development and deployment to reduce build differences.

## Local setup

```powershell
npm install
Copy-Item .env.local.example .env.local
```

Add the Supabase base URL and publishable key to `.env.local`, then run:

```powershell
npm run dev
```

Open `http://localhost:3000`. Restart the dev server after changing environment variables. The
ignored `supabase-config.js` remains a temporary compatibility bridge; new environments SHOULD use
environment variables.

`UPTIME_HEALTHCHECK_TOKEN` is optional for normal application use but required by `/api/health` and
UptimeRobot. It must be a random server-only value of at least 32 characters.

## npm commands

| Command                | Purpose                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `npm run dev`          | Start the Next.js development server.                                                  |
| `npm run build`        | Create a production build and validate App Router compilation.                         |
| `npm start`            | Serve the completed production build.                                                  |
| `npm run lint`         | Run Next.js Core Web Vitals and TypeScript ESLint rules.                               |
| `npm run typecheck`    | Run strict TypeScript checking without writing output.                                 |
| `npm run format`       | Format maintained files with Prettier.                                                 |
| `npm run format:check` | Verify formatting without changing files.                                              |
| `npm run db:check`     | Check remote Supabase tables and required offline schema without printing credentials. |
| `npm run icons`        | Regenerate committed PNG PWA icons from the source SVG.                                |

## Required quality gate

Before merging or deploying, run:

```powershell
npm run format:check
npm run lint
npm run typecheck
npm run build
npm audit
node --check public/sw.js
npm run db:check
```

`npm run db:check` depends on the configured external Supabase project and may correctly fail when a
migration has not yet been applied. Record that as an operational blocker, not a source-code failure.

The project currently has no automated unit, integration, or browser end-to-end suite. Until that is
added, releases MUST also complete the role and offline manual checks below.

## Supabase setup and updates

For a new project:

1. Run the complete `supabase/schema.sql` in Supabase SQL Editor.
2. Create Auth users in the dashboard.
3. Adapt and run `supabase/assign-users.example.sql` to assign roles and schools.
4. Run `npm run db:check`.
5. Test with separate student, teacher, and administrator accounts.

For an existing project, rerun the complete schema or apply the focused migrations documented in
[Database and security](database-and-security.md#migration-procedure). Supabase PostgREST schema
cache updates normally follow SQL changes; if a function remains unavailable, wait briefly and rerun
the check before investigating project/configuration mismatch.

## Deployment

1. Select a platform that supports Next.js 16 and Node 20.19+.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in encrypted platform
   environment settings.
3. Set a random `UPTIME_HEALTHCHECK_TOKEN` when external health monitoring is enabled.
4. Run the production build in CI/deployment.
5. Deploy over HTTPS; service workers and install prompts require a secure context outside localhost.
6. Add the production URL in Supabase Auth URL Configuration.
7. Confirm `/manifest.webmanifest`, `/sw.js`, icons, login, and authenticated redirects.
8. Install the deployed PWA on at least one Android/desktop browser and one iPhone/iPad if those are
   pilot targets.

The service-worker and manifest responses use revalidation headers so new releases can be detected.
If worker or precache behavior changes, bump cache versions in `public/sw.js`.

## Optional Supabase health check

The GitHub Actions workflow calls `project_healthcheck()` three times daily using a publishable key.
Configure `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` as repository Actions secrets and manually run
the workflow once. It returns no application data and has `contents: read` permission only.

This is best-effort monitoring, not a guarantee that a free project will never pause. Review workflow
history and Supabase plan behavior periodically. Full setup is in `SUPABASE_KEEPALIVE.md`.

For monitoring that also checks the deployed application, configure the protected `/api/health`
endpoint using [UptimeRobot monitoring](uptimerobot-monitoring.md).

## Manual release tests

### Authentication and roles

- Unauthenticated protected pages redirect to login.
- Invalid credentials show a controlled error.
- Student-only URLs redirect staff to the dashboard.
- Teacher/admin URLs redirect students.
- A teacher cannot see or review a student from another school.
- A JARI administrator can view programme reporting.
- Sign-out clears the session and returns to login.

### Learning workflow

- Online activity saves without a photo and produces a learning badge.
- Field activity requires supported evidence and remains pending.
- Teacher approval produces an explorer badge.
- Return requires feedback and allows the student to try again.
- Duplicate clicks/reconnect retries do not create duplicate submissions or badges.

### Sessions and reporting

- A teacher with a school can record a session.
- Attendance accepts only students in that teacher's school.
- Student passport totals reflect recorded attendance.
- Programme totals match underlying sessions, attendance, submissions, and badge tiers.

### Language

- Clear cookies, set the browser language to Indonesian, and open `/login`. The page MUST render in
  Bahasa Indonesia on the first paint, not after a reload, and `<html lang>` MUST be `id`.
- Repeat with an English browser language and confirm `<html lang="en">`.
- Press **EN** / **ID** in the switcher. The page updates in place without a full reload, and the tab
  title changes with it.
- Sign out and back in. The explicit choice MUST survive; it beats browser detection.
- Check each role: a student sees translated dashboard, Explore, Passport, Badges, Journal and an
  activity dialog; a teacher sees a translated hero date (`Friday, 11 September 2026` versus
  `Jumat, 11 September 2026`), review queue, students table and session form; a JARI administrator
  sees the translated programme page.
- At 390px width the switcher stays visible and tappable beside the install and sync buttons.
- Sign in with a wrong password in each language. The message MUST be translated and MUST NOT be a
  raw Supabase string.

### PWA/offline

Complete the full checklist in [PWA and offline sync](pwa-and-offline-sync.md#manual-verification).

While offline with a queued submission, switch language and confirm the queued-state copy and any
stored upload error re-render in the new language.

## Release checklist

- [ ] Database migrations are applied and `npm run db:check` passes.
- [ ] Formatting, lint, typecheck, build, dependency audit, and worker syntax checks pass.
- [ ] Environment contains only the browser-safe Supabase URL/key.
- [ ] Auth production URLs and redirects are correct.
- [ ] Role, wrong-school, submission, badge, and session tests pass.
- [ ] Offline and installed-PWA tests pass on pilot devices.
- [ ] Both languages verified on all three roles and on the sign-in page.
- [ ] Student-photo consent, retention, and shared-device procedures are agreed operationally.
- [ ] Documentation and service-worker cache versions reflect the release.

## Troubleshooting

| Symptom                         | Check                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Missing Supabase configuration  | Confirm both variables, base URL format, and server restart.                                                        |
| `PGRST202`/missing function     | Apply the current schema/migration to the configured project.                                                       |
| `PGRST204`/missing column       | Apply the offline submission migration or complete schema.                                                          |
| Teacher sees no students        | Teacher and students must share a non-null `school_id`.                                                             |
| Field upload denied             | Confirm student role, private `evidence` bucket, policy migration, allowed MIME type, size, and signed-in session.  |
| Saved work will not upload      | Use the same student account, reconnect, open the app, press the waiting button, and inspect the stored error.      |
| Install option unavailable      | Use HTTPS or localhost, reload after worker registration, and use the browser's install/Add to Home Screen control. |
| Stale installed app             | Press Update app when shown or close/reopen after the new worker activates.                                         |
| Wrong language on first visit   | Check the browser's `Accept-Language` header, then the `lsk-locale` cookie. An explicit choice always wins.         |
| Literal `{name}` on screen      | A Bahasa Indonesia message dropped a placeholder. Compare that key's value against `dictionaries/en.ts`.            |
| Content shows English in Bahasa | That row has no `_ind` translation yet. Review `public.translation_review_queue` and fill the column.               |

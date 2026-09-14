# Digital Ocean Passport

A Next.js 16 App Router application for the Laut Sahabat Kita pilot on Gili Bidara, Gili Range, and Gili Sarang.

Technical architecture, per-file code reference, database security, offline behavior, operations,
and the latest code audit are indexed in [documentation/README.md](documentation/README.md).

## Technology

- Next.js App Router and TypeScript
- React Server Components by default
- Server Actions for authentication and reviews, plus an idempotent Route Handler for offline sync
- Supabase Auth, PostgreSQL, Row Level Security, and private Storage
- Zod validation at every mutation boundary
- Database-managed guide content for the three pilot islands, bilingual in English and Bahasa Indonesia
- Interface available in English and Bahasa Indonesia, detected on first visit and switchable anywhere
- Separate online learning and teacher-verified explorer achievements
- Teacher session, attendance, field observation, and reflection records
- Teacher-managed student accounts: add a class by hand or CSV; students sign in with a username and PIN
- JARI programme reporting for schools, villages, learning hours, and reach
- Installable PWA with a durable IndexedDB outbox for offline reflections and photo evidence

## Local development

1. Copy `.env.local.example` to `.env.local`.
2. Add the Supabase Project URL and publishable key.
3. Install dependencies and start Next.js:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

The existing values in `supabase-config.js` are read temporarily as a migration fallback. New environments should use `.env.local`, and deployed environments should use their platform environment-variable settings.

## Commands

```powershell
npm run dev
npm run format:check
npm run lint
npm run typecheck
npm run build
npm start
npm run db:check
npm run icons
```

## Install as an app

The PWA works on `localhost` during development and requires HTTPS when deployed. Open the site in
Chrome or Edge and use the in-app **Install** prompt. On iPhone or iPad, open it in Safari and choose
**Share → Add to Home Screen**.

The service worker deliberately does not cache authenticated pages containing student information.
It provides the installable app shell, cached static assets, an offline fallback, connection status,
and a durable local submission queue. Completed reflections and photos upload automatically after
connectivity returns; Background Sync is used where the browser supports it.

Offline submission setup and testing are documented in [OFFLINE_SYNC.md](OFFLINE_SYNC.md).

Run `npm run icons` whenever `public/ocean-passport-icon.svg` changes.

## Structure

```text
src/
  app/
    (protected)/       Authenticated App Router pages
    actions/           Validated Server Actions
    login/             Public authentication route
  components/          Focused UI components by domain
  lib/
    i18n/               Locale negotiation and typed message dictionaries
    supabase/           Browser, server, and Proxy clients
    auth.ts             Central authorization checks
    data.ts             Server-only data access
    content.ts          Bilingual three-island learning content
    types.ts            Shared domain types
  proxy.ts              Locale negotiation, session refresh, and optimistic redirects
supabase/schema.sql     Database, RLS, Storage, and seed content
```

After pulling database-related changes, rerun the full idempotent `supabase/schema.sql` in the Supabase SQL Editor. `npm run db:check` verifies the required tables and columns without displaying credentials.

Database setup is documented in [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

Optional Free-plan availability monitoring is documented in
[SUPABASE_KEEPALIVE.md](SUPABASE_KEEPALIVE.md).
An UptimeRobot-ready application and database endpoint is documented in
[documentation/uptimerobot-monitoring.md](documentation/uptimerobot-monitoring.md).

Use Node.js 20.19 or newer and npm 10 or newer. The complete development and release workflow is in
[documentation/development-and-operations.md](documentation/development-and-operations.md).

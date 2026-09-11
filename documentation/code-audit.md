# Code audit

## Audit record

| Field       | Value                                                                                                                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Review date | 2026-09-11                                                                                                                                                                                |
| Scope       | Next.js application, TypeScript/React components, CSS, PWA worker/offline storage, scripts, npm dependencies, Supabase schema/migrations/RLS/Storage, and operational configuration       |
| Method      | Manual code review, authorization/data-flow tracing, dependency audit, static analysis, type checking, production compilation, JavaScript syntax check, and remote schema readiness check |
| Baseline    | Three-island Digital Ocean Passport pilot                                                                                                                                                 |

## Executive summary

The application has a sound prototype architecture: App Router server-first rendering, centralized
role checks, RLS as the authorization boundary, protected database RPCs for sensitive transitions,
a private evidence bucket, validated mutation inputs, and an idempotent offline outbox. The audit
found no committed privileged Supabase secret and no use of unsafe HTML injection or dynamic code
execution.

The review resolved several correctness, security, and maintainability issues. The main remaining
engineering gap is automated testing. The configured live Supabase project must also receive the
current offline/security migrations before it can be considered release-ready.

## Resolved findings

| Severity | Finding                                                                                                                                                                                                                                         | Resolution                                                                                                                                                                                      |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High     | Production dependency tree contained vulnerable `nanoid` 3.3.17 through PostCSS.                                                                                                                                                                | Updated Next.js and matching ESLint config to 16.3.2 and resolved `nanoid` 3.3.18; `npm audit` reports zero vulnerabilities.                                                                    |
| High     | Storage policy was named student-only but allowed any authenticated role to upload to its own path; the field-submission trigger accepted a non-null path without proving ownership or object existence.                                        | Added `private.is_student()`, tightened Storage insert policy, and hardened the trigger to require an existing student-owned evidence object. Added `20260823_evidence_security_hardening.sql`. |
| Medium   | `Submission` required `client_submission_id`, but the central query omitted it and relied on a cast.                                                                                                                                            | Selected the field explicitly so runtime data matches the shared type and offline idempotency model.                                                                                            |
| Medium   | PostgreSQL `bigint` RPC values could arrive as strings while dashboards expected numbers.                                                                                                                                                       | Normalize session count and learning minutes with `Number()` and validate habitat values.                                                                                                       |
| Medium   | One global foreground-sync promise could return another account's in-flight result or ignore a manual needs-attention retry.                                                                                                                    | Serialize foreground sync per student and queue the stronger manual retry after an active automatic sync.                                                                                       |
| Low      | IndexedDB failures from automatic refresh/retry/removal paths could become unhandled promise rejections.                                                                                                                                        | Added guarded queue reads and user-facing retry/removal error handling.                                                                                                                         |
| Low      | Documentation directory was excluded by `.gitignore`.                                                                                                                                                                                           | Removed the exclusion so technical documentation can be version controlled.                                                                                                                     |
| Low      | Repeated inline colour declarations bypassed the stylesheet.                                                                                                                                                                                    | Replaced them with the existing component class hierarchy in `styles.css`.                                                                                                                      |
| Low      | Legacy static-prototype selectors remained after the Next.js migration, increasing stylesheet noise.                                                                                                                                            | Removed unused modal, toast, timeline, chart, role-switch, preview, and notification selectors; every remaining class selector maps to current source or responsive states.                     |
| Low      | Install help could remain visible after the available PWA action changed.                                                                                                                                                                       | Render help only while the action is still iOS/manual installation.                                                                                                                             |
| High     | Root-level `proxy.ts` was never registered, because a project using a `src/` directory requires `src/proxy.ts`. Supabase session refresh at the request boundary had therefore never run; page access was protected only by `requireProfile()`. | Moved the file to `src/proxy.ts`. `npm run build` now reports `Proxy (Middleware)`, and session refresh runs on every non-static request as documented.                                         |
| Medium   | Supabase Auth and PostgREST error text was rendered verbatim in sign-in, review, session, and submission forms, which is untranslatable and a small account-enumeration surface.                                                                | Map error codes to controlled dictionary keys and return message keys from every Server Action, making the documented promise that invalid credentials show a controlled error actually true.   |
| Low      | The proxy matcher did not exclude `sw.js`, `offline.html`, or `manifest.webmanifest`, so signed-out visitors were redirected to `/login` for all three and the service worker could not register there.                                         | Added the three paths to the matcher exclusion list.                                                                                                                                            |

## Positive controls observed

- Protected layout and page-level role checks are centralized through `requireProfile`.
- API routes return structured unauthenticated errors instead of HTML redirects.
- Mutation inputs use Zod and repeat critical validation at the database layer.
- The submission server derives identity from verified claims and refuses a queued student mismatch.
- Online/field status and badge awards are derived by database triggers/RPCs, not trusted client data.
- Teacher review is limited by student school and row locking prevents repeat review.
- Learning-session school is derived from the current profile; submitted attendance is filtered by
  school and role.
- Private evidence uses short-lived signed URLs and restricted MIME/size rules.
- Offline retries are idempotent at storage and database levels.
- Authenticated page HTML is excluded from service-worker caches.
- GitHub Actions health check has read-only repository permission and calls a data-free RPC.
- Environment/legacy credential files are ignored, and the documentation requires browser-safe keys
  only.

## Verification results

| Check                       | Result                   | Notes                                                                                                                                                         |
| --------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm audit`                 | PASS                     | Zero known vulnerabilities after dependency resolution.                                                                                                       |
| `npm run lint`              | PASS                     | Next.js Core Web Vitals and TypeScript ESLint rules.                                                                                                          |
| `npm run typecheck`         | PASS                     | Strict TypeScript, no emit.                                                                                                                                   |
| `npm run format:check`      | PASS                     | Every maintained Prettier-supported file matches repository style.                                                                                            |
| `npm run build`             | PASS                     | Next.js 16.3.2 production build compiled all static and dynamic routes.                                                                                       |
| `node --check public/sw.js` | PASS                     | Service-worker JavaScript syntax.                                                                                                                             |
| `npm run db:check`          | EXTERNAL UPDATE REQUIRED | Core protected resources are ready, but the configured project does not expose `offline_submission_schema_ready()` (`PGRST202`). Apply current SQL and rerun. |

## Remaining risks and recommended work

### 1. Automated tests are absent — medium

Static checks and a production build cannot prove role boundaries, RPC behavior, IndexedDB recovery,
or browser lifecycle behavior. Add, in order:

1. unit tests for utilities, content mapping, validation, and retry classification;
2. integration tests against a disposable/local Supabase project for RLS and RPC roles;
3. Playwright tests for login, online/field submission, review, return/resubmit, and PWA reconnect.

### 2. Remote schema update is outstanding — high operational

Source code cannot activate database objects by itself. Apply `supabase/schema.sql` or at least the
offline-sync, health-check, and evidence-security migrations, then require `npm run db:check` and the
role-based manual test before pilot use.

### 3. Database types are maintained manually — low to medium

The repository uses strict domain interfaces but does not generate Supabase schema types. Query
casts can drift when schema changes. Generate database types in CI or as an update workflow, then
type the Supabase clients and mapping boundary.

### 4. Content fallback can hide content-query failures — low

Falling back to `src/lib/content.ts` keeps the prototype usable when database content tables lag,
but it can conceal a deployment/configuration problem. Add structured server monitoring and expose a
staff-only diagnostic indicator before larger-scale rollout.

### 5. Local student evidence is not application-encrypted — operational/privacy

IndexedDB is origin-isolated, not encrypted by this app. An unlocked shared device/browser profile
can retain a photo until sync/removal. Define consent, device-lock, sign-out, retention, and abandoned
queue procedures for the pilot. Consider client-side encryption only with a carefully designed key
recovery model; it is not a simple drop-in change.

### 6. Observability is minimal — low

Expected failures reach the UI, but there is no structured error/event monitoring for sync failure,
RLS denial, upload failure, or worker update. Add privacy-preserving operational metrics before
scaling across programmes; do not record reflection text, photo content, tokens, or unnecessary
student identifiers.

### 7. Runtime baseline must be upgraded — low operational

The audit shell reported Node 20.9.0, while current tooling requires Node 20.19+ and the repository
now declares that minimum. Upgrade developer/CI/deployment environments, preferably to one shared
Node 22 LTS version.

## Review conclusion

The source is suitable for continued prototype development after the documented remote database
updates and manual role/offline verification. A broader student pilot should not be treated as fully
release-hardened until automated RLS/workflow tests and operational photo/privacy procedures are in
place.

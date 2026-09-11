# Database and security

## Security model

The application treats Supabase RLS and database functions as the final authorization boundary.
Route checks improve navigation and user experience, but they are not the only protection. Every
request uses the signed-in user's JWT and browser-safe publishable key; no `service_role` key is
present in application code.

Security decisions follow these rules:

- Identity comes from `auth.uid()`, never from a browser-supplied role or school.
- Students may read and submit only their own learning records.
- Teachers may read/review only students in their assigned school.
- JARI administrators may review and report across schools.
- Private photo paths begin with the student's UUID.
- Field submissions must reference an existing evidence object owned by that student.
- The database derives submission state and awards; the browser cannot choose them.
- Learning-session school ownership is derived from the signed-in staff profile.

## Data model

| Entity               | Purpose                                                                                | Important relationships/invariants                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `schools`            | Pilot schools and villages.                                                            | Referenced by profiles and learning sessions.                                                                          |
| `profiles`           | Application identity linked one-to-one with `auth.users`.                              | Defaults to `student`; trusted SQL administration assigns staff roles and schools.                                     |
| `islands`            | Gili Bidara, Gili Range, Gili Sarang content containers.                               | Stable text IDs are referenced by activities and sessions.                                                             |
| `badges`             | Initial learning/explorer achievement definitions.                                     | Activities reference one badge definition.                                                                             |
| `activities`         | Online and field guidebook activities.                                                 | Published activities belong to an island and badge; steps are JSON arrays.                                             |
| `submissions`        | Student reflection, optional/private evidence path, review state, and idempotency key. | Reflection minimum is enforced; client UUID is unique per student; only one pending/approved row per student/activity. |
| `student_badges`     | Award event for a learning or explorer tier.                                           | Unique per student/badge/tier; may reference its source submission and reviewer.                                       |
| `learning_sessions`  | Teacher-recorded lesson/field delivery.                                                | Belongs to the staff member's school and may reference an island.                                                      |
| `session_attendance` | Student presence in a learning session.                                                | Composite primary key prevents duplicate attendance.                                                                   |

## Database functions and triggers

| Function                          | Invocation                  | Responsibility                                                                                       |
| --------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `handle_new_user`                 | Auth insert trigger         | Creates a safe student profile. It does not accept a role from user metadata.                        |
| `private.is_student`              | RLS/Storage helper          | Confirms the current profile is a student.                                                           |
| `private.is_teacher`              | RLS helper                  | Confirms the current profile is teacher or administrator.                                            |
| `private.can_review_student`      | RLS/RPC helper              | Enforces same-school teacher or global-administrator review scope.                                   |
| `private.can_manage_school`       | RLS helper                  | Enforces same-school teacher or global-administrator session visibility.                             |
| `private.can_manage_session`      | RLS helper                  | Resolves a session to its managed school.                                                            |
| `private.path_owner`              | Storage helper              | Safely parses the first private-object path segment as a UUID.                                       |
| `enforce_submission_state`        | Before submission insert    | Validates student/activity/evidence, rejects duplicate active work, and derives online/field status. |
| `award_online_badge`              | After submission insert     | Awards the appropriate badge tier when an inserted row is approved.                                  |
| `review_submission`               | Authenticated RPC           | Locks and reviews a pending row, records reviewer/time, and awards an explorer badge on approval.    |
| `create_learning_session`         | Authenticated RPC           | Validates staff school, inserts a session, and filters attendance to students in that school.        |
| `get_my_learning_record`          | Authenticated RPC           | Returns only the caller's session count, learning minutes, and distinct habitats.                    |
| `project_healthcheck`             | Anonymous/authenticated RPC | Returns only `true` for external availability monitoring.                                            |
| `offline_submission_schema_ready` | Anonymous/authenticated RPC | Returns a boolean indicating whether offline idempotency schema objects exist.                       |

`SECURITY DEFINER` functions set an empty search path and fully qualify database objects. Execute
permissions are revoked from `public` unless anonymous access is an intentional part of the
function's contract.

## RLS access matrix

| Resource                                        | Student                                                | Teacher                    | JARI administrator  |
| ----------------------------------------------- | ------------------------------------------------------ | -------------------------- | ------------------- |
| Published islands/badges/activities and schools | Read                                                   | Read                       | Read                |
| Profiles                                        | Own                                                    | Own school                 | All                 |
| Submissions and awarded badges                  | Own                                                    | Own-school students        | All                 |
| Learning sessions and attendance                | Student summary RPC only                               | Own school                 | All                 |
| Evidence objects                                | Own objects                                            | Own-school student objects | All student objects |
| Submission insert                               | Own student UUID; trigger enforces role/state/evidence | Denied by trigger          | Denied by trigger   |
| Direct table update/delete                      | Denied                                                 | Denied                     | Denied              |

Review and session mutations deliberately use RPC functions instead of direct table update grants.

## Evidence Storage

The `evidence` bucket is private and limited to JPG, PNG, and WebP objects of at most 3 MB. The
application uses this deterministic path:

```text
<student-uuid>/<client-submission-uuid>.<jpg|png|webp>
```

Storage insert policy verifies that the current user is a student and owns the first path segment.
The submission trigger verifies both path ownership and object existence. The application issues
one-hour signed URLs only after an RLS-scoped submission query. Students may delete their own
objects; the submission use case also removes a newly uploaded object if the database insert fails.

## Migration procedure

For a new Supabase project, run all of `supabase/schema.sql` in SQL Editor. For an existing project,
the safest option is also to rerun the canonical schema because it is idempotent and includes current
policies and seed content.

Focused upgrades, in order, are:

1. `supabase/migrations/20260822_offline_submission_sync.sql`
2. `supabase/migrations/20260822_project_healthcheck.sql`
3. `supabase/migrations/20260823_evidence_security_hardening.sql`

After any database change, run:

```powershell
npm run db:check
```

The check is intentionally anonymous. `42501` for protected tables is treated as ready. A
`PGRST202`, `PGRST204`, `PGRST205`, or missing-table error means the remote schema/cache requires an
update. The check does not prove every RLS branch; complete the role-based manual test in
[Development and operations](development-and-operations.md).

## Credential handling

These browser-safe values are required:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=PUBLIC_KEY
```

`.env`, `.env.local`, and `supabase-config.js` are ignored. Production values belong in the hosting
platform's encrypted environment settings. GitHub health-check values belong in Actions secrets.
Never commit database passwords, Supabase secret keys, `service_role` keys, user passwords, or JWTs.

`UPTIME_HEALTHCHECK_TOKEN` is an optional server-only secret used solely to authorize `/api/health`.
It must be random, contain at least 32 characters, and be stored in encrypted deployment settings and
the UptimeRobot monitor—not in tracked source.

## Operator checks

- Confirm RLS remains enabled on every public application table.
- Confirm the `evidence` bucket remains private.
- Create users through Supabase Auth before assigning profile roles/schools.
- Promote staff only through a trusted SQL/operator workflow.
- Review schema changes for both grants and RLS policies.
- Test student, teacher, administrator, wrong-school, and unauthenticated paths before release.
- Maintain retention/consent procedures for student photos outside the codebase; offline copies may
  remain on a device until upload or explicit removal.

## Bilingual content

Island, badge, and activity text exists in two languages in the same row. English columns are the
source of truth; the Bahasa Indonesia partner column carries the `_ind` suffix (ISO 639-2/T), chosen
over `_id` because `id` is every table's primary key and `*_id` already means a foreign key
throughout this schema.

| Table               | English source columns           | Indonesian columns                           |
| ------------------- | -------------------------------- | -------------------------------------------- |
| `public.islands`    | `name`, `tagline`, `description` | `name_ind`, `tagline_ind`, `description_ind` |
| `public.badges`     | `name`, `description`            | `name_ind`, `description_ind`                |
| `public.activities` | `title`, `description`, `steps`  | `title_ind`, `description_ind`, `steps_ind`  |

The application reads the Indonesian value when it is present and non-blank, and falls back to
English otherwise. `steps_ind` falls back as a whole array rather than element by element, because a
half-translated ordered instruction list is worse than a consistently English one. The
`activities_steps_ind_shape` check constraint enforces that a translated list is a JSON array of
exactly the same length as its English source.

Editing English content therefore reaches both audiences immediately, with no deployment.

### Translation staleness

Every content table also carries `translation_source_updated_at` and `translation_reviewed_at`. A
translation is stale when `translation_reviewed_at is null or translation_reviewed_at <
translation_source_updated_at`.

| Function / trigger                                                | Behavior                                                                                                                           |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `public.mark_translation_stale()`                                 | `BEFORE INSERT OR UPDATE` trigger function. Receives the English source column names and derives each partner by appending `_ind`. |
| `before_islands_translation_source` / `_badges_` / `_activities_` | Bind the function to the three content tables.                                                                                     |

Changing only an English column clears `translation_reviewed_at`, marking the row for review.
Changing both languages in one statement sets `translation_reviewed_at` to `now()` — editing both
together _is_ a completed review, and this branch is what stops the idempotent seeds in
`supabase/schema.sql` from reporting every row as stale on each rerun.

`public.translation_review_queue` lists stale rows for operators. It is declared
`with (security_invoker = true)` so it cannot bypass RLS by running as its owner, and all privileges
are revoked from `anon` and `authenticated`, making it an operator-only object.

### Access control impact

**No policy or grant changes were required.** These are new columns on existing tables, and
`grant select on public.schools, public.islands, public.badges, public.activities to authenticated`
is table-scoped rather than column-scoped, so the new columns are readable automatically. The added
columns hold content and review metadata only — no personal data — so exposing
`translation_reviewed_at` to authenticated readers carries no risk. The review queue view is the one
new object and is explicitly revoked.

### Migration procedure

Apply `supabase/migrations/20260911_bilingual_content.sql` to an already-deployed project, or rerun
`supabase/schema.sql`, which is idempotent and contains the same definitions. After editing English
content, operators SHOULD review `public.translation_review_queue` and update the matching `_ind`
columns.

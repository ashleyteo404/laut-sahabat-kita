# Supabase setup

This setup creates real student and teacher accounts, secured database records, a private photo bucket, and the badge approval workflow.

## 1. Create the project

1. Sign in at `https://supabase.com/dashboard`.
2. Select **New project**.
3. Choose an organisation, enter a project name such as `laut-sahabat-kita`, create a strong database password, and choose the closest region.
4. Wait until the project reports that it is ready.

Keep the database password in a password manager. It does not belong in this website.

## 2. Create the database and security policies

1. Open **SQL Editor** in the Supabase dashboard.
2. Select **New query**.
3. Copy the complete contents of [`supabase/schema.sql`](supabase/schema.sql).
4. Paste it into the editor and select **Run**.
5. Confirm the result says success.

The script creates:

- schools, profiles, islands, activities, badges, submissions, and student badge tables;
- all nine pilot activities and six initial badges;
- row-level security for students, teachers, and JARI administrators;
- a private `evidence` Storage bucket with a 3 MB image limit;
- student-only evidence uploads and database verification that field evidence exists and belongs to
  the submitting student;
- automatic profile creation for new Auth users;
- automatic online badge awards and protected teacher review logic.
- separate learning and verified explorer badge tiers;
- idempotent offline submission IDs for safe reconnect retries;
- teacher-recorded sessions, attendance, learning hours, habitats, and reflections;
- JARI programme-wide reporting.

You can safely run the script again when updating pilot content. Do not manually make the `evidence` bucket public.

## 3. Configure authentication

1. Open **Authentication → URL Configuration**.
2. For local testing, set **Site URL** to `http://localhost:3000`.
3. Add `http://localhost:3000/**` to **Redirect URLs**.
4. When the app is deployed, add the production HTTPS URL as another redirect URL and make it the Site URL.
5. Open **Authentication → Providers → Email** and leave email/password authentication enabled.

6. Open **Authentication → Sign In / Providers** and turn **off** **Allow new users to sign up**.

Public self-registration is intentionally not part of this app. Leaving sign-up enabled lets anyone with the project URL and publishable key create an account directly through the Supabase API, without the app. `npm run db:check` warns while it is enabled.

## 4. Create the first teacher

Teacher and JARI administrator accounts are created by an administrator in Supabase. Student accounts are created by teachers inside the app (step 5 onwards).

1. Open **Authentication → Users**.
2. Select **Add user → Create new user**.
3. Create `teacher@example.org` with a temporary password and enable automatic confirmation.
4. Return to **SQL Editor** and open a new query.
5. Copy [`supabase/assign-users.example.sql`](supabase/assign-users.example.sql).
6. Replace the example emails and profile names, and remove the student example if you are creating students in the app.
7. Run the query and check the teacher is assigned to SDN Labuhan Pandan.

New users always start as students. Only a trusted administrator using the SQL Editor should promote an account to `teacher` or `jari_admin`. The assignment example includes an optional JARI coordinator account.

## 5. Connect this website

1. In Supabase, open the project's **Connect** dialog or **Settings → API**.
2. Copy the **Project URL**.
3. Copy the **Publishable key**. Older projects may label the browser-safe equivalent as the `anon` key.
4. Copy `.env.local.example` to a new file named `.env.local`.
5. Paste the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

The publishable key may be present in browser code because row-level security protects the data. Never place a `service_role`, secret, or database password in this repository. The original `supabase-config.js` is supported only as a temporary migration fallback.

To let teachers create student accounts, also add the **Secret key** from the same API settings page:

```env
SUPABASE_SECRET_KEY=YOUR_SECRET_KEY
```

This key bypasses row-level security. Put it only in `.env.local` and in your hosting platform's server environment variables (in Vercel, as a normal variable — **not** prefixed `NEXT_PUBLIC_`). Never commit it or share it in messages. Without it the app still works; the **Add students** page just explains that account creation is not set up.

## 6. Run the app locally

From the project folder, run:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

Verify that the configured project has the current schema:

```powershell
npm run db:check
```

## 7. Install the PWA

1. For local testing, open `http://localhost:3000` in Chrome or Edge.
2. Use the **Install app** prompt when it appears.
3. On iPhone or iPad, deploy the app to an HTTPS address, open it in Safari, and select **Share → Add
   to Home Screen**.
4. Launch the installed app and briefly disable the network to confirm the offline status and fallback
   screen work.

The service worker does not store authenticated student pages in its cache. When a student submits
without connectivity, the complete reflection and photo are stored in IndexedDB. Supported browsers
upload in the background; iPhone and iPad retry when the PWA is reopened or resumed. See
[`OFFLINE_SYNC.md`](OFFLINE_SYNC.md) for the complete test procedure.

## 8. Test the complete workflow

1. Sign in as the teacher, open **Students → Add students**, and create a student. Leave username and PIN blank to have them generated. Write down the username and PIN shown — they appear only once.
2. Sign out and sign in as that student using the username and PIN.
3. Complete an online activity. It should immediately appear as complete with its learning badge.
4. Start a field activity, add a JPG, PNG, or WebP image under 3 MB, write at least ten characters, and submit it.
5. Confirm the activity says it is waiting for teacher approval.
6. Sign out and sign in as the teacher.
7. Open **Review**, inspect the private photo and reflection, then approve the submission.
8. Sign back in as the student and confirm the badge is earned.
9. Repeat once using **Return for changes** and verify the student sees the returned status.
10. As the teacher, open **Sessions**, record attendance and a reflection, then confirm the session appears in the recent-session list.
11. As a `jari_admin`, open **Programme** and confirm school reach, learning hours, badge pathways, and participation are aggregated.

## 9. Add more schools and users

Add a school in the Table Editor or SQL Editor, then use its UUID when assigning profiles. Teachers can only see students whose `school_id` matches their own. A `jari_admin` can see all schools.

Example:

```sql
insert into public.schools (name, village)
values ('School name', 'Village name')
returning id;
```

## Troubleshooting

- **Missing Supabase configuration:** confirm both variables exist in `.env.local`, then restart `npm run dev`.
- **Invalid login credentials:** confirm the user exists and is confirmed under Authentication → Users.
- **Profile not found:** the user was created before the schema trigger. Run the assignment query; insert a matching profile first if necessary.
- **Add students says account creation is not set up:** add `SUPABASE_SECRET_KEY` to the server environment and restart or redeploy.
- **A student forgot their PIN:** a teacher opens **Students** and selects **Reset PIN** on that student. The new PIN is shown once.
- **Creating students fails with a database error:** run `supabase/migrations/20260914_student_usernames.sql`.
- **Teacher sees no students:** verify both teacher and students have the same `school_id`.
- **Photo upload is denied:** confirm the `evidence` bucket and its policies were created by `schema.sql`, the user is signed in, and the image is an allowed type under 3 MB.
- **Saved submissions do not sync:** run `20260822_offline_submission_sync.sql`, sign in as the same student who saved the work, and use the **waiting** button in the header to retry.
- **Changes appear stale:** hard-refresh once so the updated service worker cache activates.

## Translating pilot content

Island, badge, and activity text lives in one row per item, with an English source column and an
optional Bahasa Indonesia partner suffixed `_ind` (`title` / `title_ind`, and so on). The app shows
the Indonesian value when present and falls back to English when it is null, so English edits reach
both audiences immediately and a translation can be supplied later without a deployment.

Editing only an English column marks that row's translation as needing review. Editing both
languages in the same statement counts as a completed review:

```sql
update public.activities
set title = 'Meet the coral neighbourhood',
    title_ind = 'Kenali tetangga karang'
where id = 'coral-basics';
```

List everything awaiting a translator, most recently changed first:

```sql
select * from public.translation_review_queue order by translation_source_updated_at desc;
```

That view is operator-only — it is revoked from `anon` and `authenticated`, so run it as the project
owner in the SQL Editor. If a translation is written outside the app (for example imported in bulk),
set `translation_reviewed_at = now()` on those rows to clear them from the queue.

Step counts must match: `steps_ind` has to be a JSON array with exactly as many entries as `steps`,
or the `activities_steps_ind_shape` constraint rejects the update. The app falls back to the whole
English list rather than mixing languages inside one set of instructions.

# Supabase Free project health check

For an alternative that monitors both the deployed app and database through UptimeRobot, see
[`documentation/uptimerobot-monitoring.md`](documentation/uptimerobot-monitoring.md).

Supabase may pause Free projects with low activity over seven days. Its current guidance says that a
few user database requests each day are typically enough to avoid automatic pausing, but only a paid
plan guarantees that a project will not be paused.

This repository includes a read-only database function and a GitHub Actions workflow that calls it at
08:23, 16:23, and 00:23 Singapore time. The endpoint returns only `true`; it cannot read or modify
student information.

## 1. Add the health-check function

1. Open the project in the Supabase Dashboard.
2. Open **SQL Editor → New query**.
3. Copy all of `supabase/migrations/20260822_project_healthcheck.sql` into the query.
4. Select **Run** and confirm it succeeds.

Running the latest complete `supabase/schema.sql` also creates this function.

## 2. Add the GitHub Actions secrets

Push the repository to GitHub, then open its page:

1. Select **Settings → Secrets and variables → Actions**.
2. Select **New repository secret**.
3. Create `SUPABASE_URL` using the project URL from Supabase's **Connect** dialog. It should look like
   `https://PROJECT_REF.supabase.co`, without `/rest/v1`.
4. Create `SUPABASE_PUBLISHABLE_KEY` using the browser-safe publishable key from the same dialog.

Do not use a database password, secret key, or `service_role` key. The workflow only needs the
publishable key.

## 3. Publish and test the workflow

The workflow must be committed to the repository's default branch:

```powershell
git add .github/workflows/supabase-healthcheck.yml `
  supabase/migrations/20260822_project_healthcheck.sql `
  supabase/schema.sql SUPABASE_KEEPALIVE.md README.md
git commit -m "Add Supabase health check"
git push
```

Then:

1. Open the repository's **Actions** tab.
2. Select **Supabase health check**.
3. Select **Run workflow → Run workflow**.
4. Open the run and confirm it says `Supabase database health check passed.`

Scheduled workflows can run late during busy periods. GitHub also disables schedules in a public
repository after 60 days without repository activity; if that applies, re-enable the workflow from
the **Actions** tab.

## Troubleshooting

- **404 / function not found:** run `20260822_project_healthcheck.sql` in the correct Supabase project.
- **401 / invalid API key:** replace the GitHub publishable-key secret; do not add it as a Bearer token.
- **Could not resolve host:** confirm `SUPABASE_URL` is the base project URL without `/rest/v1`.
- **Workflow does not run on schedule:** confirm it is on the default branch and enabled under Actions.
- **Project was still paused:** resume it in Supabase and review the Actions history. This health check
  is best-effort; upgrading is the only documented guarantee against pausing.

# UptimeRobot monitoring

## Purpose

The public `GET /api/health` Route Handler checks the real Supabase `project_healthcheck()` RPC. An
UptimeRobot request therefore verifies both the deployed Next.js application and its database while
generating a small database request. The endpoint returns no student, account, or programme data.

The endpoint requires a separate server-only token. UptimeRobot does not need the Supabase
publishable key, and the health token MUST NOT use the Supabase database password, secret key, or
`service_role` key.

This is best-effort monitoring. Supabase does not guarantee that synthetic requests will always
prevent Free-plan pausing; only a paid plan guarantees that an inactive project will not pause.

## 1. Apply the database function

Run the complete `supabase/schema.sql` in Supabase SQL Editor. It creates the data-free
`project_healthcheck()` function and grants access to the anonymous/publishable role.

The focused alternative is `supabase/migrations/20260822_project_healthcheck.sql`, but the complete
schema is preferred whenever the application reports other missing migrations.

## 2. Generate a monitor token

Generate a random value locally:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Store the result as `UPTIME_HEALTHCHECK_TOKEN` in the deployment platform's encrypted environment
settings. Add the same value to `.env` or `.env.local` only when testing locally. Never commit the
value.

Redeploy or restart the application after adding the variable.

## 3. Test the deployed endpoint

In PowerShell, replace the URL and token without committing either value:

```powershell
$monitorHeaders = @{ 'x-healthcheck-token' = 'YOUR_RANDOM_TOKEN' }
Invoke-RestMethod -Uri 'https://YOUR_DEPLOYED_DOMAIN/api/health' -Headers $monitorHeaders
```

Expected response:

```json
{
  "status": "ok",
  "database": "reachable"
}
```

The endpoint returns:

| Status | Meaning                                                                                 |
| ------ | --------------------------------------------------------------------------------------- |
| `200`  | Application is running and Supabase returned `true`.                                    |
| `401`  | The `x-healthcheck-token` header is absent or incorrect.                                |
| `503`  | The token is not configured, Supabase is unreachable, or the RPC/schema is unavailable. |

Responses use `Cache-Control: no-store`, so a CDN cannot hide a database outage behind a cached
success.

## 4. Create the UptimeRobot monitor

1. Sign in to UptimeRobot and select **New monitor**.
2. Select **API Monitoring** or an HTTP monitor that supports custom request headers.
3. Enter `https://YOUR_DEPLOYED_DOMAIN/api/health`.
4. Select the `GET` method.
5. Add the custom header `x-healthcheck-token` with the generated token as its value.
6. Treat HTTP `200` as healthy. If response assertions are available, require `status` to equal
   `ok` and `database` to equal `reachable`.
7. Select an interval that produces a few checks each day or more, within the account's available
   monitoring intervals.
8. Add an email alert contact and save the monitor.

Do not point the monitor only at the home page. A cached/static page may succeed without making a
database request.

## 5. Operational checks

- Confirm the first monitor result is **Up** and inspect its response once.
- Deliberately send a wrong token and confirm the endpoint returns `401`.
- Review UptimeRobot history and alert delivery periodically.
- Keep either GitHub Actions or another independent monitor as a fallback if the project is
  operationally important.
- Rotate the health token immediately if it is disclosed, update the deployment environment and
  UptimeRobot header, then redeploy.
- Retain independent database and Storage backups. Monitoring is not a backup mechanism.

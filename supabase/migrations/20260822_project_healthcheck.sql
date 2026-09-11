-- Safe, read-only endpoint used by the scheduled GitHub Actions health check.
-- It exposes no tables or student data and runs with the anonymous role.
create or replace function public.project_healthcheck()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select true;
$$;

comment on function public.project_healthcheck() is
  'Returns true for a minimal external database availability check.';

revoke all on function public.project_healthcheck() from public;
grant execute on function public.project_healthcheck() to anon, authenticated;

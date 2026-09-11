-- Durable offline submission IDs prevent duplicates when a device reconnects
-- after the server committed an upload but the response never reached it.
alter table public.submissions add column if not exists client_submission_id uuid;

update public.submissions
set client_submission_id = gen_random_uuid()
where client_submission_id is null;

alter table public.submissions
  alter column client_submission_id set default gen_random_uuid();
alter table public.submissions
  alter column client_submission_id set not null;

create unique index if not exists submissions_student_client_id_idx
  on public.submissions(student_id, client_submission_id);

-- A returned submission may be attempted again, but a student cannot have two
-- simultaneous pending/approved submissions for the same activity.
create unique index if not exists submissions_one_active_activity_idx
  on public.submissions(student_id, activity_id)
  where status in ('pending', 'approved');

create or replace function public.offline_submission_schema_ready()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1
      from pg_catalog.pg_attribute
      where attrelid = 'public.submissions'::regclass
        and attname = 'client_submission_id'
        and not attisdropped
    )
    and pg_catalog.to_regclass('public.submissions_student_client_id_idx') is not null
    and pg_catalog.to_regclass('public.submissions_one_active_activity_idx') is not null;
$$;

revoke all on function public.offline_submission_schema_ready() from public;
grant execute on function public.offline_submission_schema_ready() to anon, authenticated;

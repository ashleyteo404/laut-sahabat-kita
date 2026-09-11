-- Defense-in-depth for field evidence uploaded directly through Supabase.
-- The application API already performs these checks, but database and Storage
-- policies must enforce the same rules because the publishable key is public.

create or replace function private.is_student()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'student'
  );
$$;

revoke all on function private.is_student() from public;
grant execute on function private.is_student() to authenticated;

create or replace function public.enforce_submission_state()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare activity_mode public.learning_mode;
begin
  if (select auth.uid()) is not null and new.student_id <> (select auth.uid()) then
    raise exception 'Students may only submit their own work';
  end if;
  select mode into activity_mode from public.activities where id = new.activity_id and published = true;
  if activity_mode is null then raise exception 'Activity is not available'; end if;
  if not exists (
    select 1 from public.profiles
    where id = new.student_id and role = 'student'
  ) then raise exception 'Only student profiles may submit activities'; end if;
  if exists (
    select 1 from public.submissions
    where student_id = new.student_id
      and activity_id = new.activity_id
      and status in ('pending', 'approved')
  ) then raise exception 'This activity already has an active or approved submission'; end if;
  if activity_mode = 'field' then
    if new.evidence_path is null
      or private.path_owner(new.evidence_path) is distinct from new.student_id then
      raise exception 'Field activities require student-owned photo evidence';
    end if;
    if not exists (
      select 1 from storage.objects object
      where object.bucket_id = 'evidence' and object.name = new.evidence_path
    ) then
      raise exception 'Field activity photo evidence was not uploaded';
    end if;
  end if;
  new.status := case when activity_mode = 'online' then 'approved' else 'pending' end;
  new.reviewed_by := null;
  new.reviewed_at := case when activity_mode = 'online' then now() else null end;
  new.review_note := null;
  return new;
end;
$$;

drop policy if exists "Students upload own evidence" on storage.objects;
create policy "Students upload own evidence" on storage.objects for insert to authenticated
with check (
  bucket_id = 'evidence'
  and private.is_student()
  and private.path_owner(name) = (select auth.uid())
);

-- Digital Ocean Passport database, authorization, storage, and pilot content.
-- Run this entire file once in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;
create schema if not exists private;

do $$ begin
  create type public.user_role as enum ('student', 'teacher', 'jari_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.learning_mode as enum ('online', 'field');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.submission_status as enum ('pending', 'approved', 'returned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.badge_tier as enum ('learning', 'explorer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.session_type as enum ('online', 'classroom', 'field', 'community');
exception when duplicate_object then null; end $$;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  village text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'New learner',
  role public.user_role not null default 'student',
  school_id uuid references public.schools(id) on delete set null,
  village text,
  grade text,
  joined_year integer not null default extract(year from now())::integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.islands (
  id text primary key,
  name text not null,
  tagline text,
  description text,
  name_ind text,
  tagline_ind text,
  description_ind text,
  translation_source_updated_at timestamptz not null default now(),
  translation_reviewed_at timestamptz,
  sort_order integer not null default 0
);

alter table public.islands
  add column if not exists name_ind text,
  add column if not exists tagline_ind text,
  add column if not exists description_ind text,
  add column if not exists translation_source_updated_at timestamptz not null default now(),
  add column if not exists translation_reviewed_at timestamptz;

create table if not exists public.badges (
  id text primary key,
  name text not null unique,
  description text,
  icon text,
  name_ind text,
  description_ind text,
  translation_source_updated_at timestamptz not null default now(),
  translation_reviewed_at timestamptz
);

alter table public.badges
  add column if not exists name_ind text,
  add column if not exists description_ind text,
  add column if not exists translation_source_updated_at timestamptz not null default now(),
  add column if not exists translation_reviewed_at timestamptz;

create table if not exists public.activities (
  id text primary key,
  island_id text not null references public.islands(id),
  badge_id text not null references public.badges(id),
  title text not null,
  description text,
  mode public.learning_mode not null,
  duration_minutes integer not null default 10,
  steps jsonb not null default '[]'::jsonb,
  title_ind text,
  description_ind text,
  steps_ind jsonb,
  translation_source_updated_at timestamptz not null default now(),
  translation_reviewed_at timestamptz,
  published boolean not null default true,
  sort_order integer not null default 0
);

alter table public.activities
  add column if not exists title_ind text,
  add column if not exists description_ind text,
  add column if not exists steps_ind jsonb,
  add column if not exists translation_source_updated_at timestamptz not null default now(),
  add column if not exists translation_reviewed_at timestamptz;

-- A translated list must be a JSON array. Length is deliberately NOT constrained: requiring it to
-- match the English source would reject any English edit that changed the step count while a
-- translation existed. The application falls back to the whole English list when counts disagree.
alter table public.activities drop constraint if exists activities_steps_ind_shape;
alter table public.activities add constraint activities_steps_ind_shape check (
  steps_ind is null or jsonb_typeof(steps_ind) = 'array'
);

-- Marks a translation as needing review when its English source changes. Takes only the source
-- column names and derives each partner by appending `_ind`, so the pairing cannot drift.
-- Editing both languages in one statement counts as a completed review, which is what keeps the
-- idempotent content seeds below from reporting every row as stale on each rerun.
create or replace function public.mark_translation_stale()
returns trigger
language plpgsql
security invoker set search_path = ''
as $$
declare
  source_column text;
  source_changed boolean := false;
  translation_changed boolean := false;
begin
  if tg_op = 'INSERT' then
    new.translation_source_updated_at := now();
    return new;
  end if;

  foreach source_column in array tg_argv loop
    if to_jsonb(new) -> source_column is distinct from to_jsonb(old) -> source_column then
      source_changed := true;
    end if;
    if to_jsonb(new) -> (source_column || '_ind')
       is distinct from to_jsonb(old) -> (source_column || '_ind') then
      translation_changed := true;
    end if;
  end loop;

  if translation_changed then
    new.translation_source_updated_at := now();
    new.translation_reviewed_at := now();
  elsif source_changed then
    new.translation_source_updated_at := now();
    new.translation_reviewed_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists before_islands_translation_source on public.islands;
create trigger before_islands_translation_source
  before insert or update on public.islands
  for each row execute procedure public.mark_translation_stale('name', 'tagline', 'description');

drop trigger if exists before_badges_translation_source on public.badges;
create trigger before_badges_translation_source
  before insert or update on public.badges
  for each row execute procedure public.mark_translation_stale('name', 'description');

drop trigger if exists before_activities_translation_source on public.activities;
create trigger before_activities_translation_source
  before insert or update on public.activities
  for each row execute procedure public.mark_translation_stale('title', 'description', 'steps');

-- Operator-only queue of translations whose English source moved after the last review.
-- security_invoker is required so the view does not run as its owner and bypass RLS.
create or replace view public.translation_review_queue
with (security_invoker = true) as
  select 'islands' as content_table, id, translation_source_updated_at, translation_reviewed_at
  from public.islands
  where translation_reviewed_at is null
     or translation_reviewed_at < translation_source_updated_at
  union all
  select 'badges', id, translation_source_updated_at, translation_reviewed_at
  from public.badges
  where translation_reviewed_at is null
     or translation_reviewed_at < translation_source_updated_at
  union all
  select 'activities', id, translation_source_updated_at, translation_reviewed_at
  from public.activities
  where translation_reviewed_at is null
     or translation_reviewed_at < translation_source_updated_at;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  client_submission_id uuid not null default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  activity_id text not null references public.activities(id),
  reflection text not null check (char_length(trim(reflection)) >= 10),
  evidence_path text,
  status public.submission_status not null default 'pending',
  review_note text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.submissions add column if not exists client_submission_id uuid;
update public.submissions set client_submission_id = gen_random_uuid()
where client_submission_id is null;
alter table public.submissions alter column client_submission_id set default gen_random_uuid();
alter table public.submissions alter column client_submission_id set not null;

create table if not exists public.student_badges (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  badge_id text not null references public.badges(id),
  award_tier public.badge_tier not null default 'learning',
  source_submission_id uuid references public.submissions(id) on delete set null,
  awarded_by uuid references public.profiles(id) on delete set null,
  awarded_at timestamptz not null default now()
);

alter table public.student_badges
  add column if not exists award_tier public.badge_tier not null default 'learning';

update public.student_badges award
set award_tier = case when activity.mode = 'field' then 'explorer'::public.badge_tier else 'learning'::public.badge_tier end
from public.submissions submission
join public.activities activity on activity.id = submission.activity_id
where award.source_submission_id = submission.id;

alter table public.student_badges
  drop constraint if exists student_badges_student_id_badge_id_key;

create unique index if not exists student_badges_student_badge_tier_idx
  on public.student_badges(student_id, badge_id, award_tier);

create table if not exists public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  island_id text references public.islands(id) on delete set null,
  title text not null check (char_length(trim(title)) >= 3),
  session_type public.session_type not null,
  occurred_on date not null,
  duration_minutes integer not null check (duration_minutes between 5 and 600),
  habitat text,
  teacher_reflection text,
  field_observation text,
  created_at timestamptz not null default now()
);

create table if not exists public.session_attendance (
  session_id uuid not null references public.learning_sessions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  present boolean not null default true,
  primary key (session_id, student_id)
);

create index if not exists profiles_school_id_idx on public.profiles(school_id);
create index if not exists submissions_student_id_idx on public.submissions(student_id);
create index if not exists submissions_status_idx on public.submissions(status);
create unique index if not exists submissions_student_client_id_idx
  on public.submissions(student_id, client_submission_id);
create unique index if not exists submissions_one_active_activity_idx
  on public.submissions(student_id, activity_id)
  where status in ('pending', 'approved');
create index if not exists student_badges_student_id_idx on public.student_badges(student_id);
create index if not exists learning_sessions_school_id_idx on public.learning_sessions(school_id);
create index if not exists learning_sessions_occurred_on_idx on public.learning_sessions(occurred_on desc);
create index if not exists session_attendance_student_id_idx on public.session_attendance(student_id);

-- New Auth users get a safe student profile automatically. Role changes are
-- deliberately performed by an administrator, never from editable user metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, village, grade)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'village', ''),
    nullif(new.raw_user_meta_data ->> 'grade', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS helper functions live outside the exposed public schema.
create or replace function private.is_teacher()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('teacher', 'jari_admin')
  );
$$;

create or replace function private.is_student()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'student'
  );
$$;

create or replace function private.can_review_student(target_student uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles reviewer
    join public.profiles learner on learner.id = target_student
    where reviewer.id = (select auth.uid())
      and (
        reviewer.role = 'jari_admin'
        or (reviewer.role = 'teacher' and reviewer.school_id is not null and reviewer.school_id = learner.school_id)
      )
  );
$$;

create or replace function private.path_owner(path text)
returns uuid
language plpgsql immutable security definer set search_path = ''
as $$
begin
  return split_part(path, '/', 1)::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

create or replace function private.can_manage_school(target_school uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles reviewer
    where reviewer.id = (select auth.uid())
      and (
        reviewer.role = 'jari_admin'
        or (reviewer.role = 'teacher' and reviewer.school_id = target_school)
      )
  );
$$;

create or replace function private.can_manage_session(target_session uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.learning_sessions session
    where session.id = target_session and private.can_manage_school(session.school_id)
  );
$$;

revoke all on function private.is_teacher() from public;
revoke all on function private.is_student() from public;
revoke all on function private.can_review_student(uuid) from public;
revoke all on function private.path_owner(text) from public;
grant execute on function private.is_teacher() to authenticated;
grant execute on function private.is_student() to authenticated;
grant execute on function private.can_review_student(uuid) to authenticated;
grant execute on function private.path_owner(text) to authenticated;
revoke all on function private.can_manage_school(uuid) from public;
revoke all on function private.can_manage_session(uuid) from public;
grant execute on function private.can_manage_school(uuid) to authenticated;
grant execute on function private.can_manage_session(uuid) to authenticated;

-- Students cannot choose approval state. Online learning is completed
-- immediately; field evidence always enters the teacher queue.
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

drop trigger if exists before_submission_insert on public.submissions;
create trigger before_submission_insert
  before insert on public.submissions
  for each row execute procedure public.enforce_submission_state();

create or replace function public.award_online_badge()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare activity_badge text;
declare activity_tier public.badge_tier;
begin
  if new.status = 'approved' then
    select badge_id,
           case when mode = 'field' then 'explorer'::public.badge_tier else 'learning'::public.badge_tier end
      into activity_badge, activity_tier
    from public.activities where id = new.activity_id;
    insert into public.student_badges (student_id, badge_id, award_tier, source_submission_id)
    values (new.student_id, activity_badge, activity_tier, new.id)
    on conflict (student_id, badge_id, award_tier) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists after_submission_insert on public.submissions;
create trigger after_submission_insert
  after insert on public.submissions
  for each row execute procedure public.award_online_badge();

-- The only browser-callable approval operation. It verifies the reviewer is a
-- teacher from the student's school before updating or awarding anything.
create or replace function public.review_submission(
  p_submission_id uuid,
  p_approve boolean,
  p_note text default null
)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare target public.submissions;
declare activity_badge text;
begin
  select * into target from public.submissions where id = p_submission_id for update;
  if target.id is null then raise exception 'Submission not found'; end if;
  if not private.can_review_student(target.student_id) then raise exception 'Not authorized to review this student'; end if;
  if target.status <> 'pending' then raise exception 'Submission has already been reviewed'; end if;

  update public.submissions
  set status = case when p_approve then 'approved'::public.submission_status else 'returned'::public.submission_status end,
      review_note = nullif(trim(p_note), ''),
      reviewed_by = (select auth.uid()),
      reviewed_at = now()
  where id = p_submission_id;

  if p_approve then
    select badge_id into activity_badge from public.activities where id = target.activity_id;
    insert into public.student_badges (student_id, badge_id, award_tier, source_submission_id, awarded_by)
    values (target.student_id, activity_badge, 'explorer', target.id, (select auth.uid()))
    on conflict (student_id, badge_id, award_tier) do nothing;
  end if;
end;
$$;

revoke all on function public.review_submission(uuid, boolean, text) from public;
grant execute on function public.review_submission(uuid, boolean, text) to authenticated;

create or replace function public.create_learning_session(
  p_title text,
  p_session_type public.session_type,
  p_occurred_on date,
  p_duration_minutes integer,
  p_island_id text default null,
  p_habitat text default null,
  p_teacher_reflection text default null,
  p_field_observation text default null,
  p_student_ids uuid[] default array[]::uuid[]
)
returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare reviewer public.profiles;
declare new_session_id uuid;
begin
  select * into reviewer from public.profiles where id = (select auth.uid());
  if reviewer.role not in ('teacher', 'jari_admin') or reviewer.school_id is null then
    raise exception 'A teacher or JARI administrator with a school is required';
  end if;
  if char_length(trim(p_title)) < 3 then raise exception 'Session title is too short'; end if;
  if p_duration_minutes not between 5 and 600 then raise exception 'Duration must be between 5 and 600 minutes'; end if;

  insert into public.learning_sessions (
    school_id, teacher_id, island_id, title, session_type, occurred_on,
    duration_minutes, habitat, teacher_reflection, field_observation
  ) values (
    reviewer.school_id, reviewer.id, p_island_id, trim(p_title), p_session_type,
    p_occurred_on, p_duration_minutes, nullif(trim(p_habitat), ''),
    nullif(trim(p_teacher_reflection), ''), nullif(trim(p_field_observation), '')
  ) returning id into new_session_id;

  insert into public.session_attendance (session_id, student_id, present)
  select new_session_id, learner.id, true
  from public.profiles learner
  where learner.id = any(p_student_ids)
    and learner.role = 'student'
    and learner.school_id = reviewer.school_id
  on conflict (session_id, student_id) do update set present = true;

  return new_session_id;
end;
$$;

revoke all on function public.create_learning_session(text, public.session_type, date, integer, text, text, text, text, uuid[]) from public;
grant execute on function public.create_learning_session(text, public.session_type, date, integer, text, text, text, text, uuid[]) to authenticated;

create or replace function public.get_my_learning_record()
returns table(session_count bigint, learning_minutes bigint, habitats text[])
language sql
stable
security definer set search_path = ''
as $$
  select
    count(*)::bigint as session_count,
    coalesce(sum(session.duration_minutes), 0)::bigint as learning_minutes,
    coalesce(
      array_agg(distinct session.habitat) filter (where session.habitat is not null),
      array[]::text[]
    ) as habitats
  from public.session_attendance attendance
  join public.learning_sessions session on session.id = attendance.session_id
  where attendance.student_id = (select auth.uid()) and attendance.present = true;
$$;

revoke all on function public.get_my_learning_record() from public;
grant execute on function public.get_my_learning_record() to authenticated;

-- Minimal read-only endpoint for external availability monitoring. It exposes
-- no application tables and intentionally runs with the caller's privileges.
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

alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.islands enable row level security;
alter table public.badges enable row level security;
alter table public.activities enable row level security;
alter table public.submissions enable row level security;
alter table public.student_badges enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.session_attendance enable row level security;

drop policy if exists "Authenticated users view schools" on public.schools;
create policy "Authenticated users view schools" on public.schools for select to authenticated using (true);

drop policy if exists "Users view own or school profiles" on public.profiles;
create policy "Users view own or school profiles" on public.profiles for select to authenticated
using (id = (select auth.uid()) or private.can_review_student(id));

drop policy if exists "Users update own profile" on public.profiles;

drop policy if exists "Authenticated users view islands" on public.islands;
create policy "Authenticated users view islands" on public.islands for select to authenticated using (true);
drop policy if exists "Authenticated users view badges" on public.badges;
create policy "Authenticated users view badges" on public.badges for select to authenticated using (true);
drop policy if exists "Authenticated users view activities" on public.activities;
create policy "Authenticated users view activities" on public.activities for select to authenticated using (published = true);

drop policy if exists "Students insert own submissions" on public.submissions;
create policy "Students insert own submissions" on public.submissions for insert to authenticated
with check (student_id = (select auth.uid()));
drop policy if exists "Users view relevant submissions" on public.submissions;
create policy "Users view relevant submissions" on public.submissions for select to authenticated
using (student_id = (select auth.uid()) or private.can_review_student(student_id));

drop policy if exists "Users view relevant badges" on public.student_badges;
create policy "Users view relevant badges" on public.student_badges for select to authenticated
using (student_id = (select auth.uid()) or private.can_review_student(student_id));

drop policy if exists "Staff view managed sessions" on public.learning_sessions;
create policy "Staff view managed sessions" on public.learning_sessions for select to authenticated
using (private.can_manage_school(school_id));
drop policy if exists "Staff view managed attendance" on public.session_attendance;
create policy "Staff view managed attendance" on public.session_attendance for select to authenticated
using (private.can_manage_session(session_id));

grant select on public.schools, public.islands, public.badges, public.activities to authenticated;
revoke all on public.translation_review_queue from anon, authenticated;
revoke update on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant select, insert on public.submissions to authenticated;
grant select on public.student_badges to authenticated;
grant select on public.learning_sessions, public.session_attendance to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('evidence', 'evidence', false, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 3145728,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Students upload own evidence" on storage.objects;
create policy "Students upload own evidence" on storage.objects for insert to authenticated
with check (
  bucket_id = 'evidence'
  and private.is_student()
  and private.path_owner(name) = (select auth.uid())
);
drop policy if exists "Users view relevant evidence" on storage.objects;
create policy "Users view relevant evidence" on storage.objects for select to authenticated
using (bucket_id = 'evidence' and (private.path_owner(name) = (select auth.uid()) or private.can_review_student(private.path_owner(name))));
drop policy if exists "Students delete own evidence" on storage.objects;
create policy "Students delete own evidence" on storage.objects for delete to authenticated
using (bucket_id = 'evidence' and private.path_owner(name) = (select auth.uid()));

-- Three-island pilot content. Replace descriptions and steps with approved
-- Guide Book wording later without changing IDs used by the app.
insert into public.schools (id, name, village) values
  ('11111111-1111-1111-1111-111111111111', 'SDN Labuhan Pandan', 'Labuhan Pandan')
on conflict (id) do update set name = excluded.name, village = excluded.village;

insert into public.islands (id, name, tagline, description, name_ind, tagline_ind, description_ind, sort_order) values
  ('bidara','Gili Bidara','Reef edges & seagrass stories','Observe how coral, seagrass, people, and marine life share one connected island home.','Gili Bidara','Tepi terumbu & kisah lamun','Amati bagaimana karang, lamun, manusia, dan biota laut berbagi satu rumah pulau yang saling terhubung.',1),
  ('range','Gili Range','Mangroves & coastal clues','Follow the shoreline, investigate coastal habitats, and look for nature''s protection systems.','Gili Range','Mangrove & jejak pesisir','Susuri garis pantai, selidiki habitat pesisir, dan cari sistem pelindung alami.',2),
  ('sarang','Gili Sarang','Wildlife & community knowledge','Meet island species and learn how local knowledge can help care for the sea.','Gili Sarang','Satwa liar & pengetahuan masyarakat','Kenali jenis biota pulau dan pelajari bagaimana pengetahuan lokal dapat membantu merawat laut.',3)
on conflict (id) do update set name=excluded.name, tagline=excluded.tagline, description=excluded.description, name_ind=excluded.name_ind, tagline_ind=excluded.tagline_ind, description_ind=excluded.description_ind, sort_order=excluded.sort_order;

insert into public.badges (id, name, description, icon, name_ind, description_ind) values
  ('coral-explorer','Coral Explorer','Understands the reef as a living habitat','◌','Penjelajah Karang','Memahami terumbu sebagai habitat yang hidup'),
  ('mangrove-protector','Mangrove Protector','Discovers how mangroves shelter and protect','♧','Penjaga Mangrove','Menemukan bagaimana mangrove menaungi dan melindungi'),
  ('marine-wildlife-guardian','Marine Wildlife Guardian','Observes marine life with care and respect','◍','Penjaga Satwa Laut','Mengamati biota laut dengan cermat dan penuh hormat'),
  ('ocean-scientist','Ocean Scientist','Uses evidence and careful field observation','⌕','Ilmuwan Laut','Menggunakan bukti dan pengamatan lapangan yang cermat'),
  ('plastic-free-champion','Plastic-Free Champion','Takes practical action on marine rubbish','♲','Juara Bebas Plastik','Melakukan tindakan nyata terhadap sampah laut'),
  ('community-ocean-ambassador','Community Ocean Ambassador','Shares ocean knowledge with the community','☵','Duta Laut Masyarakat','Berbagi pengetahuan laut dengan masyarakat')
on conflict (id) do update set name=excluded.name, description=excluded.description, icon=excluded.icon, name_ind=excluded.name_ind, description_ind=excluded.description_ind;

insert into public.activities (id,island_id,badge_id,title,description,mode,duration_minutes,steps,title_ind,description_ind,steps_ind,sort_order) values
  ('coral-basics','bidara','coral-explorer','Meet the coral neighbourhood','Explore a visual guide to coral habitats and discover why a reef is a living neighbourhood.','online',12,'["Read the coral habitat story.","Match three reef residents to their homes.","Write one thing a healthy reef needs."]','Kenali tetangga karang','Jelajahi panduan visual habitat karang dan temukan mengapa terumbu adalah kampung yang hidup.','["Baca kisah habitat karang.","Cocokkan tiga penghuni terumbu dengan rumahnya.","Tulis satu hal yang dibutuhkan terumbu yang sehat."]',1),
  ('seagrass-watch','bidara','ocean-scientist','Seagrass shoreline watch','Observe a seagrass area carefully, record what you see, and leave the habitat as you found it.','field',35,'["Choose a safe observation point with your teacher.","Record three living things or signs of life.","Photograph your observation without disturbing wildlife."]','Pengamatan lamun di tepi pantai','Amati area lamun dengan cermat, catat yang kamu lihat, dan tinggalkan habitatnya seperti semula.','["Pilih titik pengamatan yang aman bersama gurumu.","Catat tiga makhluk hidup atau tanda kehidupan.","Foto pengamatanmu tanpa mengganggu satwa."]',2),
  ('reef-reflection','bidara','marine-wildlife-guardian','A reef through my eyes','Reflect on how everyday choices on land can affect coral reefs and marine wildlife.','online',10,'["Look closely at the reef illustration.","Identify two human actions that affect the reef.","Choose one action you can take this week."]','Terumbu lewat mataku','Renungkan bagaimana pilihan sehari-hari di darat dapat memengaruhi terumbu karang dan biota laut.','["Amati ilustrasi terumbu dengan saksama.","Temukan dua tindakan manusia yang memengaruhi terumbu.","Pilih satu tindakan yang bisa kamu lakukan minggu ini."]',3),
  ('mangrove-roots','range','mangrove-protector','Secrets among the roots','Discover how mangrove roots shelter young animals and protect the coast.','online',15,'["Explore the mangrove guide.","Find three animals that use mangroves.","Explain one way roots protect the shore."]','Rahasia di antara akar','Temukan bagaimana akar mangrove menaungi hewan muda dan melindungi pesisir.','["Jelajahi panduan mangrove.","Temukan tiga hewan yang memanfaatkan mangrove.","Jelaskan satu cara akar melindungi pantai."]',4),
  ('shore-detective','range','ocean-scientist','Intertidal detective','Investigate the changing world between high and low tide using careful observation.','field',40,'["Check the tide and safety guidance with your teacher.","Find five different natural objects or living things.","Record clues in a photo and short field note."]','Detektif zona pasang surut','Selidiki dunia yang berubah antara pasang dan surut dengan pengamatan yang cermat.','["Periksa kondisi pasang surut dan panduan keselamatan bersama gurumu.","Temukan lima benda alam atau makhluk hidup yang berbeda.","Catat petunjuknya dalam foto dan catatan lapangan singkat."]',5),
  ('waste-audit','range','plastic-free-champion','Coastal waste audit','Sort and record shoreline rubbish to understand where it may have come from.','field',30,'["Wear gloves and follow your teacher''s safety briefing.","Record rubbish by type without handling sharp objects.","Photograph the completed tally and share one solution."]','Audit sampah pesisir','Pilah dan catat sampah di garis pantai untuk memahami dari mana asalnya.','["Pakai sarung tangan dan ikuti arahan keselamatan gurumu.","Catat sampah menurut jenisnya tanpa memegang benda tajam.","Foto hasil pencatatan dan bagikan satu solusi."]',6),
  ('wildlife-guide','sarang','marine-wildlife-guardian','Island wildlife field guide','Learn to notice wildlife responsibly through shape, movement, colour, and habitat clues.','online',14,'["Study the wildlife observation guide.","Choose one species and note three features.","Write a respectful wildlife-watching rule."]','Panduan lapangan satwa pulau','Belajar mengamati satwa secara bertanggung jawab melalui petunjuk bentuk, gerak, warna, dan habitat.','["Pelajari panduan pengamatan satwa.","Pilih satu jenis dan catat tiga cirinya.","Tulis satu aturan mengamati satwa yang penuh hormat."]',7),
  ('fisher-stories','sarang','community-ocean-ambassador','A conversation with a fisher','Listen to local ecological knowledge and record how the sea has changed over time.','field',45,'["Prepare three respectful questions.","Interview a fisher or community elder with permission.","Share one lesson in your own words and add a photo if permitted."]','Berbincang dengan nelayan','Dengarkan pengetahuan ekologi lokal dan catat bagaimana laut berubah dari waktu ke waktu.','["Siapkan tiga pertanyaan yang sopan.","Wawancarai nelayan atau tetua masyarakat dengan izin.","Bagikan satu pelajaran dengan kata-katamu sendiri dan tambahkan foto bila diizinkan."]',8),
  ('ocean-promise','sarang','community-ocean-ambassador','My ocean promise','Turn what you have learned into a small, practical action you can share with others.','online',8,'["Choose an ocean issue you care about.","Write one action you can repeat for a month.","Tell someone why your promise matters."]','Janji lautku','Ubah apa yang kamu pelajari menjadi tindakan kecil dan nyata yang bisa kamu bagikan.','["Pilih satu isu laut yang kamu pedulikan.","Tulis satu tindakan yang bisa kamu ulangi selama sebulan.","Ceritakan kepada seseorang mengapa janjimu penting."]',9)
on conflict (id) do update set island_id=excluded.island_id,badge_id=excluded.badge_id,title=excluded.title,description=excluded.description,mode=excluded.mode,duration_minutes=excluded.duration_minutes,steps=excluded.steps,title_ind=excluded.title_ind,description_ind=excluded.description_ind,steps_ind=excluded.steps_ind,sort_order=excluded.sort_order;

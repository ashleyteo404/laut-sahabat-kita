-- Audit follow-ups to 20260911_bilingual_content.sql.
--
-- 1. Relax activities_steps_ind_shape so English content stays editable on its own.
--
--    The original constraint required a translated step list to have exactly as many entries as its
--    English source. That protected the whole-array fallback, but it also rejected any English edit
--    that changed the step count while a translation was present -- contradicting the documented
--    workflow that English may be edited freely and translated later. Editors met a constraint
--    violation instead of a stale-translation flag.
--
--    The shape check is kept (it must still be a JSON array); the length equality moves into the
--    application, which now falls back to the whole English list when the counts disagree.
--
-- 2. Drop the unnecessary privilege elevation on the staleness trigger.
--
--    mark_translation_stale() is a BEFORE trigger that only mutates NEW and executes no statement
--    requiring owner rights, so security definer bought nothing while leaving a pattern that would
--    be unsafe if a future edit added a query. search_path is still pinned.

alter table public.activities drop constraint if exists activities_steps_ind_shape;
alter table public.activities add constraint activities_steps_ind_shape check (
  steps_ind is null or jsonb_typeof(steps_ind) = 'array'
);

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

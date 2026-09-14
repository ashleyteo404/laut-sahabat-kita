-- Student usernames for teacher-managed accounts.
--
-- Primary-school students sign in with a username and a 6-digit PIN rather than an email address.
-- Supabase Auth still requires an email, so the application derives a placeholder address under the
-- reserved `.invalid` top-level domain, which can never receive mail. The username stored here is what
-- teachers see and students type.
--
-- Staff accounts keep signing in with a real email address and leave `username` null.
--
-- No policy or grant changes: the existing select policy already scopes who can see a profile,
-- `update` stays revoked from `authenticated`, and account creation writes through the server-only
-- secret-key client, which bypasses RLS by design.

alter table public.profiles add column if not exists username text;

alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format check (
  username is null or username ~ '^[a-z0-9][a-z0-9._-]{2,31}$'
);

create unique index if not exists profiles_username_unique on public.profiles (lower(username));

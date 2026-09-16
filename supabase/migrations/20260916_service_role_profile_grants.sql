-- Teacher-managed student accounts write profiles with the server-only secret key, which acts as
-- `service_role`. That role bypasses row-level security but still needs table privileges, and this
-- schema grants explicitly rather than relying on Supabase's default privileges. Without these
-- grants, creating a student fails with `42501 permission denied for table profiles`.
--
-- Scope is deliberately narrow: only the columns of `profiles` that account management touches.
-- `service_role` is reachable only from server code holding SUPABASE_SECRET_KEY.

grant select, insert, update on public.profiles to service_role;

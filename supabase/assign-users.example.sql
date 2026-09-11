-- Run after creating the accounts in Authentication > Users.
-- Replace the example email addresses before executing.

update public.profiles
set full_name = 'Ibu Aminah',
    role = 'teacher',
    school_id = '11111111-1111-1111-1111-111111111111',
    village = 'Labuhan Pandan'
where id = (select id from auth.users where email = 'teacher@example.org');

update public.profiles
set full_name = 'Siti Rahmawati',
    role = 'student',
    school_id = '11111111-1111-1111-1111-111111111111',
    village = 'Labuhan Pandan',
    grade = '5',
    joined_year = 2026
where id = (select id from auth.users where email = 'student@example.org');

-- Optional: create this Auth user first, then give a JARI coordinator access
-- to programme-wide reporting across all schools.
update public.profiles
set full_name = 'JARI Coordinator',
    role = 'jari_admin',
    village = 'Alas Strait'
where id = (select id from auth.users where email = 'coordinator@example.org');

-- Confirm both profiles are ready.
select p.full_name, p.role, p.grade, s.name as school
from public.profiles p
left join public.schools s on s.id = p.school_id
order by p.role, p.full_name;

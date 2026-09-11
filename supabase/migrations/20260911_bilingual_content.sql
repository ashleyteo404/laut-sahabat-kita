-- Bilingual pilot content (English source + Bahasa Indonesia translation).
--
-- Indonesian columns use the `_ind` suffix (ISO 639-2/T) rather than `_id`, because `id` is every
-- table's primary key and `*_id` already means a foreign key throughout this schema.
--
-- The application reads the Indonesian column when present and falls back to English when it is
-- null, so editing English content reaches both audiences immediately.
--
-- No grant or policy changes are required: these are new columns on existing tables, and
-- `grant select on public.islands, public.badges, public.activities to authenticated` is
-- table-scoped, not column-scoped.

alter table public.islands
  add column if not exists name_ind text,
  add column if not exists tagline_ind text,
  add column if not exists description_ind text,
  add column if not exists translation_source_updated_at timestamptz not null default now(),
  add column if not exists translation_reviewed_at timestamptz;

alter table public.badges
  add column if not exists name_ind text,
  add column if not exists description_ind text,
  add column if not exists translation_source_updated_at timestamptz not null default now(),
  add column if not exists translation_reviewed_at timestamptz;

alter table public.activities
  add column if not exists title_ind text,
  add column if not exists description_ind text,
  add column if not exists steps_ind jsonb,
  add column if not exists translation_source_updated_at timestamptz not null default now(),
  add column if not exists translation_reviewed_at timestamptz;

-- The app falls back to the whole English array rather than mixing languages inside one ordered
-- instruction list, so a translated list must have exactly the same number of steps.
alter table public.activities drop constraint if exists activities_steps_ind_shape;
alter table public.activities add constraint activities_steps_ind_shape check (
  steps_ind is null
  or (jsonb_typeof(steps_ind) = 'array'
      and jsonb_array_length(steps_ind) = jsonb_array_length(steps))
);

-- Marks a translation as needing review when its English source changes. The trigger takes only the
-- source column names and derives each partner by appending `_ind`, so the pairing cannot drift.
--
-- Editing both languages in one statement counts as a completed review. That branch is what keeps
-- the idempotent seeds below from reporting every row as stale on each schema rerun.
create or replace function public.mark_translation_stale()
returns trigger
language plpgsql
security definer set search_path = ''
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

-- Operator-only view of translations whose English source moved after the last review.
-- security_invoker is required so the view does not run with owner privileges and bypass RLS.
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

revoke all on public.translation_review_queue from anon, authenticated;

-- Indonesian pilot content. Proper nouns (island names) are intentionally unchanged.
update public.islands set name_ind = v.name_ind, tagline_ind = v.tagline_ind, description_ind = v.description_ind
from (values
  ('bidara','Gili Bidara','Tepi terumbu & kisah lamun','Amati bagaimana karang, lamun, manusia, dan biota laut berbagi satu rumah pulau yang saling terhubung.'),
  ('range','Gili Range','Mangrove & jejak pesisir','Susuri garis pantai, selidiki habitat pesisir, dan cari sistem pelindung alami.'),
  ('sarang','Gili Sarang','Satwa liar & pengetahuan masyarakat','Kenali jenis biota pulau dan pelajari bagaimana pengetahuan lokal dapat membantu merawat laut.')
) as v(id, name_ind, tagline_ind, description_ind)
where public.islands.id = v.id;

update public.badges set name_ind = v.name_ind, description_ind = v.description_ind
from (values
  ('coral-explorer','Penjelajah Karang','Memahami terumbu sebagai habitat yang hidup'),
  ('mangrove-protector','Penjaga Mangrove','Menemukan bagaimana mangrove menaungi dan melindungi'),
  ('marine-wildlife-guardian','Penjaga Satwa Laut','Mengamati biota laut dengan cermat dan penuh hormat'),
  ('ocean-scientist','Ilmuwan Laut','Menggunakan bukti dan pengamatan lapangan yang cermat'),
  ('plastic-free-champion','Juara Bebas Plastik','Melakukan tindakan nyata terhadap sampah laut'),
  ('community-ocean-ambassador','Duta Laut Masyarakat','Berbagi pengetahuan laut dengan masyarakat')
) as v(id, name_ind, description_ind)
where public.badges.id = v.id;

update public.activities set title_ind = v.title_ind, description_ind = v.description_ind, steps_ind = v.steps_ind::jsonb
from (values
  ('coral-basics','Kenali tetangga karang','Jelajahi panduan visual habitat karang dan temukan mengapa terumbu adalah kampung yang hidup.','["Baca kisah habitat karang.","Cocokkan tiga penghuni terumbu dengan rumahnya.","Tulis satu hal yang dibutuhkan terumbu yang sehat."]'),
  ('seagrass-watch','Pengamatan lamun di tepi pantai','Amati area lamun dengan cermat, catat yang kamu lihat, dan tinggalkan habitatnya seperti semula.','["Pilih titik pengamatan yang aman bersama gurumu.","Catat tiga makhluk hidup atau tanda kehidupan.","Foto pengamatanmu tanpa mengganggu satwa."]'),
  ('reef-reflection','Terumbu lewat mataku','Renungkan bagaimana pilihan sehari-hari di darat dapat memengaruhi terumbu karang dan biota laut.','["Amati ilustrasi terumbu dengan saksama.","Temukan dua tindakan manusia yang memengaruhi terumbu.","Pilih satu tindakan yang bisa kamu lakukan minggu ini."]'),
  ('mangrove-roots','Rahasia di antara akar','Temukan bagaimana akar mangrove menaungi hewan muda dan melindungi pesisir.','["Jelajahi panduan mangrove.","Temukan tiga hewan yang memanfaatkan mangrove.","Jelaskan satu cara akar melindungi pantai."]'),
  ('shore-detective','Detektif zona pasang surut','Selidiki dunia yang berubah antara pasang dan surut dengan pengamatan yang cermat.','["Periksa kondisi pasang surut dan panduan keselamatan bersama gurumu.","Temukan lima benda alam atau makhluk hidup yang berbeda.","Catat petunjuknya dalam foto dan catatan lapangan singkat."]'),
  ('waste-audit','Audit sampah pesisir','Pilah dan catat sampah di garis pantai untuk memahami dari mana asalnya.','["Pakai sarung tangan dan ikuti arahan keselamatan gurumu.","Catat sampah menurut jenisnya tanpa memegang benda tajam.","Foto hasil pencatatan dan bagikan satu solusi."]'),
  ('wildlife-guide','Panduan lapangan satwa pulau','Belajar mengamati satwa secara bertanggung jawab melalui petunjuk bentuk, gerak, warna, dan habitat.','["Pelajari panduan pengamatan satwa.","Pilih satu jenis dan catat tiga cirinya.","Tulis satu aturan mengamati satwa yang penuh hormat."]'),
  ('fisher-stories','Berbincang dengan nelayan','Dengarkan pengetahuan ekologi lokal dan catat bagaimana laut berubah dari waktu ke waktu.','["Siapkan tiga pertanyaan yang sopan.","Wawancarai nelayan atau tetua masyarakat dengan izin.","Bagikan satu pelajaran dengan kata-katamu sendiri dan tambahkan foto bila diizinkan."]'),
  ('ocean-promise','Janji lautku','Ubah apa yang kamu pelajari menjadi tindakan kecil dan nyata yang bisa kamu bagikan.','["Pilih satu isu laut yang kamu pedulikan.","Tulis satu tindakan yang bisa kamu ulangi selama sebulan.","Ceritakan kepada seseorang mengapa janjimu penting."]')
) as v(id, title_ind, description_ind, steps_ind)
where public.activities.id = v.id;

-- The updates above touched only translation columns, so the trigger already set
-- translation_reviewed_at. This makes that explicit for rows inserted before the trigger existed.
update public.islands set translation_reviewed_at = now() where name_ind is not null;
update public.badges set translation_reviewed_at = now() where name_ind is not null;
update public.activities set translation_reviewed_at = now() where title_ind is not null;

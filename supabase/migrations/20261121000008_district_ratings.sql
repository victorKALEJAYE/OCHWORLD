-- ============================================================================
-- Explore Abuja: district ratings by the OCHWORLD team
-- ============================================================================
-- One score (1-5) per district per category, with a short note explaining it.
-- Everyone can read them; only platform admins (the OCHWORLD team) write them.
-- Unscored categories simply have no row and show as "Not yet rated".
-- Safe to run more than once.

do $$ begin
  create type public.district_rating_category as enum (
    'security', 'road_access', 'electricity', 'infrastructure', 'lifestyle', 'flood_safety', 'traffic_flow'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.district_ratings (
  district_id  smallint not null references public.districts (id) on delete cascade,
  category     public.district_rating_category not null,
  score        smallint not null check (score between 1 and 5),
  note         text check (char_length(note) <= 300),
  updated_by   uuid references auth.users (id) on delete set null default auth.uid(),
  updated_at   timestamptz not null default now(),
  primary key (district_id, category)
);

drop trigger if exists district_ratings_set_updated_at on public.district_ratings;
create trigger district_ratings_set_updated_at
  before update on public.district_ratings
  for each row execute function public.set_updated_at();

alter table public.district_ratings enable row level security;

drop policy if exists "District ratings are public" on public.district_ratings;
create policy "District ratings are public"
  on public.district_ratings for select to anon, authenticated using (true);

drop policy if exists "Platform admins add district ratings" on public.district_ratings;
create policy "Platform admins add district ratings"
  on public.district_ratings for insert to authenticated with check (public.is_platform_admin());

drop policy if exists "Platform admins change district ratings" on public.district_ratings;
create policy "Platform admins change district ratings"
  on public.district_ratings for update to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "Platform admins remove district ratings" on public.district_ratings;
create policy "Platform admins remove district ratings"
  on public.district_ratings for delete to authenticated using (public.is_platform_admin());

revoke all on public.district_ratings from anon, authenticated;
grant select on public.district_ratings to anon, authenticated;
grant insert (district_id, category, score, note), update (score, note), delete on public.district_ratings to authenticated;
grant all on public.district_ratings to service_role;

-- Migration 2: property marketplace (Phase 3)
--
-- Tables
--   organizations     the tenant that owns listings (agency, landlord, developer).
--                     Membership and roles are added in Phase 4.
--   districts         Abuja districts (reference data, seeded below).
--   properties        listings. Only `published` rows are visible to the public.
--   property_images   photos per listing (public URLs from the `property-images` bucket).
--   enquiries         messages from visitors to the listing's organization.
--   saved_properties  a signed-in user's shortlist.
--
-- Security model in this migration
--   * Public (anon + authenticated) can READ organizations, districts and
--     published listings with their images. Nothing else.
--   * Anyone can CREATE an enquiry on a published listing; nobody can read
--     enquiries yet (organization members get read access in Phase 4).
--   * Signed-in users manage only their own saved_properties rows.
--   * There are no INSERT/UPDATE/DELETE policies for listings or organizations:
--     until Phase 4/5 adds membership-based policies, only the service role
--     (dashboard / seed) can write them. Secure by default.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.organization_type as enum ('agency', 'landlord', 'developer');
create type public.listing_type as enum ('sale', 'rent');
create type public.listing_status as enum ('draft', 'published', 'archived');
create type public.property_category as enum ('residential', 'commercial', 'land');
create type public.property_type as enum (
  'apartment', 'duplex', 'detached_house', 'semi_detached_house', 'terrace',
  'bungalow', 'penthouse', 'land', 'office', 'shop', 'warehouse'
);
create type public.rent_period as enum ('year', 'month');

-- Keeps updated_at current on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Organizations (tenants)
-- ---------------------------------------------------------------------------
create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 120),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  type        public.organization_type not null,
  about       text check (char_length(about) <= 2000),
  phone       text,
  email       text,
  website     text,
  logo_url    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Districts (reference data)
-- ---------------------------------------------------------------------------
create table public.districts (
  id    smallint generated always as identity primary key,
  name  text not null unique,
  slug  text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

insert into public.districts (name, slug) values
  ('Apo', 'apo'),
  ('Asokoro', 'asokoro'),
  ('Central Business District', 'central-business-district'),
  ('Dawaki', 'dawaki'),
  ('Durumi', 'durumi'),
  ('Galadimawa', 'galadimawa'),
  ('Garki', 'garki'),
  ('Gudu', 'gudu'),
  ('Guzape', 'guzape'),
  ('Gwarinpa', 'gwarinpa'),
  ('Jabi', 'jabi'),
  ('Jahi', 'jahi'),
  ('Kado', 'kado'),
  ('Karsana', 'karsana'),
  ('Katampe', 'katampe'),
  ('Kubwa', 'kubwa'),
  ('Life Camp', 'life-camp'),
  ('Lokogoma', 'lokogoma'),
  ('Lugbe', 'lugbe'),
  ('Mabushi', 'mabushi'),
  ('Maitama', 'maitama'),
  ('Utako', 'utako'),
  ('Wuse', 'wuse'),
  ('Wuse II', 'wuse-ii'),
  ('Wuye', 'wuye');

-- ---------------------------------------------------------------------------
-- Properties (listings)
-- ---------------------------------------------------------------------------
create table public.properties (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  district_id      smallint not null references public.districts (id),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title            text not null check (char_length(title) between 5 and 120),
  description      text check (char_length(description) <= 5000),
  listing_type     public.listing_type not null,
  category         public.property_category not null,
  property_type    public.property_type not null,
  status           public.listing_status not null default 'draft',
  -- Whole naira. bigint: Abuja prices exceed the int range (₦2.1bn).
  price            bigint not null check (price > 0),
  -- Required for rentals, forbidden for sales.
  rent_period      public.rent_period,
  address          text check (char_length(address) <= 200),
  bedrooms         smallint check (bedrooms between 0 and 50),
  bathrooms        smallint check (bathrooms between 0 and 50),
  area_sqm         integer check (area_sqm > 0),
  is_furnished     boolean not null default false,
  is_featured      boolean not null default false,
  features         text[] not null default '{}',
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint properties_rent_period_matches_listing
    check ((listing_type = 'rent') = (rent_period is not null)),
  constraint properties_published_has_date
    check (status <> 'published' or published_at is not null)
);

comment on column public.properties.price is 'Whole naira. For rentals, per rent_period.';

-- Indexes follow the public search: status is always filtered, then listing
-- type / district / price, newest first.
create index properties_search_idx
  on public.properties (status, listing_type, district_id, published_at desc);
create index properties_price_idx on public.properties (status, price);
create index properties_featured_idx
  on public.properties (published_at desc) where status = 'published' and is_featured;
create index properties_organization_idx on public.properties (organization_id);
create index properties_district_idx on public.properties (district_id);

create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Property images
-- ---------------------------------------------------------------------------
create table public.property_images (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references public.properties (id) on delete cascade,
  -- Public URL served to browsers.
  url           text not null check (url ~ '^https://'),
  -- Path inside the `property-images` bucket, used to delete the file later.
  storage_path  text,
  alt           text check (char_length(alt) <= 200),
  position      smallint not null default 0,
  created_at    timestamptz not null default now()
);

create index property_images_property_idx on public.property_images (property_id, position);

-- ---------------------------------------------------------------------------
-- Enquiries
-- ---------------------------------------------------------------------------
create table public.enquiries (
  id               uuid primary key default gen_random_uuid(),
  property_id      uuid not null references public.properties (id) on delete cascade,
  -- Always copied from the property by trigger, never trusted from the client.
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  -- Set from the session by trigger; null for guests.
  sender_user_id   uuid references auth.users (id) on delete set null,
  name             text not null check (char_length(name) between 2 and 100),
  email            text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone            text check (char_length(phone) <= 20),
  message          text not null check (char_length(message) between 10 and 2000),
  created_at       timestamptz not null default now()
);

create index enquiries_organization_idx on public.enquiries (organization_id, created_at desc);
create index enquiries_property_idx on public.enquiries (property_id);
create index enquiries_sender_idx on public.enquiries (sender_user_id);

-- Fills organization_id and sender_user_id server-side so a client can't
-- address an enquiry to another tenant or impersonate a user.
-- security definer: it must read the property even though RLS hides drafts.
create or replace function public.enquiries_fill_server_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select p.organization_id into new.organization_id
  from public.properties p
  where p.id = new.property_id;

  new.sender_user_id := auth.uid();
  return new;
end;
$$;

create trigger enquiries_fill_server_fields
  before insert on public.enquiries
  for each row execute function public.enquiries_fill_server_fields();

-- ---------------------------------------------------------------------------
-- Saved properties
-- ---------------------------------------------------------------------------
create table public.saved_properties (
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  property_id  uuid not null references public.properties (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, property_id)
);

create index saved_properties_property_idx on public.saved_properties (property_id);

-- ---------------------------------------------------------------------------
-- Listing counts per district (respects RLS of the caller: security_invoker)
-- ---------------------------------------------------------------------------
create view public.district_listing_counts
with (security_invoker = on) as
  select d.id, d.name, d.slug, count(p.id)::int as listing_count
  from public.districts d
  left join public.properties p on p.district_id = d.id and p.status = 'published'
  group by d.id;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.organizations    enable row level security;
alter table public.districts        enable row level security;
alter table public.properties       enable row level security;
alter table public.property_images  enable row level security;
alter table public.enquiries        enable row level security;
alter table public.saved_properties enable row level security;

create policy "Organizations are public"
  on public.organizations for select to anon, authenticated
  using (true);

-- Contact details are not public columns: RLS can't hide columns, so the public
-- roles get column-level SELECT on profile fields only. Phone numbers are
-- exposed through `organization_contacts`, which withholds private landlords'
-- numbers (they are reached through enquiries instead). Emails are never public.
revoke select on public.organizations from anon, authenticated;
grant select (id, name, slug, type, about, website, logo_url, created_at, updated_at)
  on public.organizations to anon, authenticated;

-- Runs with the view owner's rights (security_invoker off) so it can read the
-- phone column the public roles can't; it only ever returns business numbers.
create view public.organization_contacts as
  select id, case when type <> 'landlord' then phone end as phone
  from public.organizations;
grant select on public.organization_contacts to anon, authenticated;

create policy "Districts are public"
  on public.districts for select to anon, authenticated
  using (true);

create policy "Published listings are public"
  on public.properties for select to anon, authenticated
  using (status = 'published');

create policy "Images of published listings are public"
  on public.property_images for select to anon, authenticated
  using (exists (
    select 1 from public.properties p
    where p.id = property_images.property_id and p.status = 'published'
  ));

create policy "Anyone can enquire about a published listing"
  on public.enquiries for insert to anon, authenticated
  with check (exists (
    select 1 from public.properties p
    where p.id = enquiries.property_id and p.status = 'published'
  ));

create policy "Users see their saved properties"
  on public.saved_properties for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users save published properties"
  on public.saved_properties for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.properties p
      where p.id = saved_properties.property_id and p.status = 'published'
    )
  );

create policy "Users remove their saved properties"
  on public.saved_properties for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Storage: public bucket for listing photos (uploads are added in Phase 5)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('property-images', 'property-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

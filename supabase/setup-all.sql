-- OCHWORLD: full database setup (all migrations in order). Paste this whole file into the Supabase SQL Editor and click Run ONCE on a NEW project.
-- Generated from supabase/migrations/. Do not edit here; edit the migration files.

-- ===================== supabase/migrations/20261119000001_profiles.sql =====================
-- Migration 1: user profiles (originally supabase/schema.sql).
-- Creates a profile row for every new sign-up (email, Google or Apple).
-- Known issue (fixed in Phase 4): the UPDATE policy lets a user change their own `role`.

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  phone       text,
  role        text not null default 'seeker' check (role in ('seeker', 'agent')),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by their owner" on public.profiles;
create policy "Profiles are viewable by their owner"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Profiles are editable by their owner" on public.profiles;
create policy "Profiles are editable by their owner"
  on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'phone',
    case when new.raw_user_meta_data ->> 'role' = 'agent' then 'agent' else 'seeker' end,
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===================== supabase/migrations/20261119000002_listings.sql =====================
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

-- ===================== supabase/migrations/20261120000003_tenancy.sql =====================
-- Migration 3: authentication, roles and multi-tenant access (Phase 4)
--
-- Model
--   * A tenant is an ORGANIZATION (agency, landlord, developer). People belong to
--     organizations through ORGANIZATION_MEMBERS with a role:
--       owner  - full control, the only role that can grant/revoke owner
--       admin  - manages members (except owners), listings and enquiries
--       agent  - creates and edits the organization's listings, handles enquiries
--   * Home seekers are signed-in users with no membership.
--   * PLATFORM_ADMINS (super admins) are kept in a separate table that only the
--     service role can write. They are never derived from anything a user can edit.
--
-- Authorization lives in the database (RLS), through small SECURITY DEFINER
-- helpers so policies stay readable and don't recurse through each other's RLS.
-- The app never relies on a client-side role check for security.
--
-- Fixes from the Phase 1 audit
--   * profiles.role (user-editable) is removed; users can now update only
--     full_name, phone and avatar_url on their own profile.
--   * Sign-up metadata no longer influences any permission.

-- ---------------------------------------------------------------------------
-- Profiles: remove the self-assignable role, add onboarding state
-- ---------------------------------------------------------------------------
alter table public.profiles drop column if exists role;
alter table public.profiles add column if not exists onboarded_at timestamptz;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Column-level privileges: RLS limits WHICH rows, grants limit WHICH columns.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;

drop policy if exists "Profiles are editable by their owner" on public.profiles;
create policy "Profiles are editable by their owner"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- New users get a profile; nothing from user metadata affects access.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Membership and platform administration
-- ---------------------------------------------------------------------------
create type public.org_role as enum ('owner', 'admin', 'agent');
create type public.enquiry_status as enum ('new', 'responded', 'closed');

alter table public.organizations
  add column if not exists created_by uuid references auth.users (id) on delete set null;

create table public.organization_members (
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  user_id          uuid not null references auth.users (id) on delete cascade,
  role             public.org_role not null default 'agent',
  created_at       timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index organization_members_user_idx on public.organization_members (user_id);

create table public.platform_admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  note        text,
  created_at  timestamptz not null default now()
);

alter table public.enquiries
  add column status public.enquiry_status not null default 'new',
  add column updated_at timestamptz not null default now();
create trigger enquiries_set_updated_at
  before update on public.enquiries
  for each row execute function public.set_updated_at();
create index enquiries_status_idx on public.enquiries (organization_id, status);

-- ---------------------------------------------------------------------------
-- Authorization helpers
-- SECURITY DEFINER so they can read membership without triggering RLS on the
-- tables they check; STABLE so Postgres evaluates them once per statement.
-- ---------------------------------------------------------------------------
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.platform_admins where user_id = (select auth.uid()));
$$;

create or replace function public.is_org_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org and user_id = (select auth.uid())
  );
$$;

create or replace function public.has_org_role(org uuid, roles public.org_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org and user_id = (select auth.uid()) and role = any (roles)
  );
$$;

-- True when the current user and `other` belong to at least one common organization.
create or replace function public.shares_organization_with(other uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members mine
    join public.organization_members theirs on theirs.organization_id = mine.organization_id
    where mine.user_id = (select auth.uid()) and theirs.user_id = other
  );
$$;

-- ---------------------------------------------------------------------------
-- Keep published_at consistent and protect the last owner
-- ---------------------------------------------------------------------------
create or replace function public.properties_set_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger properties_set_published_at
  before insert or update of status on public.properties
  for each row execute function public.properties_set_published_at();

-- An organization must always keep at least one owner. (Deleting the whole
-- organization cascades past this, because the organization row is gone.)
create or replace function public.organization_members_keep_an_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'owner'
     and (tg_op = 'DELETE' or new.role <> 'owner')
     and exists (select 1 from public.organizations where id = old.organization_id)
     and not exists (
       select 1 from public.organization_members
       where organization_id = old.organization_id and role = 'owner' and user_id <> old.user_id
     )
  then
    raise exception 'An organization must keep at least one owner' using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger organization_members_keep_an_owner
  before update or delete on public.organization_members
  for each row execute function public.organization_members_keep_an_owner();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.organization_members enable row level security;
alter table public.platform_admins enable row level security;

-- Profiles ------------------------------------------------------------------
create policy "Teammates and platform admins can see profiles"
  on public.profiles for select to authenticated
  using (public.shares_organization_with(id) or public.is_platform_admin());

-- Platform admins -----------------------------------------------------------
-- Readable by the admin themself (so the app can check) and by other admins.
-- No write policies: grant super admin with SQL as the service role.
create policy "Admins can see the admin list"
  on public.platform_admins for select to authenticated
  using (user_id = (select auth.uid()) or public.is_platform_admin());

-- Organizations -------------------------------------------------------------
-- Creating an organization goes through complete_onboarding() so the creator
-- always becomes its owner; there is deliberately no INSERT policy.
-- Only profile fields are editable; slug, type and created_by are fixed after creation.
revoke insert, update on public.organizations from anon, authenticated;
grant update (name, about, phone, email, website, logo_url) on public.organizations to authenticated;

create policy "Owners and admins update their organization"
  on public.organizations for update to authenticated
  using (public.has_org_role(id, '{owner,admin}') or public.is_platform_admin())
  with check (public.has_org_role(id, '{owner,admin}') or public.is_platform_admin());

create policy "Platform admins delete organizations"
  on public.organizations for delete to authenticated
  using (public.is_platform_admin());

-- Organization members ------------------------------------------------------
create policy "Members see their team"
  on public.organization_members for select to authenticated
  using (public.is_org_member(organization_id) or public.is_platform_admin());

-- Owners manage everyone; admins manage non-owners; only owners create owners.
create policy "Owners and admins add members"
  on public.organization_members for insert to authenticated
  with check (
    public.is_platform_admin()
    or public.has_org_role(organization_id, '{owner}')
    or (public.has_org_role(organization_id, '{admin}') and role <> 'owner')
  );

create policy "Owners and admins change roles"
  on public.organization_members for update to authenticated
  using (
    public.is_platform_admin()
    or public.has_org_role(organization_id, '{owner}')
    or (public.has_org_role(organization_id, '{admin}') and role <> 'owner')
  )
  with check (
    public.is_platform_admin()
    or public.has_org_role(organization_id, '{owner}')
    or (public.has_org_role(organization_id, '{admin}') and role <> 'owner')
  );

create policy "Members leave; owners and admins remove members"
  on public.organization_members for delete to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_platform_admin()
    or public.has_org_role(organization_id, '{owner}')
    or (public.has_org_role(organization_id, '{admin}') and role <> 'owner')
  );

-- Properties ----------------------------------------------------------------
-- (Public read of published listings is in migration 2.)
create policy "Members see all their organization's listings"
  on public.properties for select to authenticated
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Members create listings for their organization"
  on public.properties for insert to authenticated
  with check (public.is_org_member(organization_id) or public.is_platform_admin());

-- WITH CHECK stops a member moving a listing into an organization they don't belong to.
create policy "Members edit their organization's listings"
  on public.properties for update to authenticated
  using (public.is_org_member(organization_id) or public.is_platform_admin())
  with check (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Owners and admins delete listings"
  on public.properties for delete to authenticated
  using (public.has_org_role(organization_id, '{owner,admin}') or public.is_platform_admin());

-- Property images -----------------------------------------------------------
create or replace function public.can_manage_property(property uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.properties p
    where p.id = property
      and (public.is_org_member(p.organization_id) or public.is_platform_admin())
  );
$$;

create policy "Members see their listings' images"
  on public.property_images for select to authenticated
  using (public.can_manage_property(property_id));

create policy "Members add images to their listings"
  on public.property_images for insert to authenticated
  with check (public.can_manage_property(property_id));

create policy "Members edit their listings' images"
  on public.property_images for update to authenticated
  using (public.can_manage_property(property_id))
  with check (public.can_manage_property(property_id));

create policy "Members delete their listings' images"
  on public.property_images for delete to authenticated
  using (public.can_manage_property(property_id));

-- Enquiries -----------------------------------------------------------------
-- Members read their organization's inbox; senders read what they sent.
-- Only `status` can be changed, and only by the organization.
revoke update on public.enquiries from anon, authenticated;
grant update (status) on public.enquiries to authenticated;

create policy "Organizations read their enquiries; senders read their own"
  on public.enquiries for select to authenticated
  using (
    public.is_org_member(organization_id)
    or sender_user_id = (select auth.uid())
    or public.is_platform_admin()
  );

create policy "Members update enquiry status"
  on public.enquiries for update to authenticated
  using (public.is_org_member(organization_id) or public.is_platform_admin())
  with check (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Owners and admins delete enquiries"
  on public.enquiries for delete to authenticated
  using (public.has_org_role(organization_id, '{owner,admin}') or public.is_platform_admin());

-- ---------------------------------------------------------------------------
-- Storage: listing photos at  property-images/<organization_id>/<property_id>/<file>
-- ---------------------------------------------------------------------------
create or replace function public.organization_id_from_path(path text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return split_part(path, '/', 1)::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

create policy "Members upload their organization's listing photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'property-images'
    and public.is_org_member(public.organization_id_from_path(name))
  );

create policy "Members replace their organization's listing photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'property-images' and public.is_org_member(public.organization_id_from_path(name)))
  with check (bucket_id = 'property-images' and public.is_org_member(public.organization_id_from_path(name)));

create policy "Members delete their organization's listing photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'property-images' and public.is_org_member(public.organization_id_from_path(name)));

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------
create or replace function public.slugify(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(value), '[^a-z0-9]+', '-', 'g'));
$$;

-- Finishes sign-up. Seekers are just marked onboarded. Agents, landlords and
-- developers get a new organization with themselves as owner, in one
-- transaction. Returns the organization id (null for seekers).
create or replace function public.complete_onboarding(
  account_type text,
  organization_name text default null,
  organization_phone text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  org_type public.organization_type;
  base_slug text;
  final_slug text;
  new_org uuid;
begin
  if uid is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  insert into public.profiles (id) values (uid) on conflict (id) do nothing;

  if account_type = 'seeker' then
    update public.profiles set onboarded_at = coalesce(onboarded_at, now()) where id = uid;
    return null;
  end if;

  if account_type not in ('agency', 'landlord', 'developer') then
    raise exception 'Unknown account type' using errcode = '22023';
  end if;
  org_type := account_type::public.organization_type;

  organization_name := trim(organization_name);
  if organization_name is null or char_length(organization_name) not between 2 and 120 then
    raise exception 'Organization name must be 2 to 120 characters' using errcode = '22023';
  end if;
  if organization_phone is not null and char_length(organization_phone) > 20 then
    raise exception 'Phone number is too long' using errcode = '22023';
  end if;

  -- One self-created organization per user; more come through invitations.
  if exists (select 1 from public.organization_members where user_id = uid and role = 'owner') then
    raise exception 'You already own an organization' using errcode = '23505';
  end if;

  base_slug := coalesce(nullif(public.slugify(organization_name), ''), 'organization');
  final_slug := base_slug;
  while exists (select 1 from public.organizations where slug = final_slug) loop
    final_slug := base_slug || '-' || substr(md5(random()::text), 1, 4);
  end loop;

  insert into public.organizations (name, slug, type, phone, created_by)
  values (organization_name, final_slug, org_type, nullif(trim(organization_phone), ''), uid)
  returning id into new_org;

  insert into public.organization_members (organization_id, user_id, role)
  values (new_org, uid, 'owner');

  update public.profiles set onboarded_at = coalesce(onboarded_at, now()) where id = uid;
  return new_org;
end;
$$;

-- The signed-in user's organizations, including contact columns that aren't
-- publicly readable on `organizations`.
create or replace function public.my_organizations()
returns table (
  id uuid,
  name text,
  slug text,
  type public.organization_type,
  phone text,
  email text,
  role public.org_role
)
language sql
stable
security definer
set search_path = ''
as $$
  select o.id, o.name, o.slug, o.type, o.phone, o.email, m.role
  from public.organization_members m
  join public.organizations o on o.id = m.organization_id
  where m.user_id = (select auth.uid())
  order by m.created_at;
$$;

-- RPCs are for signed-in users only.
revoke execute on function public.complete_onboarding(text, text, text) from public, anon;
grant execute on function public.complete_onboarding(text, text, text) to authenticated;
revoke execute on function public.my_organizations() from public, anon;
grant execute on function public.my_organizations() to authenticated;

-- ===================== supabase/migrations/20261120000004_explicit_grants.sql =====================
-- Migration 4: explicit table privileges for the API roles.
--
-- Earlier migrations relied on Supabase's default privileges (which grant the
-- `anon` and `authenticated` roles access to new tables). Newer Supabase
-- projects can have those defaults turned off, which makes every query fail
-- with "permission denied". This migration grants exactly what the app needs,
-- explicitly. RLS policies still decide which ROWS each user sees; these grants
-- decide which TABLES/COLUMNS the roles may touch at all. Safe to re-run.

grant usage on schema public to anon, authenticated, service_role;

-- The service role (admin scripts, server jobs) bypasses RLS but still needs table privileges.
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

-- Reference data and public listings
grant select on public.districts to anon, authenticated;
grant select on public.district_listing_counts to anon, authenticated;
grant select on public.organization_contacts to anon, authenticated;
grant select on public.properties to anon, authenticated;
grant select on public.property_images to anon, authenticated;

-- Organizations: public profile columns only (contact columns stay private).
grant select (id, name, slug, type, about, website, logo_url, created_at, updated_at)
  on public.organizations to anon, authenticated;
grant update (name, about, phone, email, website, logo_url) on public.organizations to authenticated;
grant delete on public.organizations to authenticated;

-- Listings management (RLS: organization members / platform admins only)
grant insert, update, delete on public.properties to authenticated;
grant insert, update, delete on public.property_images to authenticated;

-- Enquiries: anyone may send; members read and change status (RLS + column grant).
grant insert on public.enquiries to anon, authenticated;
grant select, delete on public.enquiries to authenticated;
grant update (status) on public.enquiries to authenticated;

-- Favourites
grant select, insert, delete on public.saved_properties to authenticated;

-- Accounts and membership
grant select on public.profiles to authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;
grant select, insert, update, delete on public.organization_members to authenticated;
grant select on public.platform_admins to authenticated;

-- Functions used inside RLS policies must be executable by the caller.
grant execute on function public.is_platform_admin() to anon, authenticated;
grant execute on function public.is_org_member(uuid) to anon, authenticated;
grant execute on function public.has_org_role(uuid, public.org_role[]) to anon, authenticated;
grant execute on function public.shares_organization_with(uuid) to anon, authenticated;
grant execute on function public.can_manage_property(uuid) to anon, authenticated;
grant execute on function public.organization_id_from_path(text) to authenticated;
grant execute on function public.complete_onboarding(text, text, text) to authenticated;
grant execute on function public.my_organizations() to authenticated;

-- ===================== supabase/migrations/20261121000005_listing_management.sql =====================
-- ============================================================================
-- Phase 5: listing management and teams
-- ============================================================================
--   1. Only platform admins can feature a listing (agents can't promote their own).
--   2. Team invitations: owners/admins create a link, the invitee signs in with
--      the invited email and accepts it. No email service needed: the link can
--      be shared by WhatsApp, SMS or email.
--   3. organization_team(): the member list for the team page.
-- Safe to run more than once (applied automatically by .github/workflows/database.yml).

-- 1. Featured listings ---------------------------------------------------------
-- End users (requests with a signed-in user) who aren't platform admins can't
-- change is_featured. Admin scripts using the secret key, and the SQL editor,
-- have no auth.uid() and are unaffected.
create or replace function public.properties_guard_featured()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and not public.is_platform_admin() then
    if tg_op = 'INSERT' then
      new.is_featured := false;
    else
      new.is_featured := old.is_featured;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists properties_guard_featured on public.properties;
create trigger properties_guard_featured
  before insert or update on public.properties
  for each row execute function public.properties_guard_featured();

-- 2. Invitations ---------------------------------------------------------------
create table if not exists public.organization_invitations (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  email            text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  role             public.org_role not null default 'agent' check (role <> 'owner'),
  -- 256 random bits, no extension needed.
  token            text not null unique
                   default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  invited_by       uuid references auth.users (id) on delete set null default auth.uid(),
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null default now() + interval '14 days',
  accepted_at      timestamptz,
  accepted_by      uuid references auth.users (id) on delete set null
);

-- One open invitation per person per organization.
create unique index if not exists organization_invitations_open_idx
  on public.organization_invitations (organization_id, lower(email)) where accepted_at is null;

alter table public.organization_invitations enable row level security;

drop policy if exists "Owners and admins see their invitations" on public.organization_invitations;
create policy "Owners and admins see their invitations"
  on public.organization_invitations for select to authenticated
  using (public.has_org_role(organization_id, '{owner,admin}') or public.is_platform_admin());

drop policy if exists "Owners and admins invite" on public.organization_invitations;
create policy "Owners and admins invite"
  on public.organization_invitations for insert to authenticated
  with check (public.has_org_role(organization_id, '{owner,admin}') or public.is_platform_admin());

drop policy if exists "Owners and admins cancel invitations" on public.organization_invitations;
create policy "Owners and admins cancel invitations"
  on public.organization_invitations for delete to authenticated
  using (public.has_org_role(organization_id, '{owner,admin}') or public.is_platform_admin());

revoke all on public.organization_invitations from anon, authenticated;
grant select, delete on public.organization_invitations to authenticated;
grant insert (organization_id, email, role) on public.organization_invitations to authenticated;
grant all on public.organization_invitations to service_role;

-- What the accept page shows. Anyone holding the link may see it.
create or replace function public.invitation_preview(invite_token text)
returns table (organization_name text, role public.org_role, email text, expired boolean, accepted boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select o.name, i.role, i.email, i.expires_at < now(), i.accepted_at is not null
  from public.organization_invitations i
  join public.organizations o on o.id = i.organization_id
  where i.token = invite_token;
$$;

-- Joins the organization. The signed-in user's email must match the invitation.
-- Errors: OCH01 invalid/used/expired, OCH02 different email, 28000 not signed in.
create or replace function public.accept_invitation(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  user_email text;
  inv public.organization_invitations;
begin
  if uid is null then
    raise exception 'Sign in to accept this invitation' using errcode = '28000';
  end if;

  select * into inv from public.organization_invitations where token = invite_token for update;
  if not found or inv.accepted_at is not null or inv.expires_at < now() then
    raise exception 'This invitation is invalid, already used or expired' using errcode = 'OCH01';
  end if;

  select email into user_email from auth.users where id = uid;
  if lower(inv.email) <> lower(coalesce(user_email, '')) then
    raise exception 'This invitation was sent to a different email address' using errcode = 'OCH02';
  end if;

  insert into public.organization_members (organization_id, user_id, role)
  values (inv.organization_id, uid, inv.role)
  on conflict (organization_id, user_id) do nothing;

  update public.organization_invitations set accepted_at = now(), accepted_by = uid where id = inv.id;
  -- Invited team members skip the onboarding questions.
  update public.profiles set onboarded_at = coalesce(onboarded_at, now()) where id = uid;
  return inv.organization_id;
end;
$$;

-- 3. Team list -----------------------------------------------------------------
-- Members see who is on their team; only owners/admins (and platform admins) see emails.
create or replace function public.organization_team(org uuid)
returns table (user_id uuid, full_name text, email text, role public.org_role, joined_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select m.user_id,
         p.full_name,
         case when public.has_org_role(org, '{owner,admin}') or public.is_platform_admin() then u.email end,
         m.role,
         m.created_at
  from public.organization_members m
  join auth.users u on u.id = m.user_id
  left join public.profiles p on p.id = m.user_id
  where m.organization_id = org
    and (public.is_org_member(org) or public.is_platform_admin())
  order by m.created_at;
$$;

revoke execute on function public.invitation_preview(text) from public;
revoke execute on function public.accept_invitation(text) from public;
revoke execute on function public.organization_team(uuid) from public;
grant execute on function public.invitation_preview(text) to anon, authenticated, service_role;
grant execute on function public.accept_invitation(text) to authenticated, service_role;
grant execute on function public.organization_team(uuid) to authenticated, service_role;

-- ===================== supabase/migrations/20261121000006_fix_new_user_trigger.sql =====================
-- ============================================================================
-- Fix: "Database error creating new user"
-- ============================================================================
-- Re-running migration 1 after migration 3 brings back the original
-- handle_new_user(), which writes profiles.role, a column migration 3 removed.
-- Every sign-up then fails. This restores the current version and makes it
-- defensive: if creating the profile ever fails, the sign-up still succeeds
-- (a warning goes to the Postgres logs) and the profile is created later by
-- onboarding (complete_onboarding inserts it if missing).
-- Safe to run more than once.

alter table public.profiles drop column if exists role;
alter table public.profiles add column if not exists onboarded_at timestamptz;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    insert into public.profiles (id, full_name, phone, avatar_url)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
      new.raw_user_meta_data ->> 'phone',
      new.raw_user_meta_data ->> 'avatar_url'
    )
    on conflict (id) do nothing;
  exception when others then
    raise warning 'handle_new_user: profile not created for %: % (%)', new.id, sqlerrm, sqlstate;
  end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profiles for anyone who signed up while sign-ups were broken (none should
-- exist, but this keeps every user with a profile).
insert into public.profiles (id, full_name)
select u.id, coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- ===================== supabase/migrations/20261121000007_legal_requests.sql =====================
-- ============================================================================
-- Property legal services: requests from buyers, renters and sellers
-- ============================================================================
-- Anyone (guest or signed in) can ask for help: title verification, survey
-- checks, agreements, transfers. Requests are private: only the person who
-- sent one (if signed in) and platform admins can read them. Only platform
-- admins change status (Phase 6 admin tools). Safe to run more than once.

do $$ begin
  create type public.legal_service as enum (
    'title_verification',   -- C of O / R of O, AGIS search, encumbrances
    'survey_verification',  -- survey plan, beacons, land use
    'agreement_review',     -- contract of sale, tenancy agreement, offer letter
    'transfer_consent',     -- deed of assignment, Governor's consent, registration
    'due_diligence'         -- full check of a property, developer or agent
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.legal_request_status as enum ('new', 'in_progress', 'completed', 'closed');
exception when duplicate_object then null; end $$;

create table if not exists public.legal_requests (
  id              uuid primary key default gen_random_uuid(),
  service         public.legal_service not null,
  -- Optional link to a listing on OCHWORLD; otherwise described in `property_details`.
  property_id     uuid references public.properties (id) on delete set null,
  property_details text check (char_length(property_details) <= 500),
  name            text not null check (char_length(name) between 2 and 100),
  email           text not null check (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone           text not null check (char_length(phone) <= 20),
  message         text check (char_length(message) <= 2000),
  status          public.legal_request_status not null default 'new',
  -- Set by the trigger from the session, never by the client.
  requester_id    uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists legal_requests_status_idx on public.legal_requests (status, created_at desc);
create index if not exists legal_requests_requester_idx on public.legal_requests (requester_id, created_at desc);

drop trigger if exists legal_requests_set_updated_at on public.legal_requests;
create trigger legal_requests_set_updated_at
  before update on public.legal_requests
  for each row execute function public.set_updated_at();

-- Requester comes from the session; a guest's request has none.
create or replace function public.legal_requests_set_requester()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.requester_id := (select auth.uid());
  new.status := 'new';
  return new;
end;
$$;

drop trigger if exists legal_requests_set_requester on public.legal_requests;
create trigger legal_requests_set_requester
  before insert on public.legal_requests
  for each row execute function public.legal_requests_set_requester();

alter table public.legal_requests enable row level security;

drop policy if exists "Anyone can request legal help" on public.legal_requests;
create policy "Anyone can request legal help"
  on public.legal_requests for insert to anon, authenticated
  with check (
    -- A linked property must be a published listing.
    property_id is null
    or exists (select 1 from public.properties p where p.id = property_id and p.status = 'published')
  );

drop policy if exists "Requesters and platform admins read legal requests" on public.legal_requests;
create policy "Requesters and platform admins read legal requests"
  on public.legal_requests for select to authenticated
  using (requester_id = (select auth.uid()) or public.is_platform_admin());

drop policy if exists "Platform admins update legal requests" on public.legal_requests;
create policy "Platform admins update legal requests"
  on public.legal_requests for update to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

revoke all on public.legal_requests from anon, authenticated;
grant insert (service, property_id, property_details, name, email, phone, message)
  on public.legal_requests to anon, authenticated;
grant select on public.legal_requests to authenticated;
grant update (status) on public.legal_requests to authenticated;
grant all on public.legal_requests to service_role;

-- ===================== supabase/migrations/20261121000008_district_ratings.sql =====================
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

-- ===================== supabase/migrations/20261122000009_legal_services_catalogue.sql =====================
-- ============================================================================
-- Legal services catalogue, managed by the OCHWORLD team (platform admins)
-- ============================================================================
-- Each legal service has its own page (/legal-services/<slug>), a card in the
-- homepage carousel, and can be added, edited, hidden or reordered by
-- platform admins without a code change. Requests now point at a service row.
-- Safe to run more than once.

create table if not exists public.legal_services (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  title        text not null check (char_length(title) between 3 and 80),
  -- One of the icon names the site knows (see src/lib/legal/icons.tsx).
  icon         text not null default 'scale'
               check (icon in ('file-search', 'file-text', 'gavel', 'messages', 'key', 'land', 'scale', 'shield', 'building', 'handshake')),
  summary      text not null check (char_length(summary) between 10 and 200),   -- card text
  description  text not null check (char_length(description) <= 2000),          -- page introduction
  covers       text[] not null default '{}',                                   -- "What it covers"
  reasons      text[] not null default '{}',                                   -- "Why you might need it"
  position     integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists legal_services_order_idx on public.legal_services (is_published, position);

drop trigger if exists legal_services_set_updated_at on public.legal_services;
create trigger legal_services_set_updated_at
  before update on public.legal_services
  for each row execute function public.set_updated_at();

alter table public.legal_services enable row level security;

drop policy if exists "Published legal services are public" on public.legal_services;
create policy "Published legal services are public"
  on public.legal_services for select to anon, authenticated
  using (is_published or public.is_platform_admin());

drop policy if exists "Platform admins manage legal services" on public.legal_services;
create policy "Platform admins manage legal services"
  on public.legal_services for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

revoke all on public.legal_services from anon, authenticated;
grant select on public.legal_services to anon, authenticated;
grant insert, update, delete on public.legal_services to authenticated;
grant all on public.legal_services to service_role;

-- Requests point at a catalogue service. The old fixed `service` column stays
-- for requests made before this migration, and becomes optional.
alter table public.legal_requests add column if not exists service_id uuid references public.legal_services (id) on delete set null;
alter table public.legal_requests alter column service drop not null;
create index if not exists legal_requests_service_idx on public.legal_requests (service_id);
grant insert (service_id) on public.legal_requests to anon, authenticated;

drop policy if exists "Anyone can request legal help" on public.legal_requests;
create policy "Anyone can request legal help"
  on public.legal_requests for insert to anon, authenticated
  with check (
    (service_id is not null or service is not null)
    and (service_id is null or exists (select 1 from public.legal_services s where s.id = service_id and s.is_published))
    and (property_id is null or exists (select 1 from public.properties p where p.id = property_id and p.status = 'published'))
  );

-- The first six services. Only inserted if missing, so admins' edits are never overwritten.
insert into public.legal_services (slug, title, icon, summary, description, covers, reasons, position) values
(
  'property-due-diligence', 'Property Due Diligence', 'file-search',
  'Find out everything about a property, its seller and its papers before you commit any money.',
  'Due diligence is the full background check on a property before you buy, lease or invest. A property lawyer confirms who really owns it, that the title documents are genuine, that the land use allows what you plan to do, and that nothing on record (a dispute, a revocation, a mortgage) puts your money at risk.',
  array[
    'Title search at AGIS (Abuja Geographic Information Systems)',
    'Verification of the C of O or R of O and the survey plan',
    'Checks for encumbrances, revocations, disputes and outstanding charges',
    'Confirmation of the approved land use and building approvals',
    'Checks on the seller, agent or developer',
    'A written report of the findings and risks in plain English'
  ],
  array[
    'You are about to pay a deposit or the full price for land or a house',
    'You are buying off-plan from a developer',
    'The seller is in a hurry or the price looks too good to be true',
    'You are buying from abroad and cannot inspect the documents yourself'
  ],
  10
),
(
  'documentation', 'Documentation', 'file-text',
  'Have the right contracts and deeds drafted or reviewed, so every deal is properly written down.',
  'Property deals in Abuja involve several documents, and a badly drafted one can cost you the property. A lawyer drafts or reviews them so your interests are protected and the documents are accepted when you register the transaction.',
  array[
    'Contracts of sale and offer letters',
    'Deeds of assignment, sublease and gift',
    'Powers of attorney',
    'Off-plan and development agreements',
    'Applications for the Minister''s consent and registration at AGIS',
    'Review of documents prepared by the other side'
  ],
  array[
    'You have agreed a price and need the sale written up properly',
    'The seller has given you documents to sign and you want them checked',
    'You need the property transferred into your name after buying',
    'You are entering a joint venture with a developer'
  ],
  20
),
(
  'property-litigation', 'Property Litigation', 'gavel',
  'Get representation when a property dispute ends up in court or needs to be settled.',
  'When negotiation fails, a property lawyer can represent you in court or in mediation. Common cases include ownership disputes, double sales, trespass, breach of a sale or development agreement, and recovery of possession from tenants.',
  array[
    'Ownership and title disputes, including double allocations',
    'Trespass and encroachment on your land',
    'Breach of contract by a seller, buyer or developer',
    'Recovery of premises from tenants',
    'Mediation and settlement before going to court',
    'Representation in the FCT High Court and other courts'
  ],
  array[
    'Someone else claims the land or property you paid for',
    'A developer has not delivered what was agreed',
    'A tenant refuses to leave after proper notice',
    'You have received a court process about a property'
  ],
  30
),
(
  'legal-consultation', 'Legal Consultation', 'messages',
  'Speak with a property lawyer about your situation and understand your options.',
  'Not sure what you need yet? A consultation gives you a property lawyer''s view on your situation: the risks, your rights and the next steps, before you spend money or sign anything.',
  array[
    'A one-to-one consultation, in person, by phone or online',
    'A review of the documents you already have',
    'Explanation of your rights and obligations',
    'Recommended next steps and estimated costs'
  ],
  array[
    'You are new to buying property in Abuja',
    'You have inherited a property and are not sure what to do',
    'You want a second opinion before signing',
    'You are unsure which service you need'
  ],
  40
),
(
  'tenancy-matters', 'Tenancy Matters', 'key',
  'Tenancy agreements, rent disputes and recovering possession, handled properly for landlords and tenants.',
  'Renting in Abuja is governed by the tenancy agreement and the law on recovery of premises. A lawyer helps landlords and tenants put fair agreements in place and resolve disputes the right way.',
  array[
    'Drafting and reviewing tenancy and lease agreements',
    'Rent reviews, renewals and service charge questions',
    'Notices to quit and the correct notice periods',
    'Recovery of premises and rent arrears',
    'Advice for tenants facing eviction or unfair terms'
  ],
  array[
    'You are letting out a property and need a solid agreement',
    'Your landlord wants to raise the rent or end the tenancy',
    'A tenant owes rent or will not leave',
    'You are renting commercial space and want the lease checked'
  ],
  50
),
(
  'land-and-title-matters', 'Land and Title Matters', 'land',
  'Title searches, C of O processing, regularisation and Minister''s consent for land in the FCT.',
  'In the FCT, land is held from the Federal Government and titles are managed by AGIS. A lawyer can check a title, help you get or regularise your papers, and process consent so the land is fully and legally yours.',
  array[
    'Title searches and verification at AGIS',
    'Processing of the Certificate of Occupancy (C of O)',
    'Regularisation and recertification of title documents',
    'Minister''s consent for transfers and mortgages',
    'Change of land use and other title applications'
  ],
  array[
    'You hold an offer letter or R of O and want a C of O',
    'Your documents were issued by an area council and need regularising',
    'You bought land and need the transfer recognised',
    'You want to use land for a different purpose than approved'
  ],
  60
)
on conflict (slug) do nothing;

-- ===================== supabase/migrations/20261122000010_legal_service_images.sql =====================
-- ============================================================================
-- Legal services: a picture for each service
-- ============================================================================
-- Optional image URL (Supabase Storage, uploaded by platform admins later).
-- When empty, the site uses the default photo bundled with the site
-- (public/images/legal/<slug>.jpg). Safe to run more than once.

alter table public.legal_services add column if not exists image_url text;

do $$ begin
  alter table public.legal_services add constraint legal_services_image_url_check
    check (image_url is null or (image_url ~ '^https://' and char_length(image_url) <= 500));
exception when duplicate_object then null; end $$;

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

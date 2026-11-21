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

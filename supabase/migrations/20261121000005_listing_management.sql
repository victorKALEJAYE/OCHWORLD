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

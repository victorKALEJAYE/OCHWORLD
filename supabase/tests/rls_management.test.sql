-- Listing management, featuring and invitations (migration 20261121000005).
-- See supabase/tests/README.md. Runs in a transaction and rolls back.
\set ON_ERROR_STOP 0
begin;

create or replace function pg_temp.check(name text, ok boolean) returns void language plpgsql as
$$ begin raise notice '% %', case when ok then 'PASS' else 'FAIL' end, name; end $$;

-- Org A (seed agency) with owner + agent; org B (seed landlord) with owner; a newcomer; a platform admin.
insert into auth.users (id, email) values
  ('a0000000-0000-4000-a000-00000000000a', 'owner_a@example.com'),
  ('a0000000-0000-4000-a000-0000000000aa', 'agent_a@example.com'),
  ('b0000000-0000-4000-a000-00000000000b', 'owner_b@example.com'),
  ('c0000000-0000-4000-a000-00000000000c', 'New.Agent@example.com'),
  ('d0000000-0000-4000-a000-00000000000d', 'admin@example.com');
insert into public.profiles (id, full_name) values
  ('a0000000-0000-4000-a000-00000000000a', 'Owner A'), ('a0000000-0000-4000-a000-0000000000aa', 'Agent A'),
  ('b0000000-0000-4000-a000-00000000000b', 'Owner B'), ('c0000000-0000-4000-a000-00000000000c', 'Newcomer'),
  ('d0000000-0000-4000-a000-00000000000d', 'Admin')
on conflict (id) do nothing;
insert into public.organization_members (organization_id, user_id, role) values
  ('00000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-00000000000a', 'owner'),
  ('00000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-0000000000aa', 'agent'),
  ('00000000-0000-4000-a000-000000000002', 'b0000000-0000-4000-a000-00000000000b', 'owner');
insert into public.platform_admins (user_id, note) values ('d0000000-0000-4000-a000-00000000000d', 'test');

create temp table ids (k text primary key, v text);
grant all on ids to authenticated, anon;

-- ===================== Listings =====================
set role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-a000-0000000000aa', false);

with i as (
  insert into public.properties (organization_id, district_id, slug, title, listing_type, category, property_type, price, rent_period, is_featured)
  select '00000000-0000-4000-a000-000000000001', id, 'agent-made-listing-x1', 'Agent made listing', 'rent', 'residential', 'apartment', 5000000, 'year', true
  from public.districts where slug = 'jabi'
  returning id, is_featured, status
)
insert into ids select 'listing', id::text from i;
select pg_temp.check('agent creates a draft listing for own org',
  (select status from public.properties where id = (select v::uuid from ids where k = 'listing')) = 'draft');
select pg_temp.check('agent cannot feature on insert',
  (select is_featured from public.properties where id = (select v::uuid from ids where k = 'listing')) = false);

update public.properties set status = 'published' where id = (select v::uuid from ids where k = 'listing');
select pg_temp.check('agent publishes; published_at set',
  (select published_at is not null from public.properties where id = (select v::uuid from ids where k = 'listing')));
update public.properties set is_featured = true where id = (select v::uuid from ids where k = 'listing');
select pg_temp.check('agent cannot feature on update',
  (select is_featured from public.properties where id = (select v::uuid from ids where k = 'listing')) = false);

do $$ begin
  insert into public.properties (organization_id, district_id, slug, title, listing_type, category, property_type, price)
  select '00000000-0000-4000-a000-000000000002', id, 'sneaky-listing-x2', 'Sneaky listing', 'sale', 'land', 'land', 1000000
  from public.districts limit 1;
  perform pg_temp.check('agent cannot create a listing for another org', false);
exception when insufficient_privilege then perform pg_temp.check('agent cannot create a listing for another org', true); end $$;

with d as (delete from public.properties where id = (select v::uuid from ids where k = 'listing') returning 1)
select pg_temp.check('agent cannot delete listings (owner/admin only)', (select count(*) from d) = 0);

with i as (
  insert into public.property_images (property_id, url, storage_path, position)
  values ((select v::uuid from ids where k = 'listing'), 'https://example.supabase.co/x.jpg',
          '00000000-0000-4000-a000-000000000001/' || (select v from ids where k = 'listing') || '/x.jpg', 0)
  returning 1)
select pg_temp.check('agent adds a photo to own listing', (select count(*) from i) = 1);

-- Owner B can't touch org A's listing.
select set_config('request.jwt.claim.sub', 'b0000000-0000-4000-a000-00000000000b', false);
with u as (update public.properties set title = 'Hijacked title' where id = (select v::uuid from ids where k = 'listing') returning 1)
select pg_temp.check('other org cannot edit the listing', (select count(*) from u) = 0);
with d as (delete from public.property_images where property_id = (select v::uuid from ids where k = 'listing') returning 1)
select pg_temp.check('other org cannot delete its photos', (select count(*) from d) = 0);

-- Platform admin features it.
select set_config('request.jwt.claim.sub', 'd0000000-0000-4000-a000-00000000000d', false);
update public.properties set is_featured = true where id = (select v::uuid from ids where k = 'listing');
select pg_temp.check('platform admin can feature',
  (select is_featured from public.properties where id = (select v::uuid from ids where k = 'listing')));

-- Owner A deletes it (images cascade).
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-a000-00000000000a', false);
with d as (delete from public.properties where id = (select v::uuid from ids where k = 'listing') returning 1)
select pg_temp.check('owner deletes the listing', (select count(*) from d) = 1);
reset role;
select pg_temp.check('photos removed with the listing',
  not exists (select 1 from public.property_images where property_id = (select v::uuid from ids where k = 'listing')));

-- ===================== Invitations =====================
set role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-a000-0000000000aa', false);
do $$ begin
  insert into public.organization_invitations (organization_id, email, role)
  values ('00000000-0000-4000-a000-000000000001', 'someone@example.com', 'agent');
  perform pg_temp.check('agent cannot invite', false);
exception when insufficient_privilege then perform pg_temp.check('agent cannot invite', true); end $$;

select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-a000-00000000000a', false);
do $$ begin
  insert into public.organization_invitations (organization_id, email, role)
  values ('00000000-0000-4000-a000-000000000001', 'x@example.com', 'owner');
  perform pg_temp.check('cannot invite as owner', false);
exception when check_violation then perform pg_temp.check('cannot invite as owner', true); end $$;
do $$ begin
  insert into public.organization_invitations (organization_id, email, role, token)
  values ('00000000-0000-4000-a000-000000000001', 'x@example.com', 'agent', 'chosen-token');
  perform pg_temp.check('cannot choose the token', false);
exception when insufficient_privilege then perform pg_temp.check('cannot choose the token', true); end $$;

with i as (
  insert into public.organization_invitations (organization_id, email, role)
  values ('00000000-0000-4000-a000-000000000001', 'new.agent@example.com', 'agent')
  returning token)
insert into ids select 'token', token from i;
select pg_temp.check('owner creates an invitation with a long random token',
  (select length(v) from ids where k = 'token') = 64);
do $$ begin
  insert into public.organization_invitations (organization_id, email, role)
  values ('00000000-0000-4000-a000-000000000001', 'NEW.agent@example.com', 'admin');
  perform pg_temp.check('only one open invitation per email', false);
exception when unique_violation then perform pg_temp.check('only one open invitation per email', true); end $$;

select set_config('request.jwt.claim.sub', 'b0000000-0000-4000-a000-00000000000b', false);
select pg_temp.check('other org cannot see the invitation', (select count(*) from public.organization_invitations) = 0);

-- Preview works without signing in.
reset role;
set role anon;
select set_config('request.jwt.claim.sub', '', false);
select pg_temp.check('anyone with the link sees the preview',
  (select organization_name from public.invitation_preview((select v from ids where k = 'token'))) is not null);
select pg_temp.check('wrong token previews nothing',
  not exists (select 1 from public.invitation_preview('not-a-real-token')));
reset role;

set role authenticated;
select set_config('request.jwt.claim.sub', 'b0000000-0000-4000-a000-00000000000b', false);
do $$ begin
  perform public.accept_invitation((select v from ids where k = 'token'));
  perform pg_temp.check('a different email cannot accept', false);
exception when sqlstate 'OCH02' then perform pg_temp.check('a different email cannot accept', true); end $$;

select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-a000-00000000000c', false);
select pg_temp.check('invitee accepts (email match ignores case)',
  public.accept_invitation((select v from ids where k = 'token')) = '00000000-0000-4000-a000-000000000001');
select pg_temp.check('invitee is now an agent of org A',
  (select role from public.my_organizations() where id = '00000000-0000-4000-a000-000000000001') = 'agent');
do $$ begin
  perform public.accept_invitation((select v from ids where k = 'token'));
  perform pg_temp.check('an invitation works only once', false);
exception when sqlstate 'OCH01' then perform pg_temp.check('an invitation works only once', true); end $$;
reset role;
select pg_temp.check('invitee marked as onboarded',
  (select onboarded_at is not null from public.profiles where id = 'c0000000-0000-4000-a000-00000000000c'));

-- Expired invitations are refused.
insert into public.organization_invitations (organization_id, email, role, token, expires_at)
values ('00000000-0000-4000-a000-000000000002', 'New.Agent@example.com', 'agent', 'expired-token', now() - interval '1 day');
set role authenticated;
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-a000-00000000000c', false);
do $$ begin
  perform public.accept_invitation('expired-token');
  perform pg_temp.check('expired invitation refused', false);
exception when sqlstate 'OCH01' then perform pg_temp.check('expired invitation refused', true); end $$;

-- ===================== Team list =====================
select pg_temp.check('agent sees the team of org A',
  (select count(*) from public.organization_team('00000000-0000-4000-a000-000000000001')) = 3);
select pg_temp.check('agent does not see teammates'' emails',
  (select count(email) from public.organization_team('00000000-0000-4000-a000-000000000001')) = 0);
select pg_temp.check('agent cannot list another org''s team',
  (select count(*) from public.organization_team('00000000-0000-4000-a000-000000000002')) = 0);
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-a000-00000000000a', false);
select pg_temp.check('owner sees teammates'' emails',
  (select count(email) from public.organization_team('00000000-0000-4000-a000-000000000001')) = 3);

reset role;
rollback;

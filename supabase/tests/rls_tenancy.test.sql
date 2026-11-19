-- Tenant isolation and role tests for migration 20261120000003_tenancy.
-- See supabase/tests/README.md. Runs in a transaction and rolls back.
\set ON_ERROR_STOP 0
begin;

create or replace function pg_temp.check(name text, ok boolean) returns void language plpgsql as
$$ begin raise notice '% %', case when ok then 'PASS' else 'FAIL' end, name; end $$;

-- Cast: org A = Demo Realty (agency), org B = Sample Landlord.
--   owner_a (owner of A), agent_a (agent of A), owner_b (owner of B),
--   seeker (no membership), admin (platform admin), newbie (not onboarded)
insert into auth.users (id, email) values
  ('a0000000-0000-4000-a000-00000000000a', 'owner_a@example.com'),
  ('a0000000-0000-4000-a000-0000000000aa', 'agent_a@example.com'),
  ('b0000000-0000-4000-a000-00000000000b', 'owner_b@example.com'),
  ('c0000000-0000-4000-a000-00000000000c', 'seeker@example.com'),
  ('d0000000-0000-4000-a000-00000000000d', 'admin@example.com'),
  ('e0000000-0000-4000-a000-00000000000e', 'newbie@example.com');
insert into public.profiles (id, full_name) values
  ('a0000000-0000-4000-a000-00000000000a', 'Owner A'), ('a0000000-0000-4000-a000-0000000000aa', 'Agent A'),
  ('b0000000-0000-4000-a000-00000000000b', 'Owner B'), ('c0000000-0000-4000-a000-00000000000c', 'Seeker'),
  ('d0000000-0000-4000-a000-00000000000d', 'Admin'), ('e0000000-0000-4000-a000-00000000000e', 'Newbie')
on conflict (id) do nothing;
insert into public.organization_members (organization_id, user_id, role) values
  ('00000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-00000000000a', 'owner'),
  ('00000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-0000000000aa', 'agent'),
  ('00000000-0000-4000-a000-000000000002', 'b0000000-0000-4000-a000-00000000000b', 'owner');
insert into public.platform_admins (user_id, note) values ('d0000000-0000-4000-a000-00000000000d', 'test');

-- A draft in org A (seed already has one draft in org B), and one enquiry per org.
insert into public.properties (organization_id, district_id, slug, title, listing_type, category, property_type, price, status)
select '00000000-0000-4000-a000-000000000001', id, 'test-org-a-draft', 'Org A draft (test)', 'sale', 'residential', 'duplex', 100000000, 'draft'
from public.districts where slug = 'maitama';

set role authenticated;
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-a000-00000000000c', false);
insert into public.enquiries (property_id, name, email, message)
select id, 'Seeker', 'seeker@example.com', 'Is this still available?' from public.properties where slug = 'test-2-bed-apartment-jabi';
insert into public.enquiries (property_id, name, email, message)
select id, 'Seeker', 'seeker@example.com', 'Can I view on Saturday?' from public.properties where slug = 'test-5-bed-detached-duplex-maitama';
reset role;
-- Jabi apartment belongs to org B (landlord); Maitama duplex to org A.

-- ===================== Profiles =====================
set role authenticated;
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-a000-00000000000c', false);
with u as (update public.profiles set full_name = 'Seeker Renamed' where id = 'c0000000-0000-4000-a000-00000000000c' returning 1)
select pg_temp.check('user can edit own name', (select count(*) from u) = 1);
with u as (update public.profiles set full_name = 'Hacked' where id = 'a0000000-0000-4000-a000-00000000000a' returning 1)
select pg_temp.check('user cannot edit someone else''s profile', (select count(*) from u) = 0);
do $$ begin
  update public.profiles set onboarded_at = now() where id = 'c0000000-0000-4000-a000-00000000000c';
  perform pg_temp.check('user cannot set onboarded_at directly', false);
exception when insufficient_privilege then perform pg_temp.check('user cannot set onboarded_at directly', true); end $$;
select pg_temp.check('profiles.role column no longer exists',
  not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'role'));
select pg_temp.check('seeker cannot see other profiles', (select count(*) from public.profiles where id <> 'c0000000-0000-4000-a000-00000000000c') = 0);
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-a000-00000000000a', false);
select pg_temp.check('owner A sees teammate profile', exists (select 1 from public.profiles where id = 'a0000000-0000-4000-a000-0000000000aa'));
select pg_temp.check('owner A cannot see owner B profile', not exists (select 1 from public.profiles where id = 'b0000000-0000-4000-a000-00000000000b'));
reset role;

-- ===================== Onboarding RPC =====================
set role authenticated;
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-a000-00000000000c', false);
select pg_temp.check('seeker onboarding returns no organization', public.complete_onboarding('seeker') is null);
select set_config('request.jwt.claim.sub', 'e0000000-0000-4000-a000-00000000000e', false);
select public.complete_onboarding('agency', '  New Agency Ltd ', '0803 000 0000') as new_org \gset
select pg_temp.check('agency onboarding creates organization with clean slug',
  exists (select 1 from public.my_organizations() where id = :'new_org' and slug = 'new-agency-ltd' and role = 'owner'));
do $$ begin
  perform public.complete_onboarding('agency', 'Second Agency');
  perform pg_temp.check('second self-created organization rejected', false);
exception when unique_violation then perform pg_temp.check('second self-created organization rejected', true); end $$;
do $$ begin
  perform public.complete_onboarding('superadmin', 'x');
  perform pg_temp.check('unknown account type rejected', false);
exception when invalid_parameter_value then perform pg_temp.check('unknown account type rejected', true); end $$;
reset role;
select pg_temp.check('onboarding marks profiles onboarded',
  (select count(*) from public.profiles where onboarded_at is not null
   and id in ('c0000000-0000-4000-a000-00000000000c', 'e0000000-0000-4000-a000-00000000000e')) = 2);
set role anon;
do $$ begin
  perform public.complete_onboarding('agency', 'Anon Agency');
  perform pg_temp.check('anon cannot call complete_onboarding', false);
exception when insufficient_privilege then perform pg_temp.check('anon cannot call complete_onboarding', true); end $$;
reset role;

-- ===================== Listings =====================
set role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-a000-0000000000aa', false);
select pg_temp.check('agent A sees own org draft', exists (select 1 from public.properties where slug = 'test-org-a-draft'));
select pg_temp.check('agent A cannot see org B draft', not exists (select 1 from public.properties where status = 'draft' and organization_id = '00000000-0000-4000-a000-000000000002'));
do $$ begin
  insert into public.properties (organization_id, district_id, slug, title, listing_type, category, property_type, price)
  values ('00000000-0000-4000-a000-000000000001', 1, 'agent-a-new', 'Agent A new listing', 'sale', 'residential', 'apartment', 5000000);
  perform pg_temp.check('agent A can create listing for org A', true);
exception when others then perform pg_temp.check('agent A can create listing for org A: ' || sqlerrm, false); end $$;
do $$ begin
  insert into public.properties (organization_id, district_id, slug, title, listing_type, category, property_type, price)
  values ('00000000-0000-4000-a000-000000000002', 1, 'agent-a-into-b', 'Agent A into org B', 'sale', 'residential', 'apartment', 5000000);
  perform pg_temp.check('agent A blocked from creating listing for org B', false);
exception when others then perform pg_temp.check('agent A blocked from creating listing for org B', true); end $$;
with u as (update public.properties set price = 99000000 where slug = 'test-org-a-draft' returning 1)
select pg_temp.check('agent A can edit org A listing', (select count(*) from u) = 1);
do $$ begin
  update public.properties set organization_id = '00000000-0000-4000-a000-000000000002' where slug = 'test-org-a-draft';
  perform pg_temp.check('agent A blocked from moving listing to org B', false);
exception when others then perform pg_temp.check('agent A blocked from moving listing to org B', true); end $$;
with d as (delete from public.properties where slug = 'agent-a-new' returning 1)
select pg_temp.check('agent role cannot delete listings', (select count(*) from d) = 0);
select set_config('request.jwt.claim.sub', 'b0000000-0000-4000-a000-00000000000b', false);
with u as (update public.properties set price = 1 where organization_id = '00000000-0000-4000-a000-000000000001' returning 1)
select pg_temp.check('owner B cannot edit org A listings', (select count(*) from u) = 0);
select pg_temp.check('owner B cannot see org A draft', not exists (select 1 from public.properties where slug = 'test-org-a-draft'));
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-a000-00000000000a', false);
with d as (delete from public.properties where slug = 'agent-a-new' returning 1)
select pg_temp.check('owner A can delete org A listing', (select count(*) from d) = 1);
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-a000-00000000000c', false);
select pg_temp.check('seeker sees no drafts', not exists (select 1 from public.properties where status = 'draft'));
reset role;

-- ===================== Enquiries =====================
set role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-a000-00000000000a', false);
select pg_temp.check('owner A reads only org A enquiries',
  (select count(*) from public.enquiries) = 1
  and not exists (select 1 from public.enquiries where organization_id <> '00000000-0000-4000-a000-000000000001'));
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-a000-0000000000aa', false);
with u as (update public.enquiries set status = 'responded' returning 1)
select pg_temp.check('agent A can mark org A enquiry responded', (select count(*) from u) = 1);
do $$ begin
  update public.enquiries set message = 'Edited';
  perform pg_temp.check('enquiry message is read-only', false);
exception when insufficient_privilege then perform pg_temp.check('enquiry message is read-only', true); end $$;
select set_config('request.jwt.claim.sub', 'b0000000-0000-4000-a000-00000000000b', false);
select pg_temp.check('owner B reads only org B enquiries',
  (select count(*) from public.enquiries) = 1
  and not exists (select 1 from public.enquiries where organization_id <> '00000000-0000-4000-a000-000000000002'));
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-a000-00000000000c', false);
select pg_temp.check('seeker reads the enquiries they sent', (select count(*) from public.enquiries) = 2);
with u as (update public.enquiries set status = 'closed' returning 1)
select pg_temp.check('seeker cannot change enquiry status', (select count(*) from u) = 0);
reset role;

-- ===================== Members =====================
set role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-a000-0000000000aa', false);
do $$ begin
  insert into public.organization_members (organization_id, user_id, role)
  values ('00000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-00000000000c', 'agent');
  perform pg_temp.check('agent cannot add members', false);
exception when others then perform pg_temp.check('agent cannot add members', true); end $$;
with u as (update public.organization_members set role = 'owner' where user_id = 'a0000000-0000-4000-a000-0000000000aa' returning 1)
select pg_temp.check('agent cannot promote themself', (select count(*) from u) = 0);
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-a000-00000000000a', false);
do $$ begin
  insert into public.organization_members (organization_id, user_id, role)
  values ('00000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-00000000000c', 'agent');
  perform pg_temp.check('owner can add an agent', true);
exception when others then perform pg_temp.check('owner can add an agent: ' || sqlerrm, false); end $$;
do $$ begin
  delete from public.organization_members where user_id = 'a0000000-0000-4000-a000-00000000000a';
  perform pg_temp.check('last owner cannot leave', false);
exception when raise_exception then perform pg_temp.check('last owner cannot leave', true); end $$;
do $$ begin
  insert into public.organization_members (organization_id, user_id, role)
  values ('00000000-0000-4000-a000-000000000002', 'a0000000-0000-4000-a000-00000000000a', 'owner');
  perform pg_temp.check('owner A cannot join org B', false);
exception when others then perform pg_temp.check('owner A cannot join org B', true); end $$;
select pg_temp.check('owner A cannot see org B members',
  not exists (select 1 from public.organization_members where organization_id = '00000000-0000-4000-a000-000000000002'));
reset role;

-- ===================== Organizations =====================
set role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-a000-00000000000a', false);
with u as (update public.organizations set about = 'Updated about' where id = '00000000-0000-4000-a000-000000000001' returning 1)
select pg_temp.check('owner A can edit org A profile', (select count(*) from u) = 1);
do $$ begin
  update public.organizations set slug = 'hijacked' where id = '00000000-0000-4000-a000-000000000001';
  perform pg_temp.check('slug cannot be changed', false);
exception when insufficient_privilege then perform pg_temp.check('slug cannot be changed', true); end $$;
select pg_temp.check('my_organizations returns own org with contact details',
  (select phone is not null and role = 'owner' from public.my_organizations() where id = '00000000-0000-4000-a000-000000000001'));
select set_config('request.jwt.claim.sub', 'b0000000-0000-4000-a000-00000000000b', false);
with u as (update public.organizations set about = 'Hacked' where id = '00000000-0000-4000-a000-000000000001' returning 1)
select pg_temp.check('owner B cannot edit org A', (select count(*) from u) = 0);
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-a000-0000000000aa', false);
with u as (update public.organizations set about = 'Agent edit' where id = '00000000-0000-4000-a000-000000000001' returning 1)
select pg_temp.check('agent cannot edit organization profile', (select count(*) from u) = 0);
reset role;

-- ===================== Platform admin =====================
set role authenticated;
select set_config('request.jwt.claim.sub', 'd0000000-0000-4000-a000-00000000000d', false);
select pg_temp.check('platform admin is recognised', public.is_platform_admin());
select pg_temp.check('platform admin sees drafts of every org', (select count(*) from public.properties where status = 'draft') = 2);
select pg_temp.check('platform admin sees all enquiries', (select count(*) from public.enquiries) = 2);
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-a000-00000000000c', false);
select pg_temp.check('seeker is not a platform admin', not public.is_platform_admin());
do $$ begin
  insert into public.platform_admins (user_id) values ('c0000000-0000-4000-a000-00000000000c');
  perform pg_temp.check('nobody can make themself platform admin', false);
exception when others then perform pg_temp.check('nobody can make themself platform admin', true); end $$;
reset role;

-- ===================== Storage =====================
set role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-a000-0000000000aa', false);
do $$ begin
  insert into storage.objects (bucket_id, name) values ('property-images', '00000000-0000-4000-a000-000000000001/p1/front.jpg');
  perform pg_temp.check('agent A can upload to org A folder', true);
exception when others then perform pg_temp.check('agent A can upload to org A folder: ' || sqlerrm, false); end $$;
do $$ begin
  insert into storage.objects (bucket_id, name) values ('property-images', '00000000-0000-4000-a000-000000000002/p1/front.jpg');
  perform pg_temp.check('agent A blocked from org B folder', false);
exception when others then perform pg_temp.check('agent A blocked from org B folder', true); end $$;
do $$ begin
  insert into storage.objects (bucket_id, name) values ('property-images', 'not-a-uuid/front.jpg');
  perform pg_temp.check('upload outside an org folder blocked', false);
exception when others then perform pg_temp.check('upload outside an org folder blocked', true); end $$;
reset role;

rollback;

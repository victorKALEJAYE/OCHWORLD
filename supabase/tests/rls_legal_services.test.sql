-- Legal services catalogue (migration 20261122000009).
-- See supabase/tests/README.md. Runs in a transaction and rolls back.
\set ON_ERROR_STOP 0
begin;

create or replace function pg_temp.check(name text, ok boolean) returns void language plpgsql as
$$ begin raise notice '% %', case when ok then 'PASS' else 'FAIL' end, name; end $$;

insert into auth.users (id, email) values
  ('a0000000-0000-4000-a000-00000000000a', 'agent@example.com'),
  ('d0000000-0000-4000-a000-00000000000d', 'admin@example.com');
insert into public.platform_admins (user_id) values ('d0000000-0000-4000-a000-00000000000d');
create temp table svc as select id, slug from public.legal_services;
grant select on svc to anon, authenticated;

select pg_temp.check('six services are seeded', (select count(*) from svc) = 6);
select pg_temp.check('seeded in the requested order',
  (select array_agg(slug order by position) from public.legal_services) = array[
    'property-due-diligence', 'documentation', 'property-litigation', 'legal-consultation', 'tenancy-matters', 'land-and-title-matters']);

-- Admin hides one and reorders another.
set role authenticated;
select set_config('request.jwt.claim.sub', 'd0000000-0000-4000-a000-00000000000d', false);
update public.legal_services set is_published = false where slug = 'property-litigation';
update public.legal_services set position = 5 where slug = 'tenancy-matters';
select pg_temp.check('platform admin still sees hidden services', (select count(*) from public.legal_services) = 6);
insert into public.legal_services (slug, title, summary, description) values ('valuation', 'Valuation', 'Know what a property is really worth.', 'Test');
select pg_temp.check('platform admin adds a service', exists (select 1 from public.legal_services where slug = 'valuation'));
delete from public.legal_services where slug = 'valuation';
select pg_temp.check('platform admin removes a service', not exists (select 1 from public.legal_services where slug = 'valuation'));
do $$ begin
  insert into public.legal_services (slug, title, summary, description, icon) values ('bad-icon', 'Bad icon', 'An icon the site does not know.', 'x', 'rocket');
  perform pg_temp.check('unknown icons are rejected', false);
exception when check_violation then perform pg_temp.check('unknown icons are rejected', true); end $$;

-- Ordinary users can only read.
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-a000-00000000000a', false);
select pg_temp.check('users see only published services', (select count(*) from public.legal_services) = 5);
with u as (update public.legal_services set title = 'Hacked' returning 1)
select pg_temp.check('users cannot edit services', (select count(*) from u) = 0);
with d as (delete from public.legal_services returning 1)
select pg_temp.check('users cannot delete services', (select count(*) from d) = 0);
do $$ begin
  insert into public.legal_services (slug, title, summary, description) values ('spam', 'Spam service', 'Should not be allowed.', 'x');
  perform pg_temp.check('users cannot add services', false);
exception when insufficient_privilege then perform pg_temp.check('users cannot add services', true); end $$;
reset role;

-- Requests reference a published service.
set role anon;
select set_config('request.jwt.claim.sub', '', false);
select pg_temp.check('guests see the published services', (select count(*) from public.legal_services) = 5);
do $$ begin
  insert into public.legal_requests (service_id, property_details, name, email, phone)
  values ((select id from svc where slug = 'documentation'), 'Plot 5, Katampe', 'Guest', 'guest@example.com', '08030000000');
  perform pg_temp.check('guest requests a published service', true);
exception when others then perform pg_temp.check('guest requests a published service: ' || sqlerrm, false); end $$;
do $$ begin
  insert into public.legal_requests (service_id, property_details, name, email, phone)
  values ((select id from svc where slug = 'property-litigation'), 'Plot 5', 'Guest', 'guest@example.com', '08030000000');
  perform pg_temp.check('hidden services cannot be requested', false);
exception when insufficient_privilege then perform pg_temp.check('hidden services cannot be requested', true); end $$;
do $$ begin
  insert into public.legal_requests (property_details, name, email, phone)
  values ('Plot 5', 'Guest', 'guest@example.com', '08030000000');
  perform pg_temp.check('a request must name a service', false);
exception when insufficient_privilege then perform pg_temp.check('a request must name a service', true); end $$;
reset role;

rollback;

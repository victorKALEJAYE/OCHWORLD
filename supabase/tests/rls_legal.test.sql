-- Property legal service requests (migration 20261121000007).
-- See supabase/tests/README.md. Runs in a transaction and rolls back.
\set ON_ERROR_STOP 0
begin;

create or replace function pg_temp.check(name text, ok boolean) returns void language plpgsql as
$$ begin raise notice '% %', case when ok then 'PASS' else 'FAIL' end, name; end $$;

insert into auth.users (id, email) values
  ('c0000000-0000-4000-a000-00000000000c', 'seeker@example.com'),
  ('c0000000-0000-4000-a000-0000000000cc', 'other@example.com'),
  ('d0000000-0000-4000-a000-00000000000d', 'admin@example.com');
insert into public.platform_admins (user_id) values ('d0000000-0000-4000-a000-00000000000d');
create temp table draft_listing as select id from public.properties where status = 'draft' limit 1;
grant select on draft_listing to anon, authenticated;

-- Guest request about a published listing.
set role anon;
select set_config('request.jwt.claim.sub', '', false);
do $$ begin
  insert into public.legal_requests (service, property_id, name, email, phone, message)
  select 'title_verification', id, 'Guest Buyer', 'guest@example.com', '08030000000', 'Please verify the C of O.'
  from public.properties where status = 'published' limit 1;
  perform pg_temp.check('guest can request title verification', true);
exception when others then perform pg_temp.check('guest can request title verification: ' || sqlerrm, false); end $$;
do $$ begin
  perform count(*) from public.legal_requests;
  perform pg_temp.check('guest cannot read any requests', false);
exception when insufficient_privilege then perform pg_temp.check('guest cannot read any requests', true); end $$;
do $$ begin
  insert into public.legal_requests (service, property_id, name, email, phone)
  values ('title_verification', (select id from draft_listing), 'Guest Buyer', 'guest@example.com', '08030000000');
  perform pg_temp.check('cannot link a draft listing', false);
exception when insufficient_privilege then perform pg_temp.check('cannot link a draft listing', true); end $$;
do $$ begin
  insert into public.legal_requests (service, name, email, phone, status)
  values ('due_diligence', 'Sneaky', 'x@example.com', '0803', 'completed');
  perform pg_temp.check('cannot choose the status', false);
exception when insufficient_privilege then perform pg_temp.check('cannot choose the status', true); end $$;
do $$ begin
  insert into public.legal_requests (service, name, email, phone, requester_id)
  values ('due_diligence', 'Sneaky', 'x@example.com', '0803', 'c0000000-0000-4000-a000-00000000000c');
  perform pg_temp.check('cannot set the requester', false);
exception when insufficient_privilege then perform pg_temp.check('cannot set the requester', true); end $$;
reset role;

-- Signed-in request: requester filled from the session.
set role authenticated;
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-a000-00000000000c', false);
insert into public.legal_requests (service, property_details, name, email, phone)
values ('survey_verification', 'Plot 12, Guzape', 'Seeker', 'seeker@example.com', '08030000000');
select pg_temp.check('signed-in user sees only their own request',
  (select count(*) from public.legal_requests) = 1
  and (select requester_id from public.legal_requests) = 'c0000000-0000-4000-a000-00000000000c');
with u as (update public.legal_requests set status = 'completed' returning 1)
select pg_temp.check('requester cannot change status', (select count(*) from u) = 0);

select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-a000-0000000000cc', false);
select pg_temp.check('another user sees none of them', (select count(*) from public.legal_requests) = 0);

select set_config('request.jwt.claim.sub', 'd0000000-0000-4000-a000-00000000000d', false);
select pg_temp.check('platform admin sees all requests', (select count(*) from public.legal_requests) = 2);
with u as (update public.legal_requests set status = 'in_progress' where service = 'survey_verification' returning 1)
select pg_temp.check('platform admin updates status', (select count(*) from u) = 1);
do $$ begin
  update public.legal_requests set email = 'changed@example.com';
  perform pg_temp.check('nobody edits request details', false);
exception when insufficient_privilege then perform pg_temp.check('nobody edits request details', true); end $$;
reset role;

select pg_temp.check('new requests start as new',
  (select status from public.legal_requests where service = 'title_verification') = 'new');

rollback;

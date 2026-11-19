-- RLS and constraint tests for migration 20261119000002_listings. See supabase/tests/README.md.
-- RLS tests for migration 2. Each block prints PASS/FAIL. Run as superuser; switches roles inside.
\set ON_ERROR_STOP 0
begin;
insert into auth.users (id, email) values
  ('11111111-1111-4111-a111-111111111111', 'a@example.com'),
  ('22222222-2222-4222-a222-222222222222', 'b@example.com');
create or replace function pg_temp.check(name text, ok boolean) returns void language plpgsql as
$$ begin raise notice '% %', case when ok then 'PASS' else 'FAIL' end, name; end $$;

-- ---------- anon ----------
set role anon;
select pg_temp.check('anon sees 8 published listings', (select count(*) from properties) = 8);
select pg_temp.check('anon cannot see draft', not exists (select 1 from properties where status <> 'published'));
select pg_temp.check('district counts total 8', (select sum(listing_count) from district_listing_counts) = 8);
select pg_temp.check('anon sees organizations', (select count(*) from organizations) = 2);
select pg_temp.check('anon sees no enquiries', (select count(*) from enquiries) = 0);
select pg_temp.check('anon sees agency phone via organization_contacts',
  (select c.phone from organization_contacts c join organizations o on o.id = c.id where o.type = 'agency') is not null);
select pg_temp.check('anon gets no landlord phone via organization_contacts',
  (select c.phone from organization_contacts c join organizations o on o.id = c.id where o.type = 'landlord') is null);
reset role;

-- anon enquiry on a published listing, trying to spoof organization + sender
set role anon;
do $$ begin
  insert into enquiries (property_id, organization_id, sender_user_id, name, email, message)
  select p.id, '00000000-0000-4000-a000-000000000001', '22222222-2222-4222-a222-222222222222',
         'Guest', 'guest@example.com', 'Is this still available?'
  from properties p where p.slug = 'test-2-bed-apartment-jabi';
  perform pg_temp.check('anon can enquire on published listing', true);
exception when others then perform pg_temp.check('anon can enquire on published listing: ' || sqlerrm, false); end $$;
reset role;
select pg_temp.check('enquiry org taken from property (spoof ignored)',
  (select e.organization_id = p.organization_id from enquiries e join properties p on p.id = e.property_id limit 1));
select pg_temp.check('enquiry sender forced to null for guest', (select sender_user_id is null from enquiries limit 1));

-- anon enquiry on a draft listing must fail. Drafts are invisible to anon, so the
-- id is captured as superuser into a temp table the test role can read.
create temp table draft as select id from properties where status = 'draft';
grant select on draft to anon, authenticated;
set role anon;
do $$ begin
  insert into enquiries (property_id, name, email, message)
  select id, 'Guest', 'g@example.com', 'Hello there, interested' from draft;
  perform pg_temp.check('anon blocked from enquiring on draft', false);
exception when others then perform pg_temp.check('anon blocked from enquiring on draft', true); end $$;
reset role;

-- anon cannot read contact columns directly
set role anon;
do $$ begin
  perform phone from organizations limit 1;
  perform pg_temp.check('anon blocked from organizations.phone', false);
exception when insufficient_privilege then perform pg_temp.check('anon blocked from organizations.phone', true); end $$;
do $$ begin
  perform email from organizations limit 1;
  perform pg_temp.check('anon blocked from organizations.email', false);
exception when insufficient_privilege then perform pg_temp.check('anon blocked from organizations.email', true); end $$;
reset role;

-- anon cannot write listings or organizations
set role anon;
do $$ begin
  insert into properties (organization_id, district_id, slug, title, listing_type, category, property_type, price)
  values ('00000000-0000-4000-a000-000000000001', 1, 'hack', 'Hacked listing', 'sale', 'residential', 'apartment', 1);
  perform pg_temp.check('anon blocked from creating listing', false);
exception when others then perform pg_temp.check('anon blocked from creating listing', true); end $$;
do $$ declare n int; begin
  update organizations set name = 'Hacked'; get diagnostics n = row_count;
  perform pg_temp.check('anon cannot update organizations', n = 0);
exception when insufficient_privilege then perform pg_temp.check('anon cannot update organizations', true); end $$;
with u as (update properties set price = 1 returning 1) select pg_temp.check('anon cannot update listings', (select count(*) from u) = 0);
with u as (delete from properties returning 1) select pg_temp.check('anon cannot delete listings', (select count(*) from u) = 0);
reset role;

-- ---------- authenticated users ----------
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-a111-111111111111', false);
do $$ begin
  insert into saved_properties (property_id) select id from properties where slug = 'test-2-bed-apartment-jabi';
  perform pg_temp.check('user A can save a published listing', true);
exception when others then perform pg_temp.check('user A can save: ' || sqlerrm, false); end $$;
do $$ begin
  insert into saved_properties (user_id, property_id)
  select '22222222-2222-4222-a222-222222222222', id from properties where slug = 'test-4-bed-terrace-gwarinpa';
  perform pg_temp.check('user A blocked from saving as user B', false);
exception when others then perform pg_temp.check('user A blocked from saving as user B', true); end $$;
do $$ begin
  insert into saved_properties (property_id) select id from draft;
  perform pg_temp.check('user A blocked from saving a draft', false);
exception when others then perform pg_temp.check('user A blocked from saving a draft', true); end $$;
select pg_temp.check('user A sees own save', (select count(*) from saved_properties) = 1);
select pg_temp.check('user A still cannot read enquiries', (select count(*) from enquiries) = 0);

select set_config('request.jwt.claim.sub', '22222222-2222-4222-a222-222222222222', false);
select pg_temp.check('user B cannot see user A saves', (select count(*) from saved_properties) = 0);
with d as (delete from saved_properties returning 1) select pg_temp.check('user B cannot delete user A saves', (select count(*) from d) = 0);
reset role;

-- ---------- constraints ----------
do $$ begin
  insert into properties (organization_id, district_id, slug, title, listing_type, category, property_type, price)
  values ('00000000-0000-4000-a000-000000000001', 1, 'rent-without-period', 'Rent no period', 'rent', 'residential', 'apartment', 100);
  perform pg_temp.check('rent without rent_period rejected', false);
exception when check_violation then perform pg_temp.check('rent without rent_period rejected', true); end $$;
-- Since migration 3 a trigger fills published_at when a listing is published.
insert into properties (organization_id, district_id, slug, title, listing_type, category, property_type, price, status)
values ('00000000-0000-4000-a000-000000000001', 1, 'pub-no-date', 'Published no date', 'sale', 'residential', 'apartment', 100, 'published');
select pg_temp.check('publishing fills published_at automatically',
  (select published_at is not null from properties where slug = 'pub-no-date'));
do $$ begin
  insert into properties (organization_id, district_id, slug, title, listing_type, category, property_type, price)
  values ('00000000-0000-4000-a000-000000000001', 1, 'Bad Slug!', 'Bad slug here', 'sale', 'residential', 'apartment', 100);
  perform pg_temp.check('invalid slug rejected', false);
exception when check_violation then perform pg_temp.check('invalid slug rejected', true); end $$;

rollback;

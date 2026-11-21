-- District ratings (migration 20261121000008).
-- See supabase/tests/README.md. Runs in a transaction and rolls back.
\set ON_ERROR_STOP 0
begin;

create or replace function pg_temp.check(name text, ok boolean) returns void language plpgsql as
$$ begin raise notice '% %', case when ok then 'PASS' else 'FAIL' end, name; end $$;

insert into auth.users (id, email) values
  ('a0000000-0000-4000-a000-00000000000a', 'owner@example.com'),
  ('d0000000-0000-4000-a000-00000000000d', 'admin@example.com');
insert into public.platform_admins (user_id) values ('d0000000-0000-4000-a000-00000000000d');
create temp table maitama as select id from public.districts where slug = 'maitama';
grant select on maitama to anon, authenticated;

set role authenticated;
select set_config('request.jwt.claim.sub', 'd0000000-0000-4000-a000-00000000000d', false);
insert into public.district_ratings (district_id, category, score, note)
values ((select id from maitama), 'security', 5, 'Test note');
select pg_temp.check('platform admin rates a district', (select count(*) from public.district_ratings) = 1);
update public.district_ratings set score = 4 where category = 'security';
select pg_temp.check('platform admin changes a rating', (select score from public.district_ratings where category = 'security') = 4);
do $$ begin
  insert into public.district_ratings (district_id, category, score) values ((select id from maitama), 'traffic_flow', 6);
  perform pg_temp.check('scores above 5 are rejected', false);
exception when check_violation then perform pg_temp.check('scores above 5 are rejected', true); end $$;

select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-a000-00000000000a', false);
do $$ begin
  insert into public.district_ratings (district_id, category, score) values ((select id from maitama), 'electricity', 5);
  perform pg_temp.check('ordinary users cannot add ratings', false);
exception when insufficient_privilege then perform pg_temp.check('ordinary users cannot add ratings', true); end $$;
with u as (update public.district_ratings set score = 1 returning 1)
select pg_temp.check('ordinary users cannot change ratings', (select count(*) from u) = 0);
with d as (delete from public.district_ratings returning 1)
select pg_temp.check('ordinary users cannot delete ratings', (select count(*) from d) = 0);
reset role;

set role anon;
select set_config('request.jwt.claim.sub', '', false);
select pg_temp.check('anyone can read ratings', (select count(*) from public.district_ratings) = 1);
do $$ begin
  insert into public.district_ratings (district_id, category, score) values ((select id from maitama), 'lifestyle', 5);
  perform pg_temp.check('guests cannot add ratings', false);
exception when insufficient_privilege then perform pg_temp.check('guests cannot add ratings', true); end $$;
reset role;

rollback;

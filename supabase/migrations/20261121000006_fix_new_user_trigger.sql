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

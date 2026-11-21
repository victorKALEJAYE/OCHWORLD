-- ============================================================================
-- Property legal services: requests from buyers, renters and sellers
-- ============================================================================
-- Anyone (guest or signed in) can ask for help: title verification, survey
-- checks, agreements, transfers. Requests are private: only the person who
-- sent one (if signed in) and platform admins can read them. Only platform
-- admins change status (Phase 6 admin tools). Safe to run more than once.

do $$ begin
  create type public.legal_service as enum (
    'title_verification',   -- C of O / R of O, AGIS search, encumbrances
    'survey_verification',  -- survey plan, beacons, land use
    'agreement_review',     -- contract of sale, tenancy agreement, offer letter
    'transfer_consent',     -- deed of assignment, Governor's consent, registration
    'due_diligence'         -- full check of a property, developer or agent
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.legal_request_status as enum ('new', 'in_progress', 'completed', 'closed');
exception when duplicate_object then null; end $$;

create table if not exists public.legal_requests (
  id              uuid primary key default gen_random_uuid(),
  service         public.legal_service not null,
  -- Optional link to a listing on OCHWORLD; otherwise described in `property_details`.
  property_id     uuid references public.properties (id) on delete set null,
  property_details text check (char_length(property_details) <= 500),
  name            text not null check (char_length(name) between 2 and 100),
  email           text not null check (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone           text not null check (char_length(phone) <= 20),
  message         text check (char_length(message) <= 2000),
  status          public.legal_request_status not null default 'new',
  -- Set by the trigger from the session, never by the client.
  requester_id    uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists legal_requests_status_idx on public.legal_requests (status, created_at desc);
create index if not exists legal_requests_requester_idx on public.legal_requests (requester_id, created_at desc);

drop trigger if exists legal_requests_set_updated_at on public.legal_requests;
create trigger legal_requests_set_updated_at
  before update on public.legal_requests
  for each row execute function public.set_updated_at();

-- Requester comes from the session; a guest's request has none.
create or replace function public.legal_requests_set_requester()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.requester_id := (select auth.uid());
  new.status := 'new';
  return new;
end;
$$;

drop trigger if exists legal_requests_set_requester on public.legal_requests;
create trigger legal_requests_set_requester
  before insert on public.legal_requests
  for each row execute function public.legal_requests_set_requester();

alter table public.legal_requests enable row level security;

drop policy if exists "Anyone can request legal help" on public.legal_requests;
create policy "Anyone can request legal help"
  on public.legal_requests for insert to anon, authenticated
  with check (
    -- A linked property must be a published listing.
    property_id is null
    or exists (select 1 from public.properties p where p.id = property_id and p.status = 'published')
  );

drop policy if exists "Requesters and platform admins read legal requests" on public.legal_requests;
create policy "Requesters and platform admins read legal requests"
  on public.legal_requests for select to authenticated
  using (requester_id = (select auth.uid()) or public.is_platform_admin());

drop policy if exists "Platform admins update legal requests" on public.legal_requests;
create policy "Platform admins update legal requests"
  on public.legal_requests for update to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

revoke all on public.legal_requests from anon, authenticated;
grant insert (service, property_id, property_details, name, email, phone, message)
  on public.legal_requests to anon, authenticated;
grant select on public.legal_requests to authenticated;
grant update (status) on public.legal_requests to authenticated;
grant all on public.legal_requests to service_role;

-- ============================================================================
-- Legal services catalogue, managed by the OCHWORLD team (platform admins)
-- ============================================================================
-- Each legal service has its own page (/legal-services/<slug>), a card in the
-- homepage carousel, and can be added, edited, hidden or reordered by
-- platform admins without a code change. Requests now point at a service row.
-- Safe to run more than once.

create table if not exists public.legal_services (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  title        text not null check (char_length(title) between 3 and 80),
  -- One of the icon names the site knows (see src/lib/legal/icons.tsx).
  icon         text not null default 'scale'
               check (icon in ('file-search', 'file-text', 'gavel', 'messages', 'key', 'land', 'scale', 'shield', 'building', 'handshake')),
  summary      text not null check (char_length(summary) between 10 and 200),   -- card text
  description  text not null check (char_length(description) <= 2000),          -- page introduction
  covers       text[] not null default '{}',                                   -- "What it covers"
  reasons      text[] not null default '{}',                                   -- "Why you might need it"
  position     integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists legal_services_order_idx on public.legal_services (is_published, position);

drop trigger if exists legal_services_set_updated_at on public.legal_services;
create trigger legal_services_set_updated_at
  before update on public.legal_services
  for each row execute function public.set_updated_at();

alter table public.legal_services enable row level security;

drop policy if exists "Published legal services are public" on public.legal_services;
create policy "Published legal services are public"
  on public.legal_services for select to anon, authenticated
  using (is_published or public.is_platform_admin());

drop policy if exists "Platform admins manage legal services" on public.legal_services;
create policy "Platform admins manage legal services"
  on public.legal_services for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

revoke all on public.legal_services from anon, authenticated;
grant select on public.legal_services to anon, authenticated;
grant insert, update, delete on public.legal_services to authenticated;
grant all on public.legal_services to service_role;

-- Requests point at a catalogue service. The old fixed `service` column stays
-- for requests made before this migration, and becomes optional.
alter table public.legal_requests add column if not exists service_id uuid references public.legal_services (id) on delete set null;
alter table public.legal_requests alter column service drop not null;
create index if not exists legal_requests_service_idx on public.legal_requests (service_id);
grant insert (service_id) on public.legal_requests to anon, authenticated;

drop policy if exists "Anyone can request legal help" on public.legal_requests;
create policy "Anyone can request legal help"
  on public.legal_requests for insert to anon, authenticated
  with check (
    (service_id is not null or service is not null)
    and (service_id is null or exists (select 1 from public.legal_services s where s.id = service_id and s.is_published))
    and (property_id is null or exists (select 1 from public.properties p where p.id = property_id and p.status = 'published'))
  );

-- The first six services. Only inserted if missing, so admins' edits are never overwritten.
insert into public.legal_services (slug, title, icon, summary, description, covers, reasons, position) values
(
  'property-due-diligence', 'Property Due Diligence', 'file-search',
  'Find out everything about a property, its seller and its papers before you commit any money.',
  'Due diligence is the full background check on a property before you buy, lease or invest. A property lawyer confirms who really owns it, that the title documents are genuine, that the land use allows what you plan to do, and that nothing on record (a dispute, a revocation, a mortgage) puts your money at risk.',
  array[
    'Title search at AGIS (Abuja Geographic Information Systems)',
    'Verification of the C of O or R of O and the survey plan',
    'Checks for encumbrances, revocations, disputes and outstanding charges',
    'Confirmation of the approved land use and building approvals',
    'Checks on the seller, agent or developer',
    'A written report of the findings and risks in plain English'
  ],
  array[
    'You are about to pay a deposit or the full price for land or a house',
    'You are buying off-plan from a developer',
    'The seller is in a hurry or the price looks too good to be true',
    'You are buying from abroad and cannot inspect the documents yourself'
  ],
  10
),
(
  'documentation', 'Documentation', 'file-text',
  'Have the right contracts and deeds drafted or reviewed, so every deal is properly written down.',
  'Property deals in Abuja involve several documents, and a badly drafted one can cost you the property. A lawyer drafts or reviews them so your interests are protected and the documents are accepted when you register the transaction.',
  array[
    'Contracts of sale and offer letters',
    'Deeds of assignment, sublease and gift',
    'Powers of attorney',
    'Off-plan and development agreements',
    'Applications for the Minister''s consent and registration at AGIS',
    'Review of documents prepared by the other side'
  ],
  array[
    'You have agreed a price and need the sale written up properly',
    'The seller has given you documents to sign and you want them checked',
    'You need the property transferred into your name after buying',
    'You are entering a joint venture with a developer'
  ],
  20
),
(
  'property-litigation', 'Property Litigation', 'gavel',
  'Get representation when a property dispute ends up in court or needs to be settled.',
  'When negotiation fails, a property lawyer can represent you in court or in mediation. Common cases include ownership disputes, double sales, trespass, breach of a sale or development agreement, and recovery of possession from tenants.',
  array[
    'Ownership and title disputes, including double allocations',
    'Trespass and encroachment on your land',
    'Breach of contract by a seller, buyer or developer',
    'Recovery of premises from tenants',
    'Mediation and settlement before going to court',
    'Representation in the FCT High Court and other courts'
  ],
  array[
    'Someone else claims the land or property you paid for',
    'A developer has not delivered what was agreed',
    'A tenant refuses to leave after proper notice',
    'You have received a court process about a property'
  ],
  30
),
(
  'legal-consultation', 'Legal Consultation', 'messages',
  'Speak with a property lawyer about your situation and understand your options.',
  'Not sure what you need yet? A consultation gives you a property lawyer''s view on your situation: the risks, your rights and the next steps, before you spend money or sign anything.',
  array[
    'A one-to-one consultation, in person, by phone or online',
    'A review of the documents you already have',
    'Explanation of your rights and obligations',
    'Recommended next steps and estimated costs'
  ],
  array[
    'You are new to buying property in Abuja',
    'You have inherited a property and are not sure what to do',
    'You want a second opinion before signing',
    'You are unsure which service you need'
  ],
  40
),
(
  'tenancy-matters', 'Tenancy Matters', 'key',
  'Tenancy agreements, rent disputes and recovering possession, handled properly for landlords and tenants.',
  'Renting in Abuja is governed by the tenancy agreement and the law on recovery of premises. A lawyer helps landlords and tenants put fair agreements in place and resolve disputes the right way.',
  array[
    'Drafting and reviewing tenancy and lease agreements',
    'Rent reviews, renewals and service charge questions',
    'Notices to quit and the correct notice periods',
    'Recovery of premises and rent arrears',
    'Advice for tenants facing eviction or unfair terms'
  ],
  array[
    'You are letting out a property and need a solid agreement',
    'Your landlord wants to raise the rent or end the tenancy',
    'A tenant owes rent or will not leave',
    'You are renting commercial space and want the lease checked'
  ],
  50
),
(
  'land-and-title-matters', 'Land and Title Matters', 'land',
  'Title searches, C of O processing, regularisation and Minister''s consent for land in the FCT.',
  'In the FCT, land is held from the Federal Government and titles are managed by AGIS. A lawyer can check a title, help you get or regularise your papers, and process consent so the land is fully and legally yours.',
  array[
    'Title searches and verification at AGIS',
    'Processing of the Certificate of Occupancy (C of O)',
    'Regularisation and recertification of title documents',
    'Minister''s consent for transfers and mortgages',
    'Change of land use and other title applications'
  ],
  array[
    'You hold an offer letter or R of O and want a C of O',
    'Your documents were issued by an area council and need regularising',
    'You bought land and need the transfer recognised',
    'You want to use land for a different purpose than approved'
  ],
  60
)
on conflict (slug) do nothing;

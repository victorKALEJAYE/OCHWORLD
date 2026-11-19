-- ============================================================================
-- TEST DATA — LOCAL AND STAGING DATABASES ONLY. NEVER RUN ON PRODUCTION.
-- ============================================================================
-- Gives the public pages something to show before agents can add real
-- listings (Phase 5). Every organization and listing here is fictional and
-- marked "(test)". The Supabase CLI runs this file on `supabase db reset`.
--
-- No photos are seeded: cards show the no-photo placeholder until real images
-- are uploaded to the `property-images` bucket.

insert into public.organizations (id, name, slug, type, about, phone, email) values
  ('00000000-0000-4000-a000-000000000001', 'Demo Realty (test)', 'demo-realty-test', 'agency',
   'Fictional agency used for testing.', '+234 800 000 0001', 'agency@example.com'),
  ('00000000-0000-4000-a000-000000000002', 'Sample Landlord (test)', 'sample-landlord-test', 'landlord',
   'Fictional landlord used for testing.', '+234 800 000 0002', 'landlord@example.com');

insert into public.properties
  (organization_id, district_id, slug, title, description, listing_type, category, property_type,
   status, price, rent_period, bedrooms, bathrooms, area_sqm, is_furnished, is_featured, features, published_at)
select
  o.id, d.id, v.slug, v.title, v.description, v.listing_type::public.listing_type,
  v.category::public.property_category, v.property_type::public.property_type,
  v.status::public.listing_status, v.price, v.rent_period::public.rent_period,
  v.bedrooms, v.bathrooms, v.area_sqm, v.is_furnished, v.is_featured, v.features,
  case when v.status = 'published' then now() - (v.age_days || ' days')::interval end
from (values
  ('demo-realty-test', 'maitama', 'test-5-bed-detached-duplex-maitama', '5-bedroom detached duplex (test)',
   'Test listing. Detached duplex with staff quarters on a quiet close.', 'sale', 'residential', 'duplex',
   'published', 450000000, null, 5, 6, 620, false, true, array['Staff quarters', 'Generator', 'Parking for 4'], 2),
  ('demo-realty-test', 'wuse-ii', 'test-3-bed-serviced-apartment-wuse-ii', '3-bedroom serviced apartment (test)',
   'Test listing. Serviced apartment with 24-hour power and security.', 'rent', 'residential', 'apartment',
   'published', 9500000, 'year', 3, 3, 180, true, true, array['24-hour power', 'Gym', 'Lift'], 4),
  ('demo-realty-test', 'central-business-district', 'test-open-plan-office-cbd', 'Open-plan office floor (test)',
   'Test listing. Full office floor with meeting rooms.', 'rent', 'commercial', 'office',
   'published', 32000000, 'year', null, 2, 450, false, true, array['Lift', 'Backup power'], 6),
  ('sample-landlord-test', 'gwarinpa', 'test-4-bed-terrace-gwarinpa', '4-bedroom terrace (test)',
   'Test listing. Terraced duplex in a gated estate.', 'sale', 'residential', 'terrace',
   'published', 120000000, null, 4, 5, 300, false, false, array['Gated estate', 'BQ'], 8),
  ('sample-landlord-test', 'jabi', 'test-2-bed-apartment-jabi', '2-bedroom apartment (test)',
   'Test listing. Apartment close to Jabi Lake.', 'rent', 'residential', 'apartment',
   'published', 4500000, 'year', 2, 2, 110, false, false, array['Pool'], 10),
  ('demo-realty-test', 'guzape', 'test-land-plot-guzape', '1,200 m² residential plot (test)',
   'Test listing. Dry, accessible plot with C of O.', 'sale', 'land', 'land',
   'published', 250000000, null, null, null, 1200, false, false, array['C of O'], 12),
  ('demo-realty-test', 'asokoro', 'test-6-bed-mansion-asokoro', '6-bedroom detached house (test)',
   'Test listing. Detached house with pool.', 'sale', 'residential', 'detached_house',
   'published', 1200000000, null, 6, 7, 900, false, true, array['Pool', 'Cinema room'], 14),
  ('sample-landlord-test', 'utako', 'test-shop-utako', 'Ground-floor shop (test)',
   'Test listing. Shop on a busy road.', 'rent', 'commercial', 'shop',
   'published', 6000000, 'year', null, 1, 60, false, false, array[]::text[], 16),
  ('sample-landlord-test', 'lugbe', 'test-3-bed-bungalow-lugbe-draft', '3-bedroom bungalow (test, draft)',
   'Test draft. Must NOT appear on public pages.', 'sale', 'residential', 'bungalow',
   'draft', 45000000, null, 3, 3, 200, false, false, array[]::text[], 0)
) as v(org_slug, district_slug, slug, title, description, listing_type, category, property_type,
       status, price, rent_period, bedrooms, bathrooms, area_sqm, is_furnished, is_featured, features, age_days)
join public.organizations o on o.slug = v.org_slug
join public.districts d on d.slug = v.district_slug;

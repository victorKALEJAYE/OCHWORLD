-- ============================================================================
-- OCHWORLD SAMPLE LISTINGS: 10 demonstration properties
-- ============================================================================
-- For showing the site before agents add real listings. Everything here belongs
-- to one organization, "OCHWORLD Sample Listings", and every description says
-- it is a sample, so visitors aren't misled.
--
-- Remove ALL of them (and the organization) before launch with:
--   delete from public.organizations where slug = 'ochworld-sample-listings';
--
-- Safe to run more than once: it skips anything that already exists.

insert into public.organizations (id, name, slug, type, about, phone)
values ('00000000-0000-4000-a000-0000000000a1', 'OCHWORLD Sample Listings', 'ochworld-sample-listings', 'agency',
        'Demonstration listings used while OCHWORLD is being set up. Not real properties.', null)
on conflict (slug) do nothing;

insert into public.properties
  (organization_id, district_id, slug, title, description, listing_type, category, property_type,
   status, price, rent_period, address, bedrooms, bathrooms, area_sqm, is_furnished, is_featured, features, published_at)
select
  '00000000-0000-4000-a000-0000000000a1', d.id, v.slug, v.title,
  v.description || E'\n\nSample listing for demonstration only.',
  v.listing_type::public.listing_type, v.category::public.property_category, v.property_type::public.property_type,
  'published', v.price, v.rent_period::public.rent_period, v.address,
  v.bedrooms, v.bathrooms, v.area_sqm, v.is_furnished, v.is_featured, v.features,
  now() - (v.age_days || ' days')::interval
from (values
  ('maitama', 'sample-5-bed-detached-duplex-maitama', '5-bedroom detached duplex with pool',
   'Detached duplex on a quiet close with a swimming pool, a fitted kitchen and a two-room boys'' quarters.',
   'sale', 'residential', 'duplex', 650000000, null, 'Off Aso Drive', 5, 6, 750, false, true,
   array['Swimming pool', 'Boys'' quarters', 'Generator', 'Parking for 4'], 1),
  ('asokoro', 'sample-6-bed-mansion-asokoro', '6-bedroom mansion with cinema room',
   'Large family home with a cinema room, a gym, staff quarters and a landscaped garden.',
   'sale', 'residential', 'detached_house', 1500000000, null, 'Asokoro Extension', 6, 7, 1100, false, true,
   array['Cinema room', 'Gym', 'Staff quarters', 'CCTV'], 2),
  ('wuse-ii', 'sample-3-bed-serviced-apartment-wuse-ii', '3-bedroom serviced apartment',
   'Fully serviced apartment with 24-hour power, water, security and a lift.',
   'rent', 'residential', 'apartment', 10000000, 'year', 'Off Aminu Kano Crescent', 3, 3, 180, true, true,
   array['24-hour power', 'Lift', 'Gym', 'Furnished'], 3),
  ('jabi', 'sample-2-bed-apartment-jabi', '2-bedroom apartment near Jabi Lake',
   'Bright apartment a short walk from Jabi Lake Mall, in a gated estate.',
   'rent', 'residential', 'apartment', 4500000, 'year', 'Jabi Lake area', 2, 2, 110, false, false,
   array['Gated estate', 'Swimming pool', 'Parking'], 4),
  ('gwarinpa', 'sample-4-bed-terrace-gwarinpa', '4-bedroom terrace duplex',
   'Terraced duplex in a gated estate with a boys'' quarters and good road access.',
   'sale', 'residential', 'terrace', 130000000, null, '6th Avenue', 4, 5, 300, false, false,
   array['Gated estate', 'Boys'' quarters', 'Prepaid meter'], 5),
  ('katampe', 'sample-4-bed-semi-detached-katampe', '4-bedroom semi-detached duplex',
   'New semi-detached duplex with city views, smart lighting and a fitted kitchen.',
   'sale', 'residential', 'semi_detached_house', 220000000, null, 'Katampe Extension', 4, 5, 350, false, true,
   array['City views', 'Smart home', 'Fitted kitchen'], 6),
  ('central-business-district', 'sample-office-floor-cbd', 'Open-plan office floor',
   'Full office floor with meeting rooms, lifts and backup power in the Central Business District.',
   'rent', 'commercial', 'office', 35000000, 'year', 'Central Business District', null, 4, 500, false, false,
   array['Lift', 'Backup power', 'Parking', 'Meeting rooms'], 7),
  ('utako', 'sample-shop-utako', 'Ground-floor shop on a busy road',
   'Shop space with frontage on a busy road, suitable for retail or a pharmacy.',
   'rent', 'commercial', 'shop', 6000000, 'year', 'Utako District', null, 1, 60, false, false,
   array['Road frontage', 'Prepaid meter'], 8),
  ('guzape', 'sample-land-plot-guzape', '1,200 m² residential plot',
   'Dry, accessible residential plot with a Certificate of Occupancy.',
   'sale', 'land', 'land', 280000000, null, 'Guzape District', null, null, 1200, false, false,
   array['C of O', 'Fenced', 'Road access'], 9),
  ('lokogoma', 'sample-3-bed-bungalow-lokogoma', '3-bedroom bungalow',
   'Detached bungalow with a large compound, a borehole and a fenced yard.',
   'rent', 'residential', 'bungalow', 3000000, 'year', 'Lokogoma', 3, 3, 220, false, false,
   array['Borehole', 'Fenced compound', 'Parking'], 10)
) as v(district_slug, slug, title, description, listing_type, category, property_type, price, rent_period,
       address, bedrooms, bathrooms, area_sqm, is_furnished, is_featured, features, age_days)
join public.districts d on d.slug = v.district_slug
on conflict (slug) do nothing;

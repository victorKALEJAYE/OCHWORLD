-- ============================================================================
-- Legal services: a picture for each service
-- ============================================================================
-- Optional image URL (Supabase Storage, uploaded by platform admins later).
-- When empty, the site uses the default photo bundled with the site
-- (public/images/legal/<slug>.jpg). Safe to run more than once.

alter table public.legal_services add column if not exists image_url text;

do $$ begin
  alter table public.legal_services add constraint legal_services_image_url_check
    check (image_url is null or (image_url ~ '^https://' and char_length(image_url) <= 500));
exception when duplicate_object then null; end $$;

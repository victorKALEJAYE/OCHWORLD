# OCHWORLD roadmap and progress

The agreed 12-phase plan, with what is built and what remains. Each phase is
inspected, planned, built, tested and documented, then presented for review
before the next one starts. Update this file at the end of every phase.

Legend: ✅ done · 🟡 partly done · ⬜ not started · ▶ current

| # | Phase | Status |
|---|---|---|
| 1 | Audit | ✅ |
| 2 | Design system | ✅ |
| 3 | Public marketplace | ✅ |
| 4 | Authentication, roles and tenancy | ✅ |
| 5 | Branded loading experience and design consistency | ✅ awaiting review |
| 6 | Agent and landlord property management | ▶ next (🟡 partly done) |
| 7 | Property discovery and listing lifecycle | 🟡 |
| 8 | Interactive Abuja map and geospatial search | ⬜ |
| 9 | Area intelligence and neighbourhood ratings | 🟡 |
| 10 | Customer engagement, trust, verification and agent tools | 🟡 |
| 11 | Super Admin, tenant management and monetisation | ⬜ |
| 12 | Integration, testing, security and optimisation | 🟡 |

Work done between phases (legal services, Explore Abuja, CI) is listed under
the phase it belongs to.

---

## 5. Branded loading experience and design consistency ✅ (awaiting review)

Done
- Logo loader with gold ring and OCHWORLD wordmark; first-visit loader (once per session); page loader; skeletons for listings.
- One light theme across the site, sign-in pages and dashboard; dark only for photo heroes.
- Signed-in header with initials avatar and account menu on every page.
- Zillow-style homepage hero (photo or video, bold headline, single search box).

Completed in Phase 5 (22 Nov 2026)
- One headline style everywhere: `DisplayHeading` is now the bold homepage style (Explore Abuja, Legal services, sign-in panel, homepage).
- Header moved into the shared `(site)` layout: it stays on screen while pages load; content-area loader (`app/(site)/loading.tsx`) instead of a full-screen flash; dashboard skeleton (`app/dashboard/loading.tsx`).
- 404 and error pages now have a header and two ways forward (browse / homepage).
- Design-system page and `docs/design-system.md` updated: page colour plan, headline, signed-in header and account menu, legal service cards, location rating, carousel, loading rules.
- Legal services carousel on the homepage (see Phase 10) follows the same card style.

## 6. Agent and landlord property management 🟡

Done
- Listings: create, edit, draft/publish/unpublish/archive, delete (owners/admins).
- Photos: browser resize, upload to Storage, cover photo, delete.
- Enquiry inbox with status; team invitations by link; roles; leave/remove.

Remaining
- Listing performance (views, enquiries per listing).
- Drag-to-reorder photos; bulk actions; duplicate listing.
- Agent/agency public profile page with their listings.

## 7. Property discovery and listing lifecycle 🟡

Done
- Search with filters, keyword search, sorting, pagination, shareable URLs.
- Property detail, similar listings, favourites, enquiries.

Remaining
- Saved searches with alerts (email / WhatsApp).
- Compare properties; recently viewed; share buttons.
- Lifecycle: sold/let status, listing expiry and renewal reminders, stale-listing clean-up.

## 8. Interactive Abuja map and geospatial search ⬜

Remaining
- Coordinates on listings (map pin when creating a listing).
- Map view of search results with clustering; search this area; draw-an-area.
- District boundaries on the map.

## 9. Area intelligence and neighbourhood ratings 🟡

Done
- Explore Abuja: Master Plan guide, attractions, 25 district pages with map and description.
- Location rating by the OCHWORLD team (7 categories, admin editor, public read).

Remaining
- Amenities per district (schools, hospitals, markets, transport) from a real data source.
- Real district photos; ratings filled in by the team.
- Compare districts; ratings shown on search results and listing pages.

## 10. Customer engagement, trust, verification and agent tools 🟡

Done
- Property legal services: catalogue (6 services, admin-managed), dedicated page per service, homepage carousel, requests with tracking.

Remaining
- Verified agent/agency badges (ID and CAC checks).
- Book a viewing; WhatsApp contact; reviews of agents.
- Notifications (new enquiry, request updates) by email/WhatsApp.

## 11. Super Admin, tenant management and monetisation ⬜

Remaining
- Admin dashboard: organizations, users, listings moderation, featured listings.
- Manage legal services (add, edit, hide, reorder) and legal requests.
- Manage district ratings and content.
- Plans and payments (e.g. featured listings, agency subscriptions) with Paystack.

## 12. Integration, testing, security and optimisation 🟡

Done
- CI: typecheck, unit tests, build, database rebuilt from migrations with 140 security checks; migrations applied only after checks pass.
- Staging/production separation in the pipeline and admin scripts.

Remaining
- Finish staging setup (Supabase project, GitHub environment, Vercel preview env).
- ESLint + Prettier; browser end-to-end tests (needs package installs).
- Rate limiting on enquiries and legal requests; script CSP with nonces.
- Generated database types; performance and accessibility audits.

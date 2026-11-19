# OCHWORLD design system

The live reference is the **`/design-system`** page (run `npm run dev` and open
http://localhost:3000/design-system). It is hidden in production unless
`NEXT_PUBLIC_SHOW_DESIGN_SYSTEM=true`.

## 1. Brand colours

| Token | Value | Source |
|---|---|---|
| `brand-gold` / `primary` | `#C38C25` (HSL 39 68% 45%) | Measured from the original logo (gold mark on black, median of the gold pixels). |
| `brand-black` | `#000000` | Background of the original logo. |

Rules:

- **No other golds.** Lighter or softer gold is made with opacity (`bg-primary/10`, `border-primary/15`), never a new hex value.
- **No gradients** on surfaces, text or buttons. The logo itself is a flat colour.
- `public/ochworld-mark.png` and `public/ochworld-logo.png` were recoloured to exactly `#C38C25` (the shapes are unchanged). Replace them with the designer's SVG when available.
- The measurement came from a compressed JPG. If the designer supplies an official hex value, change it in **two places**: `tailwind.config.ts` (`brand.gold`) and `globals.css` (`--primary`, `--ring`).

### Contrast (WCAG AA needs 4.5:1 for text)

| Pair | Ratio | Allowed use |
|---|---|---|
| Gold on black | 7.1:1 | Text, links, icons |
| Black on gold | 7.1:1 | Primary button label |
| Gold on white | 3.0:1 | Fills, icons, underlines, logo. **Not body text or links.** |

That is why `.link` renders as foreground text with a gold underline on light
pages, and as gold text on dark pages.

## 2. Themes and the "one dominant colour" rule

Light (white) is the default. Add the `dark` class to any wrapper to switch that
subtree to the black theme; components don't need to know which theme they are in.

| Page | Dominant | Gold used for |
|---|---|---|
| Homepage | Black hero, white sections below | Search button, "Featured" badges |
| Search & listings | White | Active filters, primary action |
| Property detail | White | Enquire button |
| Explore Abuja / areas | White | Rating bars |
| Sign in & sign up | Black | Logo, main button, links |
| Agent & landlord dashboards | White on light-grey canvas | Primary actions, active nav item |
| Super admin | White on light-grey canvas | Primary actions only |

Neutrals are pure greys (`background`, `surface`, `muted`, `border`,
`muted-foreground`, `foreground`). Status colours are limited to `destructive`
and `success`.

## 3. Typography

- **Montserrat** (600–800) for headings and prices: geometric, closest to the logo lettering.
- **Inter** for everything else.
- **Display headline** (`DisplayHeading`): Montserrat Light, first line uppercase, second line italic, gold full stop only. Used for the homepage hero and the auth panel, e.g. "FIND YOUR PLACE / *in Abuja.*". Don't use it more than once per page.
- Scale: display 44–96px, H1 36px, H2 24px, H3 18px, body 16px, small 14px, eyebrow 12px uppercase.

## 4. Shape, spacing, elevation

- Radius: `--radius` 10px (cards `rounded-lg`), controls 8px (`rounded-md`), badges 6px (`rounded-sm`).
- Spacing: Tailwind's 4px scale. Page gutters 16px (mobile) / 24px; content max width 1200px (`max-w-content`).
- Shadows: only `shadow-card` (resting cards) and `shadow-elevated` (menus, popovers).

## 5. Components

| Component | File | Notes |
|---|---|---|
| Button | `components/ui/button.tsx` | `primary` (gold, one per view), `secondary`, `outline`, `ghost`, `destructive`, `link` |
| Input, Select | `components/ui/input.tsx`, `select.tsx` | Select is a styled native `<select>` (accessible, works without JS, uses the phone's picker) |
| Checkbox, Label, Separator | `components/ui/*` | Radix primitives |
| Badge | `components/ui/badge.tsx` | `solid` for listing type, `gold` for Featured |
| Card | `components/ui/card.tsx` | `CardTitle` is `h3` by default; pass `as="h1"` for page-level cards |
| Site header | `components/layout/site-header.tsx` | `tone="light" \| "dark"`, mobile menu in `mobile-nav.tsx` |
| Property card | `components/property/property-card.tsx` | Takes a `PropertyCardData` view-model; save button passed in as a slot |
| Skeletons | `components/ui/skeleton.tsx`, `property/property-card-skeleton.tsx` | Same footprint as the real card |
| Empty / error states | `components/feedback/*` | Always offer a next step |

## 6. Loading strategy

| Situation | What to show |
|---|---|
| Initial app load and page navigation | `BrandLoader`: the logo with a thin gold arc turning around it (`app/loading.tsx`). No text, no full-screen takeover beyond the page area. |
| Data loading inside a page (lists, cards) | Skeletons with the same layout as the content (`PropertyGridSkeleton`). |
| A button's action in progress | Spinner inside the button and the button disabled. No overlays. |
| Nothing to show | `EmptyState` with a way forward. |
| Failure | `ErrorState` with "Try again"; `app/error.tsx` catches unexpected errors. |

The previous splash screen, Dynamic-Island loader and animated wordmark were
removed in Phase 2 at the client's request.

/**
 * Site-wide settings in one place, so copy and navigation aren't hard-coded
 * across components.
 */
export const siteConfig = {
  name: "OCHWORLD",
  tagline: "Live Abuja",
  description: "Find homes and commercial spaces for sale and rent across Abuja.",
  locale: "en-NG",
  currency: "NGN",
} as const;

export type NavItem = { label: string; href: string };

/**
 * Public navigation. Routes are built in Phase 3 (property discovery);
 * until then the header is only shown on the design-system review page.
 */
export const mainNav: NavItem[] = [
  { label: "Buy", href: "/properties?listing=sale" },
  { label: "Rent", href: "/properties?listing=rent" },
  { label: "Commercial", href: "/properties?category=commercial" },
  { label: "Explore Abuja", href: "/areas" },
  { label: "Agents", href: "/agents" },
];

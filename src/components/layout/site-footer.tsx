import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Homes to buy", href: "/properties?listing=sale&category=residential" },
      { label: "Homes to rent", href: "/properties?listing=rent&category=residential" },
      { label: "Commercial", href: "/properties?category=commercial" },
      { label: "Land", href: "/properties?category=land" },
      { label: "Explore Abuja", href: "/areas" },
    ],
  },
  {
    title: "For professionals",
    links: [
      { label: "List a property", href: "/list-property" },
      { label: "Agents and landlords", href: "/agents" },
      { label: "Sign in", href: "/sign-in" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-surface pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-content grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-[2fr_1fr_1fr] md:gap-10">
        <div className="col-span-2 space-y-3 md:col-span-1">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">{siteConfig.description}</p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-semibold">{col.title}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-content px-4 py-5 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} {siteConfig.name} · Federal Capital Territory, Nigeria
        </p>
      </div>
    </footer>
  );
}

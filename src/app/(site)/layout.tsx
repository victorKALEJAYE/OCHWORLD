import { SiteFooter } from "@/components/layout/site-footer";

/**
 * Public marketplace pages. Each page renders its own <SiteHeader> because the
 * header's tone follows the page's dominant colour (black homepage, white
 * listings).
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}

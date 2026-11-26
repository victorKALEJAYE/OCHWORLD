import Link from "next/link";
import { BrandPanel } from "@/components/auth/brand-panel";
import { Logo } from "@/components/brand/logo";

/**
 * Sign-in, sign-up, onboarding and invitation pages. Same look as the rest of
 * the site: white header, light page, white form card, teal for the main
 * button. On large screens a dark photo panel echoes the homepage hero.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface text-foreground">
      <header className="border-b bg-background pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <Link href="/properties" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Browse properties
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-content flex-1 lg:grid-cols-2 lg:gap-10 lg:px-6 lg:py-10">
        <BrandPanel />
        <main className="flex flex-col items-center justify-start px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-8 sm:px-6 lg:justify-center lg:px-0 lg:py-0">
          <div className="w-full max-w-[460px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

import { BrandPanel } from "@/components/auth/brand-panel";
import { Logo } from "@/components/brand/logo";

/**
 * Auth pages: black is the dominant colour, gold only for the logo, the main
 * button and links.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark min-h-dvh bg-background text-foreground">
      <div className="mx-auto grid min-h-dvh max-w-7xl lg:grid-cols-2">
        <BrandPanel />
        <main className="flex flex-col items-center justify-center px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,calc(env(safe-area-inset-top)+1rem))] sm:px-8">
          <Logo className="mb-10 lg:hidden" />
          <div className="w-full max-w-[460px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

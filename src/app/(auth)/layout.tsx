import { AuthBackground } from "@/components/auth/auth-background";
import { BrandPanel } from "@/components/auth/brand-panel";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <AuthBackground />
      <div className="mx-auto grid min-h-dvh max-w-7xl lg:grid-cols-[1.05fr_1fr]">
        <BrandPanel />
        <main className="flex flex-col items-center justify-center px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,calc(env(safe-area-inset-top)+1rem))] sm:px-8">
          <Logo className="mb-8 lg:hidden" />
          <div className="w-full max-w-[460px] animate-in fade-in slide-in-from-bottom-4 duration-500">{children}</div>
        </main>
      </div>
    </div>
  );
}

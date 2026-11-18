import { AuthBackground } from "@/components/auth/auth-background";
import { BrandLoader, LoaderBar } from "@/components/brand/loader";

/** Full-page loader shown between pages (e.g. after signing in, before the dashboard appears). */
export default function Loading() {
  return (
    <div className="relative grid min-h-dvh place-items-center">
      <AuthBackground />
      <div className="flex flex-col items-center gap-6">
        <BrandLoader label="Loading OCHWORLD" size="lg" />
        <LoaderBar />
      </div>
    </div>
  );
}

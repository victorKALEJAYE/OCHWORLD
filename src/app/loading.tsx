import { AuthBackground } from "@/components/auth/auth-background";
import { AnimatedWordmark, LoaderBar } from "@/components/brand/loader";

/** Full-page loader shown between pages (e.g. after signing in, before the dashboard appears). */
export default function Loading() {
  return (
    <div className="relative grid min-h-dvh place-items-center px-6" role="status" aria-label="Loading">
      <AuthBackground />
      <div className="flex flex-col items-center gap-7">
        <AnimatedWordmark stagger={90} />
        <LoaderBar />
      </div>
    </div>
  );
}

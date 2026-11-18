import { BrandLoader } from "@/components/brand/loader";

/** Shown inside the auth layout while a page (sign-in, sign-up…) loads. */
export default function AuthLoading() {
  return (
    <div className="glass glass-glow grid min-h-[420px] place-items-center rounded-3xl">
      <BrandLoader label="Loading" />
    </div>
  );
}

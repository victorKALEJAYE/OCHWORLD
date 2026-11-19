import { PageLoader } from "@/components/brand/brand-loader";

/** Page-navigation loader. Initial load and route changes share the same minimal loader. */
export default function Loading() {
  return <PageLoader className="min-h-dvh" />;
}

import { PageLoader } from "@/components/brand/brand-loader";

/** Shown in place of a public page's content while it loads; header and footer stay. */
export default function SiteLoading() {
  return <PageLoader className="min-h-[60vh]" />;
}

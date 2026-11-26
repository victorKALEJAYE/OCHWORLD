import { cn } from "@/lib/utils";

type DisplayHeadingProps = {
  /** First line. */
  lead: string;
  /** Second line. A trailing full stop is drawn in the brand teal. */
  accent: string;
  as?: "h1" | "h2";
  size?: "lg" | "xl";
  className?: string;
};

const sizes = {
  lg: "text-[2.25rem] sm:text-5xl lg:text-6xl",
  xl: "text-[2.75rem] sm:text-7xl",
};

/**
 * The one headline style for every hero and page intro (homepage, Explore
 * Abuja, Legal services, sign-in panel):
 *
 *   Buy. Rent. Invest.
 *   In Abuja.
 *
 * Montserrat ExtraBold, tight leading, in the surrounding text colour, so it
 * works on white pages and photo heroes alike. Gold appears only on the final
 * full stop: one colour, one accent.
 */
export function DisplayHeading({ lead, accent, as: Tag = "h1", size = "lg", className }: DisplayHeadingProps) {
  const endsWithStop = accent.endsWith(".");
  const accentText = endsWithStop ? accent.slice(0, -1) : accent;

  return (
    <Tag className={cn("font-display font-extrabold leading-[1.02] tracking-tight", sizes[size], className)}>
      <span className="block">{lead}</span>
      <span className="block">
        {accentText}
        {endsWithStop && <span className="text-primary">.</span>}
      </span>
    </Tag>
  );
}

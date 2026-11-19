import { cn } from "@/lib/utils";

type DisplayHeadingProps = {
  /** First line, set in light uppercase. */
  lead: string;
  /** Second line, set in light italic. A trailing full stop is drawn in gold. */
  accent: string;
  as?: "h1" | "h2";
  size?: "lg" | "xl";
  className?: string;
};

const sizes = {
  lg: "text-[2.5rem] sm:text-5xl 2xl:text-6xl",
  xl: "text-[2.35rem] min-[400px]:text-[2.6rem] sm:text-7xl lg:text-8xl",
};

/**
 * The brand's editorial headline style (hero and auth panel):
 *
 *   FIND YOUR PLACE
 *   in Abuja.
 *
 * Montserrat Light keeps it in the same family as the logo, while the
 * uppercase / italic contrast gives it character. Gold appears only on the
 * full stop, so the headline stays one colour with a single accent.
 */
export function DisplayHeading({ lead, accent, as: Tag = "h1", size = "lg", className }: DisplayHeadingProps) {
  const endsWithStop = accent.endsWith(".");
  const accentText = endsWithStop ? accent.slice(0, -1) : accent;

  return (
    <Tag className={cn("font-display font-light leading-[0.95] tracking-[-0.03em]", sizes[size], className)}>
      <span className="block whitespace-nowrap uppercase">{lead}</span>
      <span className="mt-1 block italic">
        {accentText}
        {endsWithStop && <span className="text-primary not-italic">.</span>}
      </span>
    </Tag>
  );
}

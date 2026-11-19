import { siteConfig } from "@/config/site";
import type { RentPeriod } from "@/lib/properties/types";

const nairaFormatter = new Intl.NumberFormat(siteConfig.locale, {
  style: "currency",
  currency: siteConfig.currency,
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** ₦150,000,000 */
export function formatNaira(amount: number) {
  return nairaFormatter.format(amount);
}

/** ₦150M — for tight spaces such as map pins and chips. */
export function formatNairaCompact(amount: number) {
  return `₦${compactFormatter.format(amount)}`;
}

/** "₦4,500,000 / year" for rentals, "₦150,000,000" for sales. */
export function formatPrice(amount: number, rentPeriod?: RentPeriod) {
  return rentPeriod ? `${formatNaira(amount)} / ${rentPeriod}` : formatNaira(amount);
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "Listed today", "Listed 3 days ago", "Listed 2 months ago". */
export function formatListedDate(iso: string, now = new Date()) {
  const days = Math.round((now.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "Listed today";
  if (days < 30) return `Listed ${relative.format(-days, "day")}`;
  if (days < 365) return `Listed ${relative.format(-Math.round(days / 30), "month")}`;
  return `Listed ${relative.format(-Math.round(days / 365), "year")}`;
}

/** "1 property" / "24 properties". */
export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count.toLocaleString()} ${count === 1 ? singular : plural}`;
}

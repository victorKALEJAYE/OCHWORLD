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

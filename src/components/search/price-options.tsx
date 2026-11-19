import { RENT_PRICE_STEPS, SALE_PRICE_STEPS } from "@/lib/properties/constants";
import { formatNairaCompact } from "@/lib/format";

/**
 * <option>s for a price select. Sale and rent ranges differ by ~100x, and a
 * plain HTML form can't swap options when Buy/Rent changes, so both ranges are
 * offered in labelled groups.
 */
export function PriceOptions({ anyLabel = "Any price" }: { anyLabel?: string }) {
  return (
    <>
      <option value="">{anyLabel}</option>
      <optgroup label="To buy">
        {SALE_PRICE_STEPS.map((v) => (
          <option key={`s${v}`} value={v}>
            {formatNairaCompact(v)}
          </option>
        ))}
      </optgroup>
      <optgroup label="To rent (per year)">
        {RENT_PRICE_STEPS.map((v) => (
          <option key={`r${v}`} value={v}>
            {formatNairaCompact(v)} / yr
          </option>
        ))}
      </optgroup>
    </>
  );
}

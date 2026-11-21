import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatListedDate, formatNaira, formatPrice, pluralize } from "@/lib/format";

describe("formatting", () => {
  it("formats naira without decimals", () => {
    assert.match(formatNaira(150_000_000), /^₦150,000,000$/);
  });

  it("adds the rent period for rentals only", () => {
    assert.match(formatPrice(4_500_000, "year"), /^₦4,500,000 \/ year$/);
    assert.match(formatPrice(650_000_000), /^₦650,000,000$/);
  });

  it("describes listing age", () => {
    const now = new Date("2026-11-20T12:00:00Z");
    assert.equal(formatListedDate("2026-11-20T08:00:00Z", now), "Listed today");
    assert.equal(formatListedDate("2026-11-17T12:00:00Z", now), "Listed 3 days ago");
    assert.equal(formatListedDate("2026-08-20T12:00:00Z", now), "Listed 3 months ago");
  });

  it("pluralizes", () => {
    assert.equal(pluralize(1, "listing"), "1 listing");
    assert.equal(pluralize(3, "listing"), "3 listings");
  });
});

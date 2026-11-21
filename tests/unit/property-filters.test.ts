import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hasActiveFilters, parsePropertyFilters, propertiesHref } from "@/lib/properties/filters";

describe("parsePropertyFilters", () => {
  it("defaults to newest, page 1, no filters", () => {
    const f = parsePropertyFilters({});
    assert.equal(f.sort, "newest");
    assert.equal(f.page, 1);
    assert.equal(hasActiveFilters(f), false);
  });

  it("reads valid values from the URL", () => {
    const f = parsePropertyFilters({ listing: "rent", district: "wuse-ii", beds: "3", minPrice: "1000000", page: "2" });
    assert.equal(f.listing, "rent");
    assert.equal(f.district, "wuse-ii");
    assert.equal(f.beds, 3);
    assert.equal(f.minPrice, 1_000_000);
    assert.equal(f.page, 2);
    assert.equal(hasActiveFilters(f), true);
  });

  it("drops invalid values instead of failing the page", () => {
    const f = parsePropertyFilters({ listing: "lease", type: "castle", district: "Maitama; drop table", beds: "99", page: "-1", sort: "random" });
    assert.equal(f.listing, undefined);
    assert.equal(f.type, undefined);
    assert.equal(f.district, undefined);
    assert.equal(f.beds, undefined);
    assert.equal(f.page, 1);
    assert.equal(f.sort, "newest");
  });

  it("uses the first value when a parameter repeats", () => {
    assert.equal(parsePropertyFilters({ listing: ["sale", "rent"] }).listing, "sale");
  });

  it("swaps a reversed price range", () => {
    const f = parsePropertyFilters({ minPrice: "500000000", maxPrice: "100000000" });
    assert.equal(f.minPrice, 100_000_000);
    assert.equal(f.maxPrice, 500_000_000);
  });
});

describe("propertiesHref", () => {
  it("leaves out defaults so URLs stay short", () => {
    assert.equal(propertiesHref({ sort: "newest", page: 1 }), "/properties");
  });

  it("round-trips through the parser", () => {
    const href = propertiesHref({ listing: "sale", district: "maitama", beds: 4, sort: "price_asc", page: 3 });
    const params = Object.fromEntries(new URL(href, "https://x.test").searchParams);
    const f = parsePropertyFilters(params);
    assert.deepEqual(
      { listing: f.listing, district: f.district, beds: f.beds, sort: f.sort, page: f.page },
      { listing: "sale", district: "maitama", beds: 4, sort: "price_asc", page: 3 }
    );
  });
});

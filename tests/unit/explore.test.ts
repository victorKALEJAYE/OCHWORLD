import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RATING_CATEGORIES, overallScore } from "@/lib/explore/constants";
import { DISTRICT_PROFILES } from "@/content/explore/districts";
import { ATTRACTIONS } from "@/content/explore/attractions";
import { MASTER_PLAN_SECTIONS } from "@/content/explore/master-plan";

describe("overallScore", () => {
  it("is null until something is rated", () => {
    assert.equal(overallScore({}), null);
  });
  it("averages the rated categories to one decimal", () => {
    assert.equal(overallScore({ security: 5, electricity: 3, traffic_flow: 4 }), 4);
    assert.equal(overallScore({ security: 5, electricity: 4 }), 4.5);
    assert.equal(overallScore({ security: 4, electricity: 4, flood_safety: 5 }), 4.3);
  });
});

describe("Explore Abuja content", () => {
  it("has the seven rating categories the brief asks for", () => {
    assert.deepEqual(
      RATING_CATEGORIES.map((c) => c.value),
      ["security", "road_access", "electricity", "infrastructure", "lifestyle", "flood_safety", "traffic_flow"]
    );
  });
  it("profiles every seeded district with a centre inside the FCT", () => {
    assert.equal(Object.keys(DISTRICT_PROFILES).length, 25);
    for (const [slug, p] of Object.entries(DISTRICT_PROFILES)) {
      const [lat, lng] = p.centre;
      assert.ok(lat > 8.4 && lat < 9.4 && lng > 6.7 && lng < 7.7, `${slug} centre is outside the FCT`);
    }
  });
  it("links attractions only to districts that exist", () => {
    for (const a of ATTRACTIONS) if (a.districtSlug) assert.ok(DISTRICT_PROFILES[a.districtSlug], a.name);
  });
  it("cites a source for every guide section and attraction", () => {
    for (const s of MASTER_PLAN_SECTIONS) assert.ok(s.sources.length > 0, s.id);
    for (const a of ATTRACTIONS) assert.ok(a.sources.length > 0, a.name);
  });
});

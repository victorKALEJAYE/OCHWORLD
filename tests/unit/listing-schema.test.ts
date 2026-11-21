import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PROPERTY_TYPE_CATEGORY, listingSchema } from "@/lib/validations/listing";
import { PROPERTY_TYPE_LABELS } from "@/lib/properties/constants";

const valid = {
  organizationId: "00000000-0000-4000-a000-000000000001",
  title: "4-bedroom terrace duplex",
  listingType: "sale",
  propertyType: "terrace",
  districtId: "5",
  price: "₦130,000,000",
  bedrooms: "4",
  bathrooms: "",
  areaSqm: "",
  isFurnished: false,
  features: "Boys' quarters, Prepaid meter\nGated estate\nGated estate",
};

describe("listingSchema", () => {
  it("accepts a typical listing and cleans the values", () => {
    const r = listingSchema.safeParse(valid);
    assert.ok(r.success, JSON.stringify(!r.success && r.error.flatten()));
    assert.equal(r.data.price, 130_000_000);
    assert.equal(r.data.districtId, 5);
    assert.equal(r.data.bedrooms, 4);
    assert.equal(r.data.bathrooms, undefined);
    assert.deepEqual(r.data.features, ["Boys' quarters", "Prepaid meter", "Gated estate"]);
  });

  it("requires a rent period for rentals", () => {
    const r = listingSchema.safeParse({ ...valid, listingType: "rent" });
    assert.equal(r.success, false);
    assert.ok(!r.success && r.error.flatten().fieldErrors.rentPeriod);
    assert.ok(listingSchema.safeParse({ ...valid, listingType: "rent", rentPeriod: "year" }).success);
  });

  it("rejects bad prices and short titles", () => {
    assert.equal(listingSchema.safeParse({ ...valid, price: "0" }).success, false);
    assert.equal(listingSchema.safeParse({ ...valid, price: "abc" }).success, false);
    assert.equal(listingSchema.safeParse({ ...valid, title: "Flat" }).success, false);
  });

  it("limits features to 20", () => {
    const many = Array.from({ length: 21 }, (_, i) => `Feature ${i}`).join("\n");
    assert.equal(listingSchema.safeParse({ ...valid, features: many }).success, false);
  });

  it("maps every property type to a category", () => {
    for (const type of Object.keys(PROPERTY_TYPE_LABELS)) {
      assert.ok(PROPERTY_TYPE_CATEGORY[type as keyof typeof PROPERTY_TYPE_CATEGORY], `missing category for ${type}`);
    }
    assert.equal(PROPERTY_TYPE_CATEGORY.land, "land");
    assert.equal(PROPERTY_TYPE_CATEGORY.office, "commercial");
  });
});

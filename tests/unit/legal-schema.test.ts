import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { legalRequestSchema } from "@/lib/validations/legal";
import { LEGACY_SERVICE_LABELS, SUGGESTED_SERVICE } from "@/lib/legal/constants";
import { LEGAL_ICONS } from "@/lib/legal/icons";

const base = {
  serviceSlug: "property-due-diligence",
  propertyDetails: "Plot 1234, Guzape District",
  name: "Chinedu Eze",
  email: "chinedu@example.com",
  phone: "0803 000 0000",
};

describe("legalRequestSchema", () => {
  it("accepts a request described in words", () => {
    assert.ok(legalRequestSchema.safeParse(base).success);
  });

  it("accepts a request about a listing without a description", () => {
    const r = legalRequestSchema.safeParse({ ...base, propertyDetails: undefined, propertyId: "00000000-0000-4000-a000-000000000001" });
    assert.ok(r.success);
  });

  it("needs either a listing or a property description", () => {
    const r = legalRequestSchema.safeParse({ ...base, propertyDetails: undefined });
    assert.equal(r.success, false);
    assert.ok(!r.success && r.error.flatten().fieldErrors.propertyDetails);
  });

  it("requires a valid Nigerian phone number (the lawyer calls back)", () => {
    assert.equal(legalRequestSchema.safeParse({ ...base, phone: "" }).success, false);
    assert.equal(legalRequestSchema.safeParse({ ...base, phone: "12345" }).success, false);
  });

  it("requires a service slug and rejects malformed ones", () => {
    assert.equal(legalRequestSchema.safeParse({ ...base, serviceSlug: undefined }).success, false);
    assert.equal(legalRequestSchema.safeParse({ ...base, serviceSlug: "Due Diligence!" }).success, false);
    assert.equal(legalRequestSchema.safeParse({ ...base, serviceSlug: "../admin" }).success, false);
  });
});

describe("legal service helpers", () => {
  it("has an icon for every name the database allows", () => {
    const allowed = ["file-search", "file-text", "gavel", "messages", "key", "land", "scale", "shield", "building", "handshake"];
    assert.deepEqual(Object.keys(LEGAL_ICONS).sort(), [...allowed].sort());
  });

  it("suggests the seeded services from listing pages", () => {
    assert.equal(SUGGESTED_SERVICE.sale, "land-and-title-matters");
    assert.equal(SUGGESTED_SERVICE.rent, "tenancy-matters");
  });

  it("still labels requests made before the catalogue existed", () => {
    assert.equal(Object.keys(LEGACY_SERVICE_LABELS).length, 5);
  });
});

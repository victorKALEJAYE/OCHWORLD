import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { legalRequestSchema } from "@/lib/validations/legal";
import { LEGAL_SERVICES, LEGAL_SERVICE_LABELS } from "@/lib/legal/constants";

const base = {
  service: "title_verification",
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

  it("rejects unknown services", () => {
    assert.equal(legalRequestSchema.safeParse({ ...base, service: "land_grab" }).success, false);
  });

  it("has a label for every service", () => {
    for (const s of LEGAL_SERVICES) assert.ok(LEGAL_SERVICE_LABELS[s.value]);
    assert.equal(LEGAL_SERVICES.length, 5);
  });
});

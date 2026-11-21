import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { enquirySchema } from "@/lib/validations/enquiry";

const base = {
  propertyId: "00000000-0000-4000-a000-000000000001",
  name: "Adaeze Okafor",
  email: "adaeze@example.com",
  message: "Is this still available for viewing on Saturday?",
};

describe("enquirySchema", () => {
  it("accepts a guest enquiry without a phone number", () => {
    assert.ok(enquirySchema.safeParse(base).success);
  });

  for (const phone of ["08030000000", "0803 000 0000", "+2348030000000", "2349030000000", "07010000000"]) {
    it(`accepts Nigerian number ${phone}`, () => {
      assert.ok(enquirySchema.safeParse({ ...base, phone }).success);
    });
  }

  for (const phone of ["12345", "+447700900000", "0603000000"]) {
    it(`rejects ${phone}`, () => {
      assert.equal(enquirySchema.safeParse({ ...base, phone }).success, false);
    });
  }

  it("rejects a bad email, a very short message and a non-uuid property", () => {
    assert.equal(enquirySchema.safeParse({ ...base, email: "not-an-email" }).success, false);
    assert.equal(enquirySchema.safeParse({ ...base, message: "Hi" }).success, false);
    assert.equal(enquirySchema.safeParse({ ...base, propertyId: "1" }).success, false);
  });
});

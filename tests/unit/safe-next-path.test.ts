import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { safeNextPath } from "@/lib/validations/auth";

// After sign-in we redirect to ?next=... — it must never leave the site.
describe("safeNextPath", () => {
  it("keeps paths inside the site", () => {
    assert.equal(safeNextPath("/dashboard/listings?org=1"), "/dashboard/listings?org=1");
    assert.equal(safeNextPath("/invite/abc123"), "/invite/abc123");
  });

  it("falls back when missing", () => {
    assert.equal(safeNextPath(undefined), "/dashboard");
    assert.equal(safeNextPath(null), "/dashboard");
    assert.equal(safeNextPath(""), "/dashboard");
    assert.equal(safeNextPath(null, "/"), "/");
  });

  for (const attack of [
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "javascript:alert(1)",
    "evil.com/path",
    "/\tevil",
    "/dash\nboard",
  ]) {
    it(`rejects ${JSON.stringify(attack)}`, () => {
      assert.equal(safeNextPath(attack), "/dashboard");
    });
  }
});

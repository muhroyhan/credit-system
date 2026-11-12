import {
  belongsToCompany,
  hasProgramPermission,
  type Identity,
} from "@credit/server/identity";
import { describe, expect, it } from "vitest";

const admin: Identity = {
  id: 1,
  slug: "admin",
  type: "admin",
  permissions: [
    { program: "USA", value: "READ" },
    { program: "CGP", value: "WRITE" },
  ],
};
describe("program and tenant access", () => {
  it("matches exact program and read/write access", () => {
    expect(hasProgramPermission(admin, "USA", "READ")).toBe(true);
    expect(hasProgramPermission(admin, "USA", "WRITE")).toBe(false);
    expect(hasProgramPermission(admin, "CGP", "READ")).toBe(true);
    expect(hasProgramPermission(admin, "US", "READ")).toBe(false);
  });
  it("scopes non-admin identities to their tenant", () => {
    const user: Identity = {
      id: 2,
      type: "company",
      slug: "tenant-a",
      permissions: [],
    };
    expect(belongsToCompany(user, "tenant-a")).toBe(true);
    expect(belongsToCompany(user, "tenant-b")).toBe(false);
    expect(hasProgramPermission(user, "USA", "READ")).toBe(false);
  });
});

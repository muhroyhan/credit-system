import {
  belongsToCompany,
  hasAclPermission,
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

describe("granular ACL", () => {
  it("checks each action, keeps legacy WRITE, and requires explicit approval", () => {
    const identity: Identity = {
      ...admin,
      permissions: [
        { program: "USA", value: "CREATE" },
        { program: "USA", value: "APPROVAL" },
        { program: "USC", value: "WRITE" },
      ],
    };
    expect(hasAclPermission(identity, "USA_CREATE")).toBe(true);
    expect(hasAclPermission(identity, "USA_UPDATE")).toBe(false);
    expect(hasAclPermission(identity, "USA_READ")).toBe(false);
    expect(hasAclPermission(identity, "USA_APPROVAL")).toBe(true);
    expect(hasAclPermission(identity, "USC_DELETE")).toBe(true);
    expect(hasAclPermission(identity, "USC_APPROVAL")).toBe(false);
    expect(hasAclPermission(identity, "USA_WRITE")).toBe(false);
    expect(hasAclPermission(identity, "usa_CREATE")).toBe(false);
  });
});

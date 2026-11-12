import type { Session } from "@web/features/auth/auth.api";
import { crudaAccess } from "@web/utils/cruda";
import { describe, expect, it } from "vitest";

const session = (type: Session["type"], roles: unknown): Session => ({
  authToken: "synthetic",
  type,
  userData: { id: 1, roles },
});
describe("CRUDA mirrors current Admin User API permissions", () => {
  it("allows READ only for reading and never infers Approval from WRITE", () => {
    expect(
      crudaAccess(session("admin", [{ program: "USA", value: "READ" }]), "USA"),
    ).toEqual({
      create: false,
      read: true,
      update: false,
      delete: false,
      approve: false,
    });
    expect(
      crudaAccess(
        session("admin", [{ program: "USA", value: "WRITE" }]),
        "USA",
      ),
    ).toEqual({
      create: true,
      read: true,
      update: true,
      delete: true,
      approve: false,
    });
  });
  it("denies other programs, tenant actors and malformed roles", () => {
    for (const candidate of [
      null,
      session("admin", [{ program: "OTHER", value: "WRITE" }]),
      session("company", [{ program: "USA", value: "WRITE" }]),
      session("debitor", []),
      session("admin", [null, 5, {}, { program: "USA", value: "APPROVAL" }]),
    ]) {
      expect(
        Object.values(crudaAccess(candidate, "USA")).every((v) => !v),
      ).toBe(true);
    }
  });
});

import { closeDatabase } from "@credit/database/client";
import { AdminConflict } from "@server/features/admin-users/application/service";
import { adminRepository } from "@server/features/admin-users/data/repository";
import { afterAll, describe, expect, it } from "vitest";

const url = process.env.DATABASE_URL;
if (url) {
  const target = new URL(url);
  if (
    !["localhost", "127.0.0.1", "::1"].includes(target.hostname) ||
    !/^\/credit_[a-z0-9_]*test$/.test(target.pathname)
  )
    throw new Error("Isolated test database required");
}
afterAll(async () => {
  if (url) await closeDatabase();
});
describe.skipIf(!url)("administrator repository", () => {
  it("stores roles atomically and handles conflicts and deletion", async () => {
    const input = {
      username: "p03_integration",
      email: "p03-integration@example.invalid",
      password: "synthetic-hash",
      isActive: true,
      roles: [{ programId: 900001, value: "READ" as const }],
    };
    const id = await adminRepository.save(input, "test");
    try {
      await expect(adminRepository.save(input, "test")).rejects.toBeInstanceOf(
        AdminConflict,
      );
      await expect(
        adminRepository.save(
          { ...input, roles: [{ programId: 123456, value: "WRITE" }] },
          "test",
          id,
        ),
      ).rejects.toBeInstanceOf(AdminConflict);
      expect(await adminRepository.detail(id)).toMatchObject({
        username: input.username,
        roles: [{ programId: 900001, value: "READ" }],
      });
      await adminRepository.save({ ...input, roles: [] }, "test", id);
      expect(await adminRepository.detail(id)).toMatchObject({ roles: [] });
    } finally {
      expect(await adminRepository.remove(id)).toBe(true);
    }
    expect(await adminRepository.detail(id)).toBeNull();
  });
});

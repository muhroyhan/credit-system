import { closeDatabase } from "@credit/database/client";
import { adminUsersRepository } from "@server/features/admin-users/admin-users.repository";
import { AdminConflict } from "@server/features/admin-users/admin-users.service";
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
    const id = await adminUsersRepository.save(input, "test");
    try {
      await expect(
        adminUsersRepository.save(input, "test"),
      ).rejects.toBeInstanceOf(AdminConflict);
      await expect(
        adminUsersRepository.save(
          { ...input, roles: [{ programId: 123456, value: "WRITE" }] },
          "test",
          id,
        ),
      ).rejects.toBeInstanceOf(AdminConflict);
      expect(await adminUsersRepository.detail(id)).toMatchObject({
        username: input.username,
        roles: [{ programId: 900001, value: "READ" }],
      });
      await adminUsersRepository.save({ ...input, roles: [] }, "test", id);
      expect(await adminUsersRepository.detail(id)).toMatchObject({
        roles: [],
      });
    } finally {
      expect(await adminUsersRepository.remove(id)).toBe(true);
    }
    expect(await adminUsersRepository.detail(id)).toBeNull();
  });
});

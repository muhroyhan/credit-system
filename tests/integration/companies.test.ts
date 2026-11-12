import { closeDatabase } from "@credit/database/client";
import { CompanyConflict } from "@server/features/companies/companies.error";
import { companiesRepository } from "@server/features/companies/companies.repository";
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
describe.skipIf(!url)("company transaction and ownership", () => {
  it("reconciles children, rejects conflicts and foreign IDs without partial updates", async () => {
    const input = {
      entityTypeId: 900001,
      companyName: "P04 integration",
      username: "p04-integration",
      email: "p04-integration@example.invalid",
      slug: "p04-integration",
      status: "active" as const,
      bungaKredits: [{ bungaPercentage: "0.75", jangkaWaktuBulan: "12" }],
      biaya: [{ expenseType: "Admin", type: "%", value: 1 }],
    };
    const id = await companiesRepository.save(input, "test");
    try {
      await expect(
        companiesRepository.save(input, "test"),
      ).rejects.toBeInstanceOf(CompanyConflict);
      const detail = await companiesRepository.detail(id);
      expect(detail?.bungaKredits).toHaveLength(1);
      await expect(
        companiesRepository.save(
          {
            ...input,
            companyName: "Must rollback",
            biaya: [{ ...input.biaya[0], id: 900001 }],
          },
          "test",
          id,
        ),
      ).rejects.toBeInstanceOf(CompanyConflict);
      expect((await companiesRepository.detail(id))?.companyName).toBe(
        input.companyName,
      );
      await expect(
        companiesRepository.save(
          {
            ...input,
            companyName: "DB rollback",
            biaya: [{ expenseType: "x".repeat(256), type: "%", value: 1 }],
          },
          "test",
          id,
        ),
      ).rejects.toThrow();
      expect((await companiesRepository.detail(id))?.companyName).toBe(
        input.companyName,
      );
      expect((await companiesRepository.detail(id))?.bungaKredits).toHaveLength(
        1,
      );
      await companiesRepository.save(
        { ...input, bungaKredits: [], biaya: [] },
        "test",
        id,
      );
      expect(await companiesRepository.detail(id)).toMatchObject({
        bungaKredits: [],
        biaya: [],
      });
      await expect(companiesRepository.remove(900001)).rejects.toBeInstanceOf(
        CompanyConflict,
      );
    } finally {
      await companiesRepository.remove(id);
    }
  });
});

import { createHmac } from "node:crypto";
import { closeDatabase, connectDatabase } from "@credit/database/client";
import { app } from "@credit/server/app";
import { referenceRepository } from "@credit/server/reference-repository";
import { referenceController } from "@credit/server/reference-routes";
import { afterAll, describe, expect, it } from "vitest";

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
  const target = new URL(databaseUrl);
  if (
    !["127.0.0.1", "localhost", "::1"].includes(target.hostname) ||
    !/^\/credit_[a-z0-9_]*test$/.test(target.pathname)
  )
    throw new Error(
      "Reference integration tests require an isolated local test database",
    );
}
afterAll(async () => {
  if (databaseUrl) await closeDatabase();
});

describe.skipIf(!databaseUrl)("reference data on isolated mysql", () => {
  it("blocks all private routes even with untrusted authorization header", async () => {
    for (const path of ["programs", "entity-types", "countries", "constants"]) {
      const response = await app.request(`/api/${path}`, {
        headers: { authorization: "Bearer forged" },
      });
      expect(response.status).toBe(401);
    }
  });
  it("reuses the pool across repository calls", async () => {
    const first = connectDatabase();
    await referenceRepository.listPrograms();
    await referenceRepository.listCountries();
    expect(connectDatabase().pool).toBe(first.pool);
    expect(await referenceRepository.listPrograms()).toBeDefined();
  });
  it("returns seeded data through routes and filters constants", async () => {
    const authed = referenceController(referenceRepository);
    const denied = await authed.request("/programs");
    expect(denied.status).toBe(401);
    // Sign a fixture token; production middleware still validates it and resolves
    // the seeded account from MySQL. Login with bcrypt is covered by Bun E2E.
    const secret = process.env.JWT_SECRET;
    if (!secret)
      throw new Error("JWT_SECRET is required for integration tests");
    const header = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" }),
    ).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({
        id: 900001,
        slug: "admin",
        type: "admin",
        exp: Math.floor(Date.now() / 1000) + 60,
      }),
    ).toString("base64url");
    const signature = createHmac("sha256", secret)
      .update(`${header}.${payload}`)
      .digest("base64url");
    const session = { authToken: `${header}.${payload}.${signature}` };
    const response = await app.request("/api/programs", {
      headers: { authorization: `Bearer ${session.authToken}` },
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ abbreviation: "USA" }),
        expect.objectContaining({ abbreviation: "CGP" }),
      ]),
    );
    const countries = await (
      await app.request("/api/countries", {
        headers: { authorization: `Bearer ${session.authToken}` },
      })
    ).json();
    expect(countries).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "ID" })]),
    );
    expect(
      (
        await (
          await app.request("/api/entity-types", {
            headers: { authorization: `Bearer ${session.authToken}` },
          })
        ).json()
      ).length,
    ).toBeGreaterThan(0);
    expect(
      await (
        await app.request("/api/constants?name=absent", {
          headers: { authorization: `Bearer ${session.authToken}` },
        })
      ).json(),
    ).toEqual([]);
    expect(
      await (
        await app.request("/api/constants?name=contoh", {
          headers: { authorization: `Bearer ${session.authToken}` },
        })
      ).json(),
    ).toEqual([expect.objectContaining({ name: "contoh" })]);
    const slugs = await (await app.request("/api/user/slugs")).json();
    expect(slugs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slug: "sintetis-satu" }),
        expect.objectContaining({ slug: "sintetis-dua" }),
      ]),
    );
    expect(JSON.stringify(slugs)).not.toContain("password");
  });
});

import { app } from "@credit/server/app";
import { referenceRepository } from "@credit/server/reference-repository";
import { createReferenceRoutes } from "@credit/server/reference-routes";
import { describe, expect, it } from "vitest";

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
describe.skipIf(!databaseUrl)("reference data on isolated mysql", () => {
  it("blocks all private routes even with untrusted authorization header", async () => {
    for (const path of ["programs", "entity-types", "countries", "constants"]) {
      const response = await app.request(`/api/${path}`, {
        headers: { authorization: "Bearer forged" },
      });
      expect(response.status).toBe(401);
    }
  });
  it("returns seeded data through routes and filters constants", async () => {
    const authed = createReferenceRoutes(referenceRepository, () => true);
    const response = await authed.request("/programs");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ abbreviation: "USA" }),
        expect.objectContaining({ abbreviation: "CGP" }),
      ]),
    );
    const countries = await (await authed.request("/countries")).json();
    expect(countries).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "ID" })]),
    );
    expect(
      (await (await authed.request("/entity-types")).json()).length,
    ).toBeGreaterThan(0);
    expect(
      await (await authed.request("/constants?name=absent")).json(),
    ).toEqual([]);
    expect(
      await (await authed.request("/constants?name=contoh")).json(),
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

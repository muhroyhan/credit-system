import { constantsQuerySchema, slugSchema } from "@credit/contracts";
import { expect, it } from "vitest";

it("maps public slugs and validates query", () => {
  expect(
    slugSchema.parse({
      id: 1,
      slug: "tenant",
      companyName: "Tenant",
      password: "hidden",
    }),
  ).toEqual({ id: 1, slug: "tenant", companyName: "Tenant" });
  expect(constantsQuerySchema.parse({ name: "option" }).name).toBe("option");
});

import {
  companyCreateSchema,
  companyInputSchema,
  companyInterestSchema,
} from "@credit/contracts";
import { describe, expect, it } from "vitest";

describe("company configuration validation", () => {
  it("validates percentage/tenor and preserves fractional interest", () => {
    expect(
      companyInterestSchema.parse({
        bungaPercentage: "0.75",
        jangkaWaktuBulan: "12",
      }).bungaPercentage,
    ).toBe("0.75");
    expect(
      companyInterestSchema.safeParse({
        bungaPercentage: "NaN",
        jangkaWaktuBulan: "0",
      }).success,
    ).toBe(false);
  });
  it("requires create password and accepts empty configuration", () => {
    const input = {
      entityTypeId: 1,
      companyName: "Synthetic",
      username: "synthetic",
      email: "synthetic@example.invalid",
      slug: "synthetic",
      status: "active",
      bungaKredits: [],
      biaya: [],
    };
    expect(companyInputSchema.safeParse(input).success).toBe(true);
    expect(companyCreateSchema.safeParse(input).success).toBe(false);
  });
});

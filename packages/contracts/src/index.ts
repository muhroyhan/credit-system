import { z } from "zod";
export const referenceItemSchema = z.object({
  id: z.number(),
  value: z.string().nullable(),
});
export const programSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  abbreviation: z.string().nullable(),
});
export const countrySchema = referenceItemSchema.extend({
  code: z.string().nullable(),
});
export const constantSchema = referenceItemSchema.extend({
  name: z.string().nullable(),
  type: z.string().nullable(),
});
export const slugSchema = z.object({
  id: z.number(),
  slug: z.string().nullable(),
  companyName: z.string().nullable(),
});
export const constantsQuerySchema = z.object({ name: z.string().optional() });

export const loginSchema = z
  .object({
    type: z.enum(["admin", "company", "debitor"]),
    username: z.string().min(1),
    password: z.string().min(1),
    slug: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.type !== "admin" && !v.slug)
      ctx.addIssue({
        code: "custom",
        path: ["slug"],
        message: "Slug wajib diisi",
      });
  });

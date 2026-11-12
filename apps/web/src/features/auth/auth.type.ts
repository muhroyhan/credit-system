import type { loginSchema } from "@credit/contracts";
import { slugSchema } from "@credit/contracts";
import { z } from "zod";
export const sessionSchema = z.object({
  authToken: z.string(),
  type: z.enum(["admin", "company", "debitor"]),
  userData: z.object({ id: z.number() }).passthrough(),
});
export const slugListSchema = slugSchema.array();
export type Session = z.infer<typeof sessionSchema>;
export type AccountType = Session["type"];
export type LoginInput = z.input<typeof loginSchema>;

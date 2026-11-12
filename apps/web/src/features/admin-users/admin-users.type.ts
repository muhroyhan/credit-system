import type { adminInputSchema } from "@credit/contracts";
import { z } from "zod";
export const adminSchema = z.object({
  id: z.number(),
  username: z.string().nullable(),
  email: z.string().nullable(),
  isActive: z.boolean().nullable(),
  roles: z
    .array(
      z.object({ programId: z.number(), value: z.enum(["READ", "WRITE"]) }),
    )
    .optional(),
});

export const adminListSchema = z.object({
  count: z.number(),
  data: z.array(adminSchema),
});
export type AdminInput = z.infer<typeof adminInputSchema>;
export type Admin = z.infer<typeof adminSchema>;
export type AdminList = z.infer<typeof adminListSchema>;
export type ApiResponse = { ok: boolean; json: () => Promise<unknown> };
export type ApiError = { error?: string };
export type AdminUserFormProps = {
  token: string;
  id?: number;
  initial?: AdminInput;
};
export type AdminExportFormat = "pdf" | "xlsx";

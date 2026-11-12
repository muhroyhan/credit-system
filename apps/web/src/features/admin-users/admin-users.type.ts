import type { adminInputSchema } from "@credit/contracts";
import type { adminSchema } from "@web/features/admin-users/admin-users.api";
import type { z } from "zod";
export type AdminInput = z.infer<typeof adminInputSchema>;
export type Admin = z.infer<typeof adminSchema>;
export type AdminList = { count: number; data: Admin[] };
export type ApiResponse = { ok: boolean; json: () => Promise<unknown> };
export type ApiError = { error?: string };
export type AdminUserFormProps = {
  token: string;
  id?: number;
  initial?: AdminInput;
};
export type AdminExportFormat = "pdf" | "xlsx";

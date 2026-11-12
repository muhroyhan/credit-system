import type { EXPORT_FORMATS } from "@web/constant/constant";
import type { sessionSchema } from "@web/constant/schema";
import type { z } from "zod";
export type ExportFormat = (typeof EXPORT_FORMATS)[number];
export type CrudaAction = "create" | "read" | "update" | "delete" | "approve";

export type Session = z.infer<typeof sessionSchema>;

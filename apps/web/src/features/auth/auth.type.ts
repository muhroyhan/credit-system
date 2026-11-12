import type { sessionSchema } from "@web/features/auth/auth.api";
import type { z } from "zod";
export type Session = z.infer<typeof sessionSchema>;
export type AccountType = Session["type"];

import type { companyInputSchema, companyQuerySchema } from "@credit/contracts";
import type { z } from "zod";
export type CompanyInput = z.infer<typeof companyInputSchema>;
export type CompanyQuery = z.infer<typeof companyQuerySchema>;

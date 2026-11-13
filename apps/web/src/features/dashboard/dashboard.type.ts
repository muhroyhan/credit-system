import { z } from 'zod';
export const dashboardSchema = z.object({
  totalUsers: z.number().int().nonnegative(),
  totalDebitor: z.number().int().nonnegative(),
  totalCredits: z.object({
    pending: z.string().regex(/^\d+$/),
    approved: z.string().regex(/^\d+$/),
    completed: z.string().regex(/^\d+$/),
  }),
});

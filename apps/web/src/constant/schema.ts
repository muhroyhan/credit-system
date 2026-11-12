import { z } from 'zod';

export const apiErrorSchema = z.object({ error: z.string().optional() });

export const sessionSchema = z.object({
  authToken: z.string(),
  type: z.enum(['admin', 'company', 'debitor']),
  userData: z.object({ id: z.number() }).passthrough(),
});

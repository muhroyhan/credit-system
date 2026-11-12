import type { loginSchema } from '@credit/contracts';
import { slugSchema } from '@credit/contracts';
import type { Session } from '@web/constant/type';
import type { z } from 'zod';

export const slugListSchema = slugSchema.array();
export type AccountType = Session['type'];
export type LoginInput = z.input<typeof loginSchema>;

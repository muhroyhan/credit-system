import type { sessionSchema } from '@web/constant/schema';
import type { z } from 'zod';

export type CrudaAction = 'create' | 'read' | 'update' | 'delete' | 'approve';

export type Session = z.infer<typeof sessionSchema>;

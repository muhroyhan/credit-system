import { ACL_PATTERN } from '@server/constant/constant';
import { z } from 'zod';

export const aclSchema = z.string().regex(ACL_PATTERN);

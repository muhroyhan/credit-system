import { ExportTypeEnum } from '@credit/contracts';
import { ACL_PATTERN } from '@server/constant/constant';
import { z } from 'zod';

export const aclSchema = z.string().regex(ACL_PATTERN);

export const exportFormatSchema = z.enum(ExportTypeEnum);

import {
  constantSchema,
  constantsQuerySchema,
  countrySchema,
  programSchema,
  referenceItemSchema,
  slugSchema,
} from '@credit/contracts';
import type { AuthEnv } from '@server/constant/interface';
import { referenceService } from '@server/features/reference/reference.service';
import type { Context } from 'hono';

export const referenceController = {
  slugs: async (c: Context<AuthEnv>) =>
    c.json(slugSchema.array().parse(await referenceService.slugs())),
  programs: async (c: Context<AuthEnv>) =>
    c.json(programSchema.array().parse(await referenceService.programs())),
  entityTypes: async (c: Context<AuthEnv>) =>
    c.json(
      referenceItemSchema.array().parse(await referenceService.entityTypes()),
    ),
  countries: async (c: Context<AuthEnv>) =>
    c.json(countrySchema.array().parse(await referenceService.countries())),
  constants: async (c: Context<AuthEnv>) => {
    const query = constantsQuerySchema.safeParse(c.req.query());
    if (!query.success) {
      return c.json({ error: 'invalid query' }, 400);
    }
    return c.json(
      constantSchema
        .array()
        .parse(await referenceService.constants(query.data.name)),
    );
  },
};

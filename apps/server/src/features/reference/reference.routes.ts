import type { AuthEnv } from '@server/constant/interface';
import { referenceController } from '@server/features/reference/reference.controller';
import type { ReferenceRoutes } from '@server/features/reference/reference.type';
import { identityContext } from '@server/middleware/identity-context.middleware';
import type { Hono } from 'hono';

export function referenceRoutes(app: Hono<AuthEnv>) {
  const programs = app.get(
    '/programs',
    identityContext,
    referenceController.programs,
  );
  const entityTypes = app.get(
    '/entity-types',
    identityContext,
    referenceController.entityTypes,
  );
  const countries = app.get(
    '/countries',
    identityContext,
    referenceController.countries,
  );
  const constants = app.get(
    '/constants',
    identityContext,
    referenceController.constants,
  );
  const slugs = app.get('/user/slugs', referenceController.slugs);
  return app as Hono<
    AuthEnv,
    ReferenceRoutes<
      typeof slugs,
      typeof programs,
      typeof entityTypes,
      typeof countries,
      typeof constants
    >
  >;
}

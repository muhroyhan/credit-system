import {
  constantSchema,
  constantsQuerySchema,
  countrySchema,
  programSchema,
  referenceItemSchema,
  slugSchema,
} from "@credit/contracts";
import type {
  AuthEnv,
  IdentityMiddleware,
} from "@server/features/auth/auth.type";
import { referenceService } from "@server/features/reference/reference.service";
import type { ReferenceRoutes } from "@server/features/reference/reference.type";
import { Hono } from "hono";

export function referenceController(identityContext: IdentityMiddleware) {
  const app = new Hono<AuthEnv>();
  const slugs = app.get("/user/slugs", async (c) =>
    c.json(slugSchema.array().parse(await referenceService.slugs())),
  );
  const programs = app.get("/programs", identityContext, async (c) =>
    c.json(programSchema.array().parse(await referenceService.programs())),
  );
  const entityTypes = app.get("/entity-types", identityContext, async (c) =>
    c.json(
      referenceItemSchema.array().parse(await referenceService.entityTypes()),
    ),
  );
  const countries = app.get("/countries", identityContext, async (c) =>
    c.json(countrySchema.array().parse(await referenceService.countries())),
  );
  const constants = app.get("/constants", identityContext, async (c) => {
    const query = constantsQuerySchema.safeParse(c.req.query());
    if (!query.success) return c.json({ error: "invalid query" }, 400);
    return c.json(
      constantSchema
        .array()
        .parse(await referenceService.constants(query.data.name)),
    );
  });
  // Each registration returns its schema while mutating the same app instance.
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

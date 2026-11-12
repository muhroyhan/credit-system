import {
  constantSchema,
  constantsQuerySchema,
  countrySchema,
  programSchema,
  referenceItemSchema,
  slugSchema,
} from "@credit/contracts";
import {
  type AuthEnv,
  identityContext,
} from "@server/features/auth/presentation/middleware";
import {
  createReferenceService,
  type ReferenceRepository,
} from "@server/features/reference/application/reference";
import { Hono } from "hono";

export function createReferenceRoutes(repository: ReferenceRepository) {
  const service = createReferenceService(repository);
  const app = new Hono<AuthEnv>();
  const slugs = app.get("/user/slugs", async (c) =>
    c.json(slugSchema.array().parse(await service.slugs())),
  );
  app.use("/programs", identityContext);
  app.use("/entity-types", identityContext);
  app.use("/countries", identityContext);
  app.use("/constants", identityContext);
  const programs = app.get("/programs", async (c) =>
    c.json(programSchema.array().parse(await service.programs())),
  );
  const entityTypes = app.get("/entity-types", async (c) =>
    c.json(referenceItemSchema.array().parse(await service.entityTypes())),
  );
  const countries = app.get("/countries", async (c) =>
    c.json(countrySchema.array().parse(await service.countries())),
  );
  const constants = app.get("/constants", async (c) => {
    const query = constantsQuerySchema.safeParse(c.req.query());
    if (!query.success) return c.json({ error: "invalid query" }, 400);
    return c.json(
      constantSchema.array().parse(await service.constants(query.data.name)),
    );
  });
  // Each registration returns its schema while mutating the same app instance.
  type SchemaOf<T> = T extends Hono<infer _E, infer S, infer _P> ? S : never;
  type Routes = SchemaOf<typeof slugs> &
    SchemaOf<typeof programs> &
    SchemaOf<typeof entityTypes> &
    SchemaOf<typeof countries> &
    SchemaOf<typeof constants>;
  return app as Hono<AuthEnv, Routes>;
}

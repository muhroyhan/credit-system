import {
  constantSchema,
  constantsQuerySchema,
  countrySchema,
  programSchema,
  referenceItemSchema,
  slugSchema,
} from "@credit/contracts";
import {
  createReferenceService,
  type ReferenceRepository,
} from "@server/features/reference/application/reference";
import { Hono } from "hono";
import type { BlankEnv } from "hono/types";

export function createReferenceRoutes(
  repository: ReferenceRepository,
  authorize: () => boolean = () => false,
) {
  const service = createReferenceService(repository);
  const app = new Hono();
  const slugs = app.get("/user/slugs", async (c) =>
    c.json(slugSchema.array().parse(await service.slugs())),
  );
  app.use("/programs", async (c, next) => {
    if (!authorize()) return c.json({ error: "unauthorized" }, 401);
    await next();
  });
  app.use("/entity-types", async (c, next) => {
    if (!authorize()) return c.json({ error: "unauthorized" }, 401);
    await next();
  });
  app.use("/countries", async (c, next) => {
    if (!authorize()) return c.json({ error: "unauthorized" }, 401);
    await next();
  });
  app.use("/constants", async (c, next) => {
    if (!authorize()) return c.json({ error: "unauthorized" }, 401);
    await next();
  });
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
  return app as Hono<BlankEnv, Routes>;
}

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

export function createReferenceRoutes(
  repository: ReferenceRepository,
  authorize: () => boolean = () => false,
) {
  const service = createReferenceService(repository);
  return new Hono()
    .get("/user/slugs", async (c) =>
      c.json(slugSchema.array().parse(await service.slugs())),
    )
    .use("/programs", async (c, next) => {
      if (!authorize()) return c.json({ error: "unauthorized" }, 401);
      await next();
    })
    .use("/entity-types", async (c, next) => {
      if (!authorize()) return c.json({ error: "unauthorized" }, 401);
      await next();
    })
    .use("/countries", async (c, next) => {
      if (!authorize()) return c.json({ error: "unauthorized" }, 401);
      await next();
    })
    .use("/constants", async (c, next) => {
      if (!authorize()) return c.json({ error: "unauthorized" }, 401);
      await next();
    })
    .get("/programs", async (c) =>
      c.json(programSchema.array().parse(await service.programs())),
    )
    .get("/entity-types", async (c) =>
      c.json(referenceItemSchema.array().parse(await service.entityTypes())),
    )
    .get("/countries", async (c) =>
      c.json(countrySchema.array().parse(await service.countries())),
    )
    .get("/constants", async (c) => {
      const query = constantsQuerySchema.safeParse(c.req.query());
      if (!query.success) return c.json({ error: "invalid query" }, 400);
      return c.json(
        constantSchema.array().parse(await service.constants(query.data.name)),
      );
    });
}

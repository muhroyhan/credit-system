import {
  adminCreateSchema,
  adminDeleteSchema,
  adminListQuerySchema,
  adminUpdateSchema,
  idQuerySchema,
} from "@credit/contracts";
import {
  AdminConflict,
  AdminNotFound,
  type AdminRepository,
  createAdminService,
} from "@server/features/admin-users/service.application";
import { hasProgramPermission } from "@server/features/auth/identity.application";
import {
  type AuthEnv,
  identityContext,
} from "@server/features/auth/middleware.presentation";
import type { SchemaOf } from "@server/infrastructure/rpc-types";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";

export function createAdminRoutes(repository: AdminRepository) {
  const app = new Hono<AuthEnv>();
  const service = createAdminService(repository);
  const permission = (access: "READ" | "WRITE") =>
    createMiddleware<AuthEnv>(async (c, next) => {
      if (!hasProgramPermission(c.get("identity"), "USA", access))
        return c.json({ error: "forbidden" }, 403);
      await next();
    });
  const list = app.get(
    "/admin-users",
    identityContext,
    permission("READ"),
    async (c) => {
      const query = adminListQuerySchema.safeParse(c.req.query());
      if (!query.success) return c.json({ error: "invalid query" }, 400);
      return c.json(await service.list(query.data));
    },
  );
  const detail = app.get(
    "/admin-user",
    identityContext,
    permission("READ"),
    async (c) => {
      const id = idQuerySchema.safeParse(c.req.query());
      if (!id.success) return c.json({ error: "invalid id" }, 400);
      const result = await service.detail(id.data.id);
      if (!result) return c.json({ error: "not found" }, 404);
      return c.json(result);
    },
  );
  const create = app.post(
    "/admin-user/create",
    identityContext,
    permission("WRITE"),
    async (c) => {
      const input = adminCreateSchema.safeParse(
        await c.req.json().catch(() => null),
      );
      if (!input.success) return c.json({ error: "invalid request" }, 400);
      try {
        const id = await service.save(input.data, String(c.get("identity").id));
        return c.json({ id }, 201);
      } catch (error) {
        if (error instanceof AdminConflict)
          return c.json({ error: error.message }, 409);
        throw error;
      }
    },
  );
  const update = app.put(
    "/admin-user/update",
    identityContext,
    permission("WRITE"),
    async (c) => {
      const input = adminUpdateSchema.safeParse(
        await c.req.json().catch(() => null),
      );
      if (!input.success) return c.json({ error: "invalid request" }, 400);
      try {
        const { id, ...data } = input.data;
        await service.save(data, String(c.get("identity").id), id);
        return c.json({ id });
      } catch (error) {
        if (error instanceof AdminConflict)
          return c.json({ error: error.message }, 409);
        if (error instanceof AdminNotFound)
          return c.json({ error: "not found" }, 404);
        throw error;
      }
    },
  );
  const remove = app.put(
    "/admin-user/delete",
    identityContext,
    permission("WRITE"),
    async (c) => {
      const input = adminDeleteSchema.safeParse(
        await c.req.json().catch(() => null),
      );
      if (!input.success) return c.json({ error: "invalid request" }, 400);
      if (!(await service.remove(input.data.id)))
        return c.json({ error: "not found" }, 404);
      return c.json({ id: input.data.id });
    },
  );
  type Routes = SchemaOf<typeof list> &
    SchemaOf<typeof detail> &
    SchemaOf<typeof create> &
    SchemaOf<typeof update> &
    SchemaOf<typeof remove>;
  return app as Hono<AuthEnv, Routes>;
}

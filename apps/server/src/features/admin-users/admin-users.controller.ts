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
  adminUsersService,
} from "@server/features/admin-users/admin-users.service";
import type { AdminUsersRoutes } from "@server/features/admin-users/admin-users.type";
import { hasProgramPermission } from "@server/features/auth/auth.service";
import type {
  AuthEnv,
  IdentityMiddleware,
} from "@server/features/auth/auth.type";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";

export function adminUsersController(identityContext: IdentityMiddleware) {
  const app = new Hono<AuthEnv>();
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
      return c.json(await adminUsersService.list(query.data));
    },
  );
  const detail = app.get(
    "/admin-user",
    identityContext,
    permission("READ"),
    async (c) => {
      const id = idQuerySchema.safeParse(c.req.query());
      if (!id.success) return c.json({ error: "invalid id" }, 400);
      const result = await adminUsersService.detail(id.data.id);
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
        const id = await adminUsersService.save(
          input.data,
          String(c.get("identity").id),
        );
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
        await adminUsersService.save(data, String(c.get("identity").id), id);
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
      if (!(await adminUsersService.remove(input.data.id)))
        return c.json({ error: "not found" }, 404);
      return c.json({ id: input.data.id });
    },
  );
  return app as Hono<
    AuthEnv,
    AdminUsersRoutes<
      typeof list,
      typeof detail,
      typeof create,
      typeof update,
      typeof remove
    >
  >;
}

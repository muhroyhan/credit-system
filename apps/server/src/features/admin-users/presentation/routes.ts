import {
  adminCreateSchema,
  adminDeleteSchema,
  adminListQuerySchema,
  adminUpdateSchema,
} from "@credit/contracts";
import {
  AdminConflict,
  AdminNotFound,
  createAdminService,
} from "@server/features/admin-users/application/service";
import { adminRepository } from "@server/features/admin-users/data/repository";
import { hasProgramPermission } from "@server/features/auth/application/identity";
import {
  type AuthEnv,
  identityContext,
} from "@server/features/auth/presentation/middleware";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";

const app = new Hono<AuthEnv>();
const service = createAdminService(adminRepository);
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
    const id = z.coerce.number().int().positive().safeParse(c.req.query("id"));
    if (!id.success) return c.json({ error: "invalid id" }, 400);
    const result = await service.detail(id.data);
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
type SchemaOf<T> = T extends Hono<infer _E, infer S, infer _P> ? S : never;
type Routes = SchemaOf<typeof list> &
  SchemaOf<typeof detail> &
  SchemaOf<typeof create> &
  SchemaOf<typeof update> &
  SchemaOf<typeof remove>;
export const adminRoutes = app as Hono<AuthEnv, Routes>;

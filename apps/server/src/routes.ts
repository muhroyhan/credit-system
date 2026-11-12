import { adminUsersController } from "@server/features/admin-users/admin-users.controller";
import type { AdminUsersRoutes } from "@server/features/admin-users/admin-users.type";
import { authController } from "@server/features/auth/auth.controller";
import type { AuthEnv } from "@server/features/auth/auth.type";
import { healthController } from "@server/features/health/health.controller";
import { referenceController } from "@server/features/reference/reference.controller";
import type { ReferenceRoutes } from "@server/features/reference/reference.type";
import type { SchemaOf } from "@server/infrastructure/rpc-types";
import { Hono } from "hono";

export function routes() {
  const app = new Hono<AuthEnv>();
  const health = app.get("/health", healthController.health);
  const login = app.post("/login", authController.login);
  const slugs = app.get("/user/slugs", referenceController.slugs);
  const programs = app.get(
    "/programs",
    authController.identityContext,
    referenceController.programs,
  );
  const entityTypes = app.get(
    "/entity-types",
    authController.identityContext,
    referenceController.entityTypes,
  );
  const countries = app.get(
    "/countries",
    authController.identityContext,
    referenceController.countries,
  );
  const constants = app.get(
    "/constants",
    authController.identityContext,
    referenceController.constants,
  );
  const list = app.get(
    "/admin-users",
    authController.identityContext,
    adminUsersController.readPermission,
    adminUsersController.list,
  );
  const detail = app.get(
    "/admin-user",
    authController.identityContext,
    adminUsersController.readPermission,
    adminUsersController.detail,
  );
  const create = app.post(
    "/admin-user/create",
    authController.identityContext,
    adminUsersController.writePermission,
    adminUsersController.create,
  );
  const update = app.put(
    "/admin-user/update",
    authController.identityContext,
    adminUsersController.writePermission,
    adminUsersController.update,
  );
  const remove = app.put(
    "/admin-user/delete",
    authController.identityContext,
    adminUsersController.writePermission,
    adminUsersController.remove,
  );
  type ApiSchema = SchemaOf<typeof health> &
    SchemaOf<typeof login> &
    ReferenceRoutes<
      typeof slugs,
      typeof programs,
      typeof entityTypes,
      typeof countries,
      typeof constants
    > &
    AdminUsersRoutes<
      typeof list,
      typeof detail,
      typeof create,
      typeof update,
      typeof remove
    >;
  return app as Hono<AuthEnv, ApiSchema>;
}

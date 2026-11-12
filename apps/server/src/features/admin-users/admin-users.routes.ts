import { adminUsersController } from "@server/features/admin-users/admin-users.controller";
import type { AdminUsersRoutes } from "@server/features/admin-users/admin-users.type";
import type { AuthEnv } from "@server/features/auth/auth.type";
import { identityContext } from "@server/middleware/identity-context.middleware";
import { permission } from "@server/middleware/permission.middleware";
import { Hono } from "hono";
export function adminUsersRoutes() {
  const admin = new Hono<AuthEnv>();
  const list = admin.get(
    "/list",
    identityContext,
    permission("USA_READ"),
    adminUsersController.list,
  );
  const exportFile = admin.get(
    "/export",
    identityContext,
    permission("USA_READ"),
    adminUsersController.exportFile,
  );
  const detail = admin.get(
    "/detail",
    identityContext,
    permission("USA_READ"),
    adminUsersController.detail,
  );
  const create = admin.post(
    "/create",
    identityContext,
    permission("USA_CREATE"),
    adminUsersController.create,
  );
  const update = admin.put(
    "/update",
    identityContext,
    permission("USA_UPDATE"),
    adminUsersController.update,
  );
  const remove = admin.put(
    "/delete",
    identityContext,
    permission("USA_DELETE"),
    adminUsersController.remove,
  );
  return admin as Hono<
    AuthEnv,
    AdminUsersRoutes<
      typeof list,
      typeof detail,
      typeof create,
      typeof update,
      typeof remove,
      typeof exportFile
    >
  >;
}

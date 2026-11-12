import { adminUsersController } from "@server/features/admin-users/admin-users.controller";
import type { AdminUsersRoutes } from "@server/features/admin-users/admin-users.type";
import { authController } from "@server/features/auth/auth.controller";
import type { AuthEnv } from "@server/features/auth/auth.type";
import { companiesController } from "@server/features/companies/companies.controller";
import { healthController } from "@server/features/health/health.controller";
import { referenceController } from "@server/features/reference/reference.controller";
import type { ReferenceRoutes } from "@server/features/reference/reference.type";
import type { SchemaOf } from "@server/infrastructure/rpc-types";
import { adminReadPermission } from "@server/middleware/admin-read.middleware";
import { adminWritePermission } from "@server/middleware/admin-write.middleware";
import { companyReadPermission } from "@server/middleware/company-read.middleware";
import { companyWritePermission } from "@server/middleware/company-write.middleware";
import { identityContext } from "@server/middleware/identity-context.middleware";
import { Hono } from "hono";

export function routes() {
  const app = new Hono<AuthEnv>();
  const health = app.get("/health", healthController.health);
  const login = app.post("/login", authController.login);
  const slugs = app.get("/user/slugs", referenceController.slugs);
  const programs = app.get(
    "/programs",
    identityContext,
    referenceController.programs,
  );
  const entityTypes = app.get(
    "/entity-types",
    identityContext,
    referenceController.entityTypes,
  );
  const countries = app.get(
    "/countries",
    identityContext,
    referenceController.countries,
  );
  const constants = app.get(
    "/constants",
    identityContext,
    referenceController.constants,
  );
  const list = app.get(
    "/admin-users",
    identityContext,
    adminReadPermission,
    adminUsersController.list,
  );
  const exportFile = app.get(
    "/admin-users/export",
    identityContext,
    adminReadPermission,
    adminUsersController.exportFile,
  );
  const detail = app.get(
    "/admin-user",
    identityContext,
    adminReadPermission,
    adminUsersController.detail,
  );
  const create = app.post(
    "/admin-user/create",
    identityContext,
    adminWritePermission,
    adminUsersController.create,
  );
  const update = app.put(
    "/admin-user/update",
    identityContext,
    adminWritePermission,
    adminUsersController.update,
  );
  const remove = app.put(
    "/admin-user/delete",
    identityContext,
    adminWritePermission,
    adminUsersController.remove,
  );
  const companies = app.get(
    "/users",
    identityContext,
    companyReadPermission,
    companiesController.list,
  );
  const company = app.get(
    "/user",
    identityContext,
    companyReadPermission,
    companiesController.detail,
  );
  const companyCreate = app.post(
    "/user/create",
    identityContext,
    companyWritePermission,
    companiesController.create,
  );
  const companyUpdate = app.put(
    "/user/update",
    identityContext,
    companyWritePermission,
    companiesController.update,
  );
  const companyDelete = app.put(
    "/user/delete",
    identityContext,
    companyWritePermission,
    companiesController.remove,
  );
  const companyInterests = app.get(
    "/user/bunga-kredits",
    identityContext,
    companiesController.interests,
  );
  const companyExport = app.get(
    "/user/export",
    identityContext,
    companyReadPermission,
    companiesController.exportFile,
  );
  type ApiSchema = SchemaOf<typeof companies> &
    SchemaOf<typeof company> &
    SchemaOf<typeof companyCreate> &
    SchemaOf<typeof companyUpdate> &
    SchemaOf<typeof companyDelete> &
    SchemaOf<typeof companyInterests> &
    SchemaOf<typeof companyExport> &
    SchemaOf<typeof health> &
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
      typeof remove,
      typeof exportFile
    >;
  return app as Hono<AuthEnv, ApiSchema>;
}

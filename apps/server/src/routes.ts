import { adminUsersController } from "@server/features/admin-users/admin-users.controller";
import { authController } from "@server/features/auth/auth.controller";
import type { AuthEnv } from "@server/features/auth/auth.type";
import { companiesController } from "@server/features/companies/companies.controller";
import { healthController } from "@server/features/health/health.controller";
import { referenceController } from "@server/features/reference/reference.controller";
import type { SchemaOf } from "@server/infrastructure/rpc-types";
import { identityContext } from "@server/middleware/identity-context.middleware";
import { permission } from "@server/middleware/permission.middleware";
import { Hono } from "hono";
import type { MergeSchemaPath } from "hono/types";

export function routes() {
  const app = new Hono<AuthEnv>();
  const health = app.get("/health", healthController.health);
  const login = app.post("/login", authController.login);
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
  type AdminSchema = SchemaOf<typeof list> &
    SchemaOf<typeof exportFile> &
    SchemaOf<typeof detail> &
    SchemaOf<typeof create> &
    SchemaOf<typeof update> &
    SchemaOf<typeof remove>;
  app.route("/admin-user", admin as Hono<AuthEnv, AdminSchema>);
  const user = new Hono<AuthEnv>();
  const slugs = user.get("/slugs", referenceController.slugs);
  const companies = user.get(
    "/list",
    identityContext,
    permission("USC_READ"),
    companiesController.list,
  );
  const company = user.get(
    "/detail",
    identityContext,
    permission("USC_READ"),
    companiesController.detail,
  );
  const companyCreate = user.post(
    "/create",
    identityContext,
    permission("USC_CREATE"),
    companiesController.create,
  );
  const companyUpdate = user.put(
    "/update",
    identityContext,
    permission("USC_UPDATE"),
    companiesController.update,
  );
  const companyDelete = user.put(
    "/delete",
    identityContext,
    permission("USC_DELETE"),
    companiesController.remove,
  );
  const interests = user.get(
    "/bunga-kredits",
    identityContext,
    companiesController.interests,
  );
  const companyExport = user.get(
    "/export",
    identityContext,
    permission("USC_READ"),
    companiesController.exportFile,
  );
  type UserSchema = SchemaOf<typeof slugs> &
    SchemaOf<typeof companies> &
    SchemaOf<typeof company> &
    SchemaOf<typeof companyCreate> &
    SchemaOf<typeof companyUpdate> &
    SchemaOf<typeof companyDelete> &
    SchemaOf<typeof interests> &
    SchemaOf<typeof companyExport>;
  app.route("/user", user as Hono<AuthEnv, UserSchema>);
  type ApiSchema = SchemaOf<typeof health> &
    SchemaOf<typeof login> &
    SchemaOf<typeof programs> &
    SchemaOf<typeof entityTypes> &
    SchemaOf<typeof countries> &
    SchemaOf<typeof constants> &
    MergeSchemaPath<AdminSchema, "/admin-user"> &
    MergeSchemaPath<UserSchema, "/user">;
  return app as Hono<AuthEnv, ApiSchema>;
}

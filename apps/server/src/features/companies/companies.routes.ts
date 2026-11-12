import type { AuthEnv } from "@server/features/auth/auth.type";
import { companiesController } from "@server/features/companies/companies.controller";
import type { CompaniesRoutes } from "@server/features/companies/companies.type";
import { identityContext } from "@server/middleware/identity-context.middleware";
import { permission } from "@server/middleware/permission.middleware";
import { Hono } from "hono";
export function companiesRoutes() {
  const user = new Hono<AuthEnv>();
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
  return user as Hono<
    AuthEnv,
    CompaniesRoutes<
      typeof companies,
      typeof company,
      typeof companyCreate,
      typeof companyUpdate,
      typeof companyDelete,
      typeof interests,
      typeof companyExport
    >
  >;
}

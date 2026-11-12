import type { AnyRoute } from "@tanstack/react-router";
import { CompaniesAddPage } from "@web/features/companies/CompaniesAddPage";
import { CompaniesEditPage } from "@web/features/companies/CompaniesEditPage";
import { CompaniesPage } from "@web/features/companies/CompaniesPage";
import { CompaniesViewPage } from "@web/features/companies/CompaniesViewPage";
import { createCrudRoutes } from "@web/utils/create-crud-routes";
export function companiesRoutes<TParent extends AnyRoute>(parent: TParent) {
  return createCrudRoutes(parent, {
    list: CompaniesPage,
    add: CompaniesAddPage,
    edit: CompaniesEditPage,
    view: CompaniesViewPage,
  });
}

import type { AnyRoute } from "@tanstack/react-router";
import { AdminUsersAddPage } from "@web/features/admin-users/AdminUsersAddPage";
import { AdminUsersEditPage } from "@web/features/admin-users/AdminUsersEditPage";
import { AdminUsersPage } from "@web/features/admin-users/AdminUsersPage";
import { AdminUsersViewPage } from "@web/features/admin-users/AdminUsersViewPage";
import { createCrudRoutes } from "@web/utils/create-crud-routes";
export function adminUsersRoutes<TParent extends AnyRoute>(parent: TParent) {
  return createCrudRoutes(parent, {
    list: AdminUsersPage,
    add: AdminUsersAddPage,
    edit: AdminUsersEditPage,
    view: AdminUsersViewPage,
  });
}

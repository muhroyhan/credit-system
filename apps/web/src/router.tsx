import { Container, Title } from "@mantine/core";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { AdminUsersAddPage } from "@web/features/admin-users/AdminUsersAddPage";
import { AdminUsersEditPage } from "@web/features/admin-users/AdminUsersEditPage";
import { AdminUsersPage } from "@web/features/admin-users/AdminUsersPage";
import { AdminUsersViewPage } from "@web/features/admin-users/AdminUsersViewPage";
import { LoginPage } from "@web/features/auth/LoginPage";
import { CompaniesAddPage } from "@web/features/companies/CompaniesAddPage";
import { CompaniesEditPage } from "@web/features/companies/CompaniesEditPage";
import { CompaniesPage } from "@web/features/companies/CompaniesPage";
import { CompaniesViewPage } from "@web/features/companies/CompaniesViewPage";
import { DashboardPage } from "@web/features/dashboard/DashboardPage";

const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: () => (
    <Container>
      <Title>Halaman tidak ditemukan</Title>
      <Link to="/">Kembali</Link>
    </Container>
  ),
});
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-users",
  component: AdminUsersPage,
});
const adminAddRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-users/add",
  component: AdminUsersAddPage,
});
const adminEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-users/$id/edit",
  component: AdminUsersEditPage,
});
const adminViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-users/$id",
  component: AdminUsersViewPage,
});
const companyListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/companies",
  component: CompaniesPage,
});
const companyAddRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/companies/add",
  component: CompaniesAddPage,
});
const companyEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/companies/$id/edit",
  component: CompaniesEditPage,
});
const companyViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/companies/$id",
  component: CompaniesViewPage,
});
export const router = createRouter({
  routeTree: rootRoute.addChildren([
    companyListRoute,
    companyAddRoute,
    companyEditRoute,
    companyViewRoute,
    indexRoute,
    loginRoute,
    adminRoute,
    adminAddRoute,
    adminEditRoute,
    adminViewRoute,
  ]),
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

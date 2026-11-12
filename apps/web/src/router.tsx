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
export const router = createRouter({
  routeTree: rootRoute.addChildren([
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

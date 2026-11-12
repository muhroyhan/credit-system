import { Container, Title } from "@mantine/core";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { AdminUsersPage } from "@web/features/admin-users/AdminUsersPage";
import { DashboardPage } from "@web/features/auth/DashboardPage";
import { LoginPage } from "@web/features/auth/LoginPage";

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
export const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, loginRoute, adminRoute]),
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

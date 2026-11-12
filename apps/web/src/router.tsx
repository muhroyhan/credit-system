import { Container, Title } from "@mantine/core";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
} from "@tanstack/react-router";
import {
  AdminPage,
  Dashboard,
} from "@web/features/auth/presentation/Dashboard";
import { Login } from "@web/features/auth/presentation/Login";

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
  component: Dashboard,
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-users",
  component: AdminPage,
});
export const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, loginRoute, adminRoute]),
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

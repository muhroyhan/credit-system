import { Container, Title } from '@mantine/core';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
} from '@tanstack/react-router';
import { adminUsersRoutes } from '@web/features/admin-users/admin-users.routes';
import { LoginPage } from '@web/features/auth/LoginPage';
import { companiesRoutes } from '@web/features/companies/companies.routes';
import { DashboardPage } from '@web/features/dashboard/DashboardPage';
import {
  employeesRoutes,
  registrationRoutes,
} from '@web/features/employees/employees.routes';

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
  path: '/',
  component: DashboardPage,
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin-users',
  component: Outlet,
});
const companyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies',
  component: Outlet,
});
const employeeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees',
  component: Outlet,
});
const registrationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/registration',
  component: Outlet,
});
export const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    loginRoute,
    adminUsersRoutes(adminRoute),
    companiesRoutes(companyRoute),
    employeesRoutes(employeeRoute),
    registrationRoutes(registrationRoute),
  ]),
});
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

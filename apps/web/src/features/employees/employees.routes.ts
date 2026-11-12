import { type AnyRoute, createRoute } from '@tanstack/react-router';
import { EmployeesAddPage } from '@web/features/employees/EmployeesAddPage';
import { EmployeesEditPage } from '@web/features/employees/EmployeesEditPage';
import { EmployeesPage } from '@web/features/employees/EmployeesPage';
import { EmployeesViewPage } from '@web/features/employees/EmployeesViewPage';
import { RegistrationPage } from '@web/features/employees/RegistrationPage';
import { createCrudRoutes } from '@web/utils/create-crud-routes';
export function employeesRoutes<T extends AnyRoute>(parent: T) {
  return createCrudRoutes(parent, {
    list: EmployeesPage,
    add: EmployeesAddPage,
    edit: EmployeesEditPage,
    view: EmployeesViewPage,
  });
}
export function registrationRoutes<T extends AnyRoute>(parent: T) {
  return parent.addChildren([
    createRoute({
      getParentRoute: () => parent,
      path: '$slug',
      component: RegistrationPage,
    }),
  ]);
}

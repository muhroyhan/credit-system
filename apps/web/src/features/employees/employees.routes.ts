import type { AnyRoute } from '@tanstack/react-router';
import { EmployeesAddPage } from '@web/features/employees/EmployeesAddPage';
import { EmployeesEditPage } from '@web/features/employees/EmployeesEditPage';
import { EmployeesPage } from '@web/features/employees/EmployeesPage';
import { EmployeesViewPage } from '@web/features/employees/EmployeesViewPage';
import { createCrudRoutes } from '@web/utils/create-crud-routes';
export function employeesRoutes<T extends AnyRoute>(parent: T) {
  return createCrudRoutes(parent, {
    list: EmployeesPage,
    add: EmployeesAddPage,
    edit: EmployeesEditPage,
    view: EmployeesViewPage,
  });
}

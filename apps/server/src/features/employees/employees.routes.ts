import type { AuthEnv } from '@server/constant/interface';
import { employeesController } from '@server/features/employees/employees.controller';
import type { EmployeesRoutes } from '@server/features/employees/employees.type';
import { identityContext } from '@server/middleware/identity-context.middleware';
import { Hono } from 'hono';

export function employeesRoutes() {
  const app = new Hono<AuthEnv>();
  const register = app.post('/register', employeesController.register);
  const create = app.post(
    '/create',
    identityContext,
    employeesController.create,
  );
  const list = app.get('/list', identityContext, employeesController.list);
  const detail = app.get(
    '/detail',
    identityContext,
    employeesController.detail,
  );
  const update = app.put(
    '/update',
    identityContext,
    employeesController.update,
  );
  const remove = app.put(
    '/delete',
    identityContext,
    employeesController.remove,
  );
  return app as Hono<
    AuthEnv,
    EmployeesRoutes<
      typeof register,
      typeof create,
      typeof list,
      typeof detail,
      typeof update,
      typeof remove
    >
  >;
}

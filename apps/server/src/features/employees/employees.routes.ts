import type { AuthEnv } from '@server/constant/interface';
import { employeesController } from '@server/features/employees/employees.controller';
import type { EmployeesRoutes } from '@server/features/employees/employees.type';
import { documentBodyLimit } from '@server/middleware/document-body-limit.middleware';
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
  const profile = app.put(
    '/profile',
    identityContext,
    employeesController.profile,
  );
  const upload = app.post(
    '/documents',
    identityContext,
    documentBodyLimit,
    employeesController.upload,
  );
  const document = app.get(
    '/document',
    identityContext,
    employeesController.document,
  );
  const exporting = app.get(
    '/export',
    identityContext,
    employeesController.exportFile,
  );
  return app as Hono<
    AuthEnv,
    EmployeesRoutes<
      typeof register,
      typeof create,
      typeof list,
      typeof detail,
      typeof update,
      typeof remove,
      typeof profile,
      typeof upload,
      typeof document,
      typeof exporting
    >
  >;
}

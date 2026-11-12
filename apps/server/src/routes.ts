import type { AuthEnv } from '@server/constant/interface';
import type { SchemaOf } from '@server/constant/type';
import { adminUsersRoutes } from '@server/features/admin-users/admin-users.routes';
import { authRoutes } from '@server/features/auth/auth.routes';
import { companiesRoutes } from '@server/features/companies/companies.routes';
import { employeesRoutes } from '@server/features/employees/employees.routes';
import { healthRoutes } from '@server/features/health/health.routes';
import { referenceRoutes } from '@server/features/reference/reference.routes';
import { Hono } from 'hono';
import type { MergeSchemaPath } from 'hono/types';

export function routes() {
  const app = new Hono<AuthEnv>();
  const health = healthRoutes(app);
  const auth = authRoutes(app);
  const reference = referenceRoutes(app);
  const admin = adminUsersRoutes();
  const companies = companiesRoutes();
  const employees = employeesRoutes();
  app.route('/admin-user', admin);
  app.route('/user', companies);
  app.route('/debitor', employees);
  type ApiSchema = SchemaOf<typeof health> &
    SchemaOf<typeof auth> &
    SchemaOf<typeof reference> &
    MergeSchemaPath<SchemaOf<typeof admin>, '/admin-user'> &
    MergeSchemaPath<SchemaOf<typeof companies>, '/user'> &
    MergeSchemaPath<SchemaOf<typeof employees>, '/debitor'>;
  return app as Hono<AuthEnv, ApiSchema>;
}

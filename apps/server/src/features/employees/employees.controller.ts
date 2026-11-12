import {
  adminDeleteSchema,
  employeeCreateSchema,
  employeeQuerySchema,
  employeeRegisterSchema,
  employeeUpdateSchema,
  idQuerySchema,
} from '@credit/contracts';
import type { AuthEnv } from '@server/constant/interface';
import {
  EmployeeConflict,
  EmployeeForbidden,
  EmployeeNotFound,
} from '@server/features/employees/employees.error';
import { employeesService } from '@server/features/employees/employees.service';
import type { Context } from 'hono';

function failure(c: Context<AuthEnv>, error: unknown) {
  if (error instanceof EmployeeForbidden) {
    return c.json({ error: 'forbidden' }, 403);
  }
  if (error instanceof EmployeeNotFound) {
    return c.json({ error: 'not found' }, 404);
  }
  if (error instanceof EmployeeConflict) {
    return c.json({ error: error.message }, 409);
  }
  throw error;
}
async function register(c: Context<AuthEnv>) {
  const parsed = employeeRegisterSchema.safeParse(
    await c.req.json().catch(() => null),
  );
  if (!parsed.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    return c.json({ id: await employeesService.register(parsed.data) }, 201);
  } catch (error) {
    return failure(c, error);
  }
}
async function create(c: Context<AuthEnv>) {
  const parsed = employeeCreateSchema.safeParse(
    await c.req.json().catch(() => null),
  );
  if (!parsed.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    return c.json(
      { id: await employeesService.save(parsed.data, c.get('identity')) },
      201,
    );
  } catch (error) {
    return failure(c, error);
  }
}
async function update(c: Context<AuthEnv>) {
  const parsed = employeeUpdateSchema.safeParse(
    await c.req.json().catch(() => null),
  );
  if (!parsed.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  const { id, ...input } = parsed.data;
  try {
    return c.json({
      id: await employeesService.save(input, c.get('identity'), id),
    });
  } catch (error) {
    return failure(c, error);
  }
}
async function list(c: Context<AuthEnv>) {
  const parsed = employeeQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: 'invalid query' }, 400);
  }
  try {
    return c.json(await employeesService.list(parsed.data, c.get('identity')));
  } catch (error) {
    return failure(c, error);
  }
}
async function detail(c: Context<AuthEnv>) {
  const parsed = idQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: 'invalid id' }, 400);
  }
  try {
    return c.json(
      await employeesService.detail(parsed.data.id, c.get('identity')),
    );
  } catch (error) {
    return failure(c, error);
  }
}
async function remove(c: Context<AuthEnv>) {
  const parsed = adminDeleteSchema.safeParse(
    await c.req.json().catch(() => null),
  );
  if (!parsed.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    return c.json({
      id: await employeesService.remove(parsed.data.id, c.get('identity')),
    });
  } catch (error) {
    return failure(c, error);
  }
}
export const employeesController = {
  register,
  create,
  update,
  list,
  detail,
  remove,
};

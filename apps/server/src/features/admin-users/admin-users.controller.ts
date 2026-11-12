import {
  adminCreateSchema,
  adminDeleteSchema,
  adminListQuerySchema,
  adminUpdateSchema,
  idQuerySchema,
} from '@credit/contracts';
import type { AuthEnv } from '@server/constant/interface';
import {
  AdminConflict,
  AdminNotFound,
} from '@server/features/admin-users/admin-users.error';
import { adminUsersService } from '@server/features/admin-users/admin-users.service';
import type { Context } from 'hono';

async function list(c: Context<AuthEnv>) {
  const query = adminListQuerySchema.safeParse(c.req.query());
  if (!query.success) {
    return c.json({ error: 'invalid query' }, 400);
  }
  return c.json(await adminUsersService.list(query.data));
}
async function exportFile(c: Context<AuthEnv>) {
  const query = adminListQuerySchema
    .omit({ page: true, limit: true })
    .safeParse(c.req.query());
  const format = c.req.query('format');
  if (!query.success || (format !== 'pdf' && format !== 'xlsx')) {
    return c.json({ error: 'invalid query' }, 400);
  }
  const data = await adminUsersService.exportFile(
    { ...query.data, page: 1, limit: 20 },
    format,
  );
  c.header(
    'Content-Type',
    format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  c.header(
    'Content-Disposition',
    `attachment; filename="admin-users.${format}"`,
  );
  return c.body(data);
}
async function detail(c: Context<AuthEnv>) {
  const id = idQuerySchema.safeParse(c.req.query());
  if (!id.success) {
    return c.json({ error: 'invalid id' }, 400);
  }
  const result = await adminUsersService.detail(id.data.id);
  if (!result) {
    return c.json({ error: 'not found' }, 404);
  }
  return c.json(result);
}
async function create(c: Context<AuthEnv>) {
  const input = adminCreateSchema.safeParse(
    await c.req.json().catch(() => null),
  );
  if (!input.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    const id = await adminUsersService.save(
      input.data,
      String(c.get('identity').id),
    );
    return c.json({ id }, 201);
  } catch (error) {
    if (error instanceof AdminConflict) {
      return c.json({ error: error.message }, 409);
    }
    throw error;
  }
}
async function update(c: Context<AuthEnv>) {
  const input = adminUpdateSchema.safeParse(
    await c.req.json().catch(() => null),
  );
  if (!input.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    const { id, ...data } = input.data;
    await adminUsersService.save(data, String(c.get('identity').id), id);
    return c.json({ id });
  } catch (error) {
    if (error instanceof AdminConflict) {
      return c.json({ error: error.message }, 409);
    }
    if (error instanceof AdminNotFound) {
      return c.json({ error: 'not found' }, 404);
    }
    throw error;
  }
}
async function remove(c: Context<AuthEnv>) {
  const input = adminDeleteSchema.safeParse(
    await c.req.json().catch(() => null),
  );
  if (!input.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  if (!(await adminUsersService.remove(input.data.id))) {
    return c.json({ error: 'not found' }, 404);
  }
  return c.json({ id: input.data.id });
}
export const adminUsersController = {
  list,
  exportFile,
  detail,
  create,
  update,
  remove,
};

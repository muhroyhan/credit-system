import {
  adminCreateSchema,
  adminDeleteSchema,
  adminListQuerySchema,
  adminUpdateSchema,
  ExportTypeEnum,
  idQuerySchema,
} from '@credit/contracts';
import type { AuthEnv } from '@server/constant/interface';
import { adminUsersService } from '@server/features/admin-users/admin-users.service';
import { controllerFailure, parseJsonInput } from '@server/utils/controller';
import { exportHeaders } from '@server/utils/export-file';
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
  if (
    !query.success ||
    (format !== ExportTypeEnum.PDF &&
      format !== ExportTypeEnum.XLSX &&
      format !== ExportTypeEnum.CSV)
  ) {
    return c.json({ error: 'invalid query' }, 400);
  }
  const data = await adminUsersService.exportFile(
    { ...query.data, page: 1, limit: 20 },
    format,
  );
  return c.body(data, 200, exportHeaders('admin-users', format));
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
  const input = await parseJsonInput(c, adminCreateSchema);
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
    return controllerFailure(c, error);
  }
}
async function update(c: Context<AuthEnv>) {
  const input = await parseJsonInput(c, adminUpdateSchema);
  if (!input.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    const { id, ...data } = input.data;
    await adminUsersService.save(data, String(c.get('identity').id), id);
    return c.json({ id });
  } catch (error) {
    return controllerFailure(c, error);
  }
}
async function remove(c: Context<AuthEnv>) {
  const input = await parseJsonInput(c, adminDeleteSchema);
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

import {
  adminDeleteSchema,
  type EmployeeDocumentKind,
  employeeCreateSchema,
  employeeDocumentKindSchema,
  employeeDocumentKinds,
  employeeProfileUpdateSchema,
  employeeQuerySchema,
  employeeRegisterSchema,
  employeeUpdateSchema,
  idQuerySchema,
} from '@credit/contracts';
import type { AuthEnv } from '@server/constant/interface';
import {
  EmployeeConflict,
  EmployeeForbidden,
  EmployeeInvalid,
  EmployeeNotFound,
} from '@server/features/employees/employees.error';
import { employeesService } from '@server/features/employees/employees.service';
import type { EmployeeDocumentInput } from '@server/features/employees/employees.type';
import type { Context } from 'hono';

function failure(c: Context<AuthEnv>, error: unknown) {
  if (error instanceof EmployeeInvalid) {
    return c.json({ error: error.message }, 400);
  }
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
async function profile(c: Context<AuthEnv>) {
  const parsed = employeeProfileUpdateSchema.safeParse(
    await c.req.json().catch(() => null),
  );
  if (!parsed.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    return c.json({
      id: await employeesService.saveProfile(
        parsed.data.id,
        parsed.data.profile,
        c.get('identity'),
      ),
    });
  } catch (error) {
    return failure(c, error);
  }
}
async function upload(c: Context<AuthEnv>) {
  const body = await c.req.formData().catch(() => null);
  const parsed = idQuerySchema.safeParse({ id: body?.get('id') });
  if (
    !body ||
    !parsed.success ||
    Array.from(body.keys()).some(
      (key) =>
        key !== 'id' && !employeeDocumentKinds.some((kind) => kind === key),
    )
  ) {
    return c.json({ error: 'invalid request' }, 400);
  }
  const files: Partial<Record<EmployeeDocumentKind, EmployeeDocumentInput>> =
    {};
  for (const kind of employeeDocumentKinds) {
    const entries = body.getAll(kind);
    if (entries.length > 1) {
      return c.json({ error: 'Satu file per jenis' }, 400);
    }
    const file = entries[0];
    if (file !== undefined) {
      if (typeof file === 'string') {
        return c.json({ error: 'invalid file' }, 400);
      }
      files[kind] = {
        name: file.name,
        type: file.type,
        bytes: new Uint8Array(await file.arrayBuffer()),
      };
    }
  }
  try {
    return c.json({
      id: await employeesService.upload(
        parsed.data.id,
        files,
        c.get('identity'),
      ),
    });
  } catch (error) {
    return failure(c, error);
  }
}
async function document(c: Context<AuthEnv>) {
  const parsed = idQuerySchema.safeParse(c.req.query());
  const kind = employeeDocumentKindSchema.safeParse(c.req.query('kind'));
  if (!parsed.success || !kind.success) {
    return c.json({ error: 'invalid query' }, 400);
  }
  try {
    const result = await employeesService.document(
      parsed.data.id,
      kind.data,
      c.get('identity'),
    );
    c.header(
      'Content-Type',
      result.extension === 'pdf'
        ? 'application/pdf'
        : result.extension === 'png'
          ? 'image/png'
          : 'image/jpeg',
    );
    c.header(
      'Content-Disposition',
      `attachment; filename="${kind.data}.${result.extension}"`,
    );
    c.header('Cache-Control', 'private, no-store');
    c.header('X-Content-Type-Options', 'nosniff');
    return c.body(result.bytes);
  } catch (error) {
    return failure(c, error);
  }
}
async function exportFile(c: Context<AuthEnv>) {
  const parsed = employeeQuerySchema.safeParse(c.req.query());
  const format = c.req.query('format');
  if (!parsed.success || (format !== 'pdf' && format !== 'xlsx')) {
    return c.json({ error: 'invalid query' }, 400);
  }
  try {
    const file = await employeesService.exportFile(
      parsed.data,
      c.get('identity'),
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
      `attachment; filename="employees.${format}"`,
    );
    return c.body(file);
  } catch (error) {
    return failure(c, error);
  }
}
export const employeesController = {
  profile,
  upload,
  document,
  exportFile,
  register,
  create,
  update,
  list,
  detail,
  remove,
};

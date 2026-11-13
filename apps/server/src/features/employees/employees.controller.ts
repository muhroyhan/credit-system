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
import { employeesService } from '@server/features/employees/employees.service';
import type { EmployeeDocumentInput } from '@server/features/employees/employees.type';
import { controllerFailure, parseJsonInput } from '@server/utils/controller';
import { exportHeaders } from '@server/utils/export-file';
import type { Context } from 'hono';

async function register(c: Context<AuthEnv>) {
  const parsed = await parseJsonInput(c, employeeRegisterSchema);
  if (!parsed.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    return c.json({ id: await employeesService.register(parsed.data) }, 201);
  } catch (error) {
    return controllerFailure(c, error);
  }
}
async function create(c: Context<AuthEnv>) {
  const parsed = await parseJsonInput(c, employeeCreateSchema);
  if (!parsed.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    return c.json(
      { id: await employeesService.save(parsed.data, c.get('identity')) },
      201,
    );
  } catch (error) {
    return controllerFailure(c, error);
  }
}
async function update(c: Context<AuthEnv>) {
  const parsed = await parseJsonInput(c, employeeUpdateSchema);
  if (!parsed.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  const { id, ...input } = parsed.data;
  try {
    return c.json({
      id: await employeesService.save(input, c.get('identity'), id),
    });
  } catch (error) {
    return controllerFailure(c, error);
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
    return controllerFailure(c, error);
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
    return controllerFailure(c, error);
  }
}
async function remove(c: Context<AuthEnv>) {
  const parsed = await parseJsonInput(c, adminDeleteSchema);
  if (!parsed.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    return c.json({
      id: await employeesService.remove(parsed.data.id, c.get('identity')),
    });
  } catch (error) {
    return controllerFailure(c, error);
  }
}
async function profile(c: Context<AuthEnv>) {
  const parsed = await parseJsonInput(c, employeeProfileUpdateSchema);
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
    return controllerFailure(c, error);
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
    return controllerFailure(c, error);
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
    return c.body(new Uint8Array(result.bytes).buffer);
  } catch (error) {
    return controllerFailure(c, error);
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
    return c.body(file, 200, exportHeaders('employees', format));
  } catch (error) {
    return controllerFailure(c, error);
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

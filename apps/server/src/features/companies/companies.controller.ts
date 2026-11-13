import {
  AccountTypeEnum,
  adminDeleteSchema,
  companyCreateSchema,
  companyQuerySchema,
  companyUpdateSchema,
  ExportTypeEnum,
  idQuerySchema,
} from '@credit/contracts';
import type { AuthEnv } from '@server/constant/interface';
import { companiesService } from '@server/features/companies/companies.service';
import { controllerFailure, parseJsonInput } from '@server/utils/controller';
import { exportHeaders } from '@server/utils/export-file';
import type { Context } from 'hono';

async function list(c: Context<AuthEnv>) {
  const parsed = companyQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: 'invalid query' }, 400);
  }
  return c.json(await companiesService.list(parsed.data));
}
async function detail(c: Context<AuthEnv>) {
  const parsed = idQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: 'invalid id' }, 400);
  }
  const result = await companiesService.detail(parsed.data.id);
  return result ? c.json(result) : c.json({ error: 'not found' }, 404);
}
async function create(c: Context<AuthEnv>) {
  const parsed = await parseJsonInput(c, companyCreateSchema);
  if (!parsed.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    return c.json(
      {
        id: await companiesService.save(
          parsed.data,
          String(c.get('identity').id),
        ),
      },
      201,
    );
  } catch (error) {
    return controllerFailure(c, error);
  }
}
async function update(c: Context<AuthEnv>) {
  const parsed = await parseJsonInput(c, companyUpdateSchema);
  if (!parsed.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  const { id, ...input } = parsed.data;
  try {
    await companiesService.save(input, String(c.get('identity').id), id);
    return c.json({ id });
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
    return (await companiesService.remove(parsed.data.id))
      ? c.json({ id: parsed.data.id })
      : c.json({ error: 'not found' }, 404);
  } catch (error) {
    return controllerFailure(c, error);
  }
}
async function interests(c: Context<AuthEnv>) {
  const identity = c.get('identity');
  const slug = c.req.query('slug') ?? identity.slug;
  if (!slug) {
    return c.json({ error: 'slug required' }, 400);
  }
  if (identity.type !== AccountTypeEnum.Admin && identity.slug !== slug) {
    return c.json({ error: 'forbidden' }, 403);
  }
  return c.json(await companiesService.interests(slug));
}
async function exportFile(c: Context<AuthEnv>) {
  const parsed = companyQuerySchema
    .omit({ page: true, limit: true })
    .safeParse(c.req.query());
  const format = c.req.query('format');
  if (
    !parsed.success ||
    (format !== ExportTypeEnum.PDF &&
      format !== ExportTypeEnum.XLSX &&
      format !== ExportTypeEnum.CSV)
  ) {
    return c.json({ error: 'invalid query' }, 400);
  }
  const file = await companiesService.exportFile(
    { ...parsed.data, page: 1, limit: 20 },
    format,
  );
  return c.body(file, 200, exportHeaders('companies', format));
}
export const companiesController = {
  list,
  detail,
  create,
  update,
  remove,
  interests,
  exportFile,
};

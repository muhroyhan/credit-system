import {
  adminDeleteSchema,
  companyCreateSchema,
  companyQuerySchema,
  companyUpdateSchema,
  idQuerySchema,
} from '@credit/contracts';
import type { AuthEnv } from '@server/constant/interface';
import {
  CompanyConflict,
  CompanyNotFound,
} from '@server/features/companies/companies.error';
import { companiesService } from '@server/features/companies/companies.service';
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
  const parsed = companyCreateSchema.safeParse(
    await c.req.json().catch(() => null),
  );
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
    if (error instanceof CompanyConflict) {
      return c.json({ error: error.message }, 409);
    }
    throw error;
  }
}
async function update(c: Context<AuthEnv>) {
  const parsed = companyUpdateSchema.safeParse(
    await c.req.json().catch(() => null),
  );
  if (!parsed.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  const { id, ...input } = parsed.data;
  try {
    await companiesService.save(input, String(c.get('identity').id), id);
    return c.json({ id });
  } catch (error) {
    if (error instanceof CompanyConflict) {
      return c.json({ error: error.message }, 409);
    }
    if (error instanceof CompanyNotFound) {
      return c.json({ error: 'not found' }, 404);
    }
    throw error;
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
    return (await companiesService.remove(parsed.data.id))
      ? c.json({ id: parsed.data.id })
      : c.json({ error: 'not found' }, 404);
  } catch (error) {
    if (error instanceof CompanyConflict) {
      return c.json({ error: error.message }, 409);
    }
    throw error;
  }
}
async function interests(c: Context<AuthEnv>) {
  const identity = c.get('identity');
  const slug = c.req.query('slug') ?? identity.slug;
  if (!slug) {
    return c.json({ error: 'slug required' }, 400);
  }
  if (identity.type !== 'admin' && identity.slug !== slug) {
    return c.json({ error: 'forbidden' }, 403);
  }
  return c.json(await companiesService.interests(slug));
}
async function exportFile(c: Context<AuthEnv>) {
  const parsed = companyQuerySchema
    .omit({ page: true, limit: true })
    .safeParse(c.req.query());
  const format = c.req.query('format');
  if (!parsed.success || (format !== 'pdf' && format !== 'xlsx')) {
    return c.json({ error: 'invalid query' }, 400);
  }
  const file = await companiesService.exportFile(
    { ...parsed.data, page: 1, limit: 20 },
    format,
  );
  c.header(
    'Content-Type',
    format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  c.header('Content-Disposition', `attachment; filename="companies.${format}"`);
  return c.body(file);
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

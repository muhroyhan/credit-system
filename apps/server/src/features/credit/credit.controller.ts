import {
  adminDeleteSchema,
  creditApplicationSchema,
  creditConfirmationSchema,
  creditQuerySchema,
  creditUpdateRequestSchema,
  idQuerySchema,
} from '@credit/contracts';
import type { AuthEnv } from '@server/constant/interface';
import { creditService } from '@server/features/credit/credit.service';
import { controllerFailure, parseJsonInput } from '@server/utils/controller';
import { exportHeaders } from '@server/utils/export-file';
import type { Context } from 'hono';

async function status(c: Context<AuthEnv>) {
  const input = idQuerySchema.safeParse(c.req.query());
  if (!input.success) {
    return c.json({ error: 'invalid id' }, 400);
  }
  try {
    return c.json(await creditService.status(input.data.id, c.get('identity')));
  } catch (error) {
    return controllerFailure(c, error);
  }
}
async function confirm(c: Context<AuthEnv>) {
  const input = await parseJsonInput(c, creditConfirmationSchema);
  if (!input.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    return c.json({
      id: await creditService.confirm(input.data, c.get('identity')),
    });
  } catch (error) {
    return controllerFailure(c, error);
  }
}

async function cancel(c: Context<AuthEnv>) {
  const input = await parseJsonInput(c, adminDeleteSchema);
  if (!input.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    return c.json({
      id: await creditService.cancel(input.data.id, c.get('identity')),
    });
  } catch (error) {
    return controllerFailure(c, error);
  }
}

async function list(c: Context<AuthEnv>) {
  const input = creditQuerySchema.safeParse(c.req.query());
  if (!input.success) {
    return c.json({ error: 'invalid query' }, 400);
  }
  try {
    return c.json(await creditService.list(input.data, c.get('identity')));
  } catch (error) {
    return controllerFailure(c, error);
  }
}
async function detail(c: Context<AuthEnv>) {
  const input = idQuerySchema.safeParse(c.req.query());
  if (!input.success) {
    return c.json({ error: 'invalid id' }, 400);
  }
  try {
    return c.json(await creditService.detail(input.data.id, c.get('identity')));
  } catch (error) {
    return controllerFailure(c, error);
  }
}
async function create(c: Context<AuthEnv>) {
  const input = await parseJsonInput(c, creditApplicationSchema);
  if (!input.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    return c.json(
      { id: await creditService.save(input.data, c.get('identity')) },
      201,
    );
  } catch (error) {
    return controllerFailure(c, error);
  }
}
async function update(c: Context<AuthEnv>) {
  const input = await parseJsonInput(c, creditUpdateRequestSchema);
  if (!input.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    if ('status' in input.data) {
      return c.json({
        id: await creditService.approve(input.data, c.get('identity')),
      });
    }
    const { id, ...application } = input.data;
    return c.json({
      id: await creditService.save(application, c.get('identity'), id),
    });
  } catch (error) {
    return controllerFailure(c, error);
  }
}
async function simulation(c: Context<AuthEnv>) {
  const input = await parseJsonInput(c, creditApplicationSchema);
  if (!input.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    return c.json(
      await creditService.simulation(input.data, c.get('identity')),
    );
  } catch (error) {
    return controllerFailure(c, error);
  }
}
async function rates(c: Context<AuthEnv>) {
  const input = idQuerySchema.safeParse(c.req.query());
  if (!input.success) {
    return c.json({ error: 'invalid id' }, 400);
  }
  try {
    return c.json(await creditService.rates(input.data.id, c.get('identity')));
  } catch (error) {
    return controllerFailure(c, error);
  }
}
async function exporting(c: Context<AuthEnv>) {
  const input = creditQuerySchema.safeParse(c.req.query());
  const format = c.req.query('format');
  if (
    !input.success ||
    (format !== 'pdf' && format !== 'xlsx' && format !== 'csv')
  ) {
    return c.json({ error: 'invalid query' }, 400);
  }
  try {
    const file = await creditService.exportFile(
      input.data,
      c.get('identity'),
      format,
    );
    return c.body(file, 200, exportHeaders('credits', format));
  } catch (error) {
    return controllerFailure(c, error);
  }
}
export const creditController = {
  status,
  confirm,
  cancel,
  list,
  detail,
  create,
  update,
  simulation,
  rates,
  exporting,
};

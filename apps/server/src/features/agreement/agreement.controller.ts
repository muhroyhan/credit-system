import { adminDeleteSchema, idQuerySchema } from '@credit/contracts';
import type { AuthEnv } from '@server/constant/interface';
import { agreementService } from '@server/features/agreement/agreement.service';
import { controllerFailure, parseJsonInput } from '@server/utils/controller';
import type { Context } from 'hono';

async function render(c: Context<AuthEnv>) {
  const input = await parseJsonInput(c, adminDeleteSchema);
  if (!input.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    return c.json(
      await agreementService.generate(input.data.id, c.get('identity')),
    );
  } catch (error) {
    return controllerFailure(c, error);
  }
}
async function download(c: Context<AuthEnv>) {
  const query = idQuerySchema.safeParse(c.req.query());
  if (!query.success) {
    return c.json({ error: 'invalid id' }, 400);
  }
  try {
    const bytes = await agreementService.download(
      query.data.id,
      c.get('identity'),
    );
    return c.body(new Uint8Array(bytes), 200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="agreement-${query.data.id}.pdf"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
  } catch (error) {
    return controllerFailure(c, error);
  }
}
async function count(c: Context<AuthEnv>) {
  const query = idQuerySchema.safeParse(c.req.query());
  if (!query.success) {
    return c.json({ error: 'invalid id' }, 400);
  }
  try {
    return c.json(
      await agreementService.count(query.data.id, c.get('identity')),
    );
  } catch (error) {
    return controllerFailure(c, error);
  }
}
export const agreementController = { render, download, count };

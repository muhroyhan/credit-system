import type { AuthEnv } from '@server/constant/interface';
import {
  Conflict,
  Forbidden,
  InvalidInput,
  NotFound,
} from '@server/utils/service-error';
import type { Context } from 'hono';
import type { z } from 'zod';

/** Parses JSON in controllers; unexpected read failures remain internal errors. */
export async function parseJsonInput<T extends z.ZodType>(
  c: Context<AuthEnv>,
  schema: T,
) {
  const body = await c.req.json().catch((error: unknown) => {
    if (error instanceof SyntaxError) {
      return null;
    }
    throw error;
  });
  return schema.safeParse(body);
}

/** Maps known service failures only, retaining the existing API error contract. */
export function controllerFailure(c: Context<AuthEnv>, error: unknown) {
  if (error instanceof InvalidInput) {
    return c.json({ error: error.message }, 400);
  }
  if (error instanceof Forbidden) {
    return c.json({ error: 'forbidden' }, 403);
  }
  if (error instanceof NotFound) {
    return c.json({ error: 'not found' }, 404);
  }
  if (error instanceof Conflict) {
    return c.json({ error: error.message }, 409);
  }
  throw error;
}

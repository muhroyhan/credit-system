import {
  creditQuerySchema,
  creditReviewSchema,
  idQuerySchema,
} from '@credit/contracts';
import type { AuthEnv } from '@server/constant/interface';
import {
  CreditConflict,
  CreditForbidden,
  CreditInvalid,
  CreditNotFound,
} from '@server/features/credit/credit.error';
import { creditReviewService } from '@server/features/credit-review/credit-review.service';
import type { Context } from 'hono';

function failure(c: Context<AuthEnv>, error: unknown) {
  if (error instanceof CreditInvalid) {
    return c.json({ error: error.message }, 400);
  }
  if (error instanceof CreditForbidden) {
    return c.json({ error: 'forbidden' }, 403);
  }
  if (error instanceof CreditNotFound) {
    return c.json({ error: 'not found' }, 404);
  }
  if (error instanceof CreditConflict) {
    return c.json({ error: error.message }, 409);
  }
  throw error;
}
async function review(c: Context<AuthEnv>) {
  const input = creditReviewSchema.safeParse(
    await c.req.json().catch(() => null),
  );
  if (!input.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    return c.json(
      await creditReviewService.review(input.data, c.get('identity')),
    );
  } catch (error) {
    return failure(c, error);
  }
}
async function reviewList(c: Context<AuthEnv>) {
  const query = creditQuerySchema.safeParse(c.req.query());
  if (!query.success) {
    return c.json({ error: 'invalid query' }, 400);
  }
  try {
    return c.json(
      await creditReviewService.reviewList(query.data, c.get('identity')),
    );
  } catch (error) {
    return failure(c, error);
  }
}
async function reviewDetail(c: Context<AuthEnv>) {
  const input = idQuerySchema.safeParse(c.req.query());
  if (!input.success) {
    return c.json({ error: 'invalid id' }, 400);
  }
  try {
    return c.json(
      await creditReviewService.reviewDetail(input.data.id, c.get('identity')),
    );
  } catch (error) {
    return failure(c, error);
  }
}
async function reviewExport(c: Context<AuthEnv>) {
  const query = creditQuerySchema.safeParse(c.req.query());
  const format = c.req.query('format');
  if (!query.success || (format !== 'pdf' && format !== 'xlsx')) {
    return c.json({ error: 'invalid query' }, 400);
  }
  try {
    const result = await creditReviewService.exportReviews(
      query.data,
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
      `attachment; filename="credit-reviews.${format}"`,
    );
    return c.body(result);
  } catch (error) {
    return failure(c, error);
  }
}
export const creditReviewController = {
  review,
  reviewList,
  reviewDetail,
  reviewExport,
};

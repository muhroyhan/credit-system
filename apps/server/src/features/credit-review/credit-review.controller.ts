import {
  creditQuerySchema,
  creditReviewSchema,
  idQuerySchema,
} from '@credit/contracts';
import type { AuthEnv } from '@server/constant/interface';
import { creditReviewService } from '@server/features/credit-review/credit-review.service';
import { controllerFailure, parseJsonInput } from '@server/utils/controller';
import { exportHeaders } from '@server/utils/export-file';
import type { Context } from 'hono';

async function review(c: Context<AuthEnv>) {
  const input = await parseJsonInput(c, creditReviewSchema);
  if (!input.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  try {
    return c.json(
      await creditReviewService.review(input.data, c.get('identity')),
    );
  } catch (error) {
    return controllerFailure(c, error);
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
    return controllerFailure(c, error);
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
    return controllerFailure(c, error);
  }
}
async function reviewExport(c: Context<AuthEnv>) {
  const query = creditQuerySchema.safeParse(c.req.query());
  const format = c.req.query('format');
  if (
    !query.success ||
    (format !== 'pdf' && format !== 'xlsx' && format !== 'csv')
  ) {
    return c.json({ error: 'invalid query' }, 400);
  }
  try {
    const result = await creditReviewService.exportReviews(
      query.data,
      c.get('identity'),
      format,
    );
    return c.body(result, 200, exportHeaders('credit-reviews', format));
  } catch (error) {
    return controllerFailure(c, error);
  }
}
export const creditReviewController = {
  review,
  reviewList,
  reviewDetail,
  reviewExport,
};

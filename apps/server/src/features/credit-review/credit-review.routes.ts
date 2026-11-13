import type { AuthEnv } from '@server/constant/interface';
import type { SchemaOf } from '@server/constant/type';
import { creditReviewController } from '@server/features/credit-review/credit-review.controller';
import { identityContext } from '@server/middleware/identity-context.middleware';
import { Hono } from 'hono';
export function creditReviewRoutes() {
  const app = new Hono<AuthEnv>();
  const review = app.put('/', identityContext, creditReviewController.review);
  const list = app.get(
    '/list',
    identityContext,
    creditReviewController.reviewList,
  );
  const detail = app.get(
    '/detail',
    identityContext,
    creditReviewController.reviewDetail,
  );
  const exporting = app.get(
    '/export',
    identityContext,
    creditReviewController.reviewExport,
  );
  const zip = app.get(
    '/export-zip',
    identityContext,
    creditReviewController.exportZip,
  );
  return app as Hono<
    AuthEnv,
    SchemaOf<typeof review> &
      SchemaOf<typeof list> &
      SchemaOf<typeof detail> &
      SchemaOf<typeof exporting> &
      SchemaOf<typeof zip>
  >;
}

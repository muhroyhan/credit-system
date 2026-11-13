import type { AuthEnv } from '@server/constant/interface';
import type { SchemaOf } from '@server/constant/type';
import { creditController } from '@server/features/credit/credit.controller';
import { creditReviewRoutes } from '@server/features/credit-review/credit-review.routes';
import { identityContext } from '@server/middleware/identity-context.middleware';
import { Hono } from 'hono';
import type { MergeSchemaPath } from 'hono/types';

export function creditRoutes() {
  const app = new Hono<AuthEnv>();
  const list = app.get('/list', identityContext, creditController.list);
  const detail = app.get('/detail', identityContext, creditController.detail);
  const rates = app.get('/rates', identityContext, creditController.rates);
  const create = app.post('/create', identityContext, creditController.create);
  const update = app.put('/update', identityContext, creditController.update);
  const cancel = app.put('/cancel', identityContext, creditController.cancel);
  const status = app.get('/status', identityContext, creditController.status);
  const confirm = app.put(
    '/confirm',
    identityContext,
    creditController.confirm,
  );
  const review = creditReviewRoutes();
  app.route('/review', review);
  const simulation = app.post(
    '/simulation',
    identityContext,
    creditController.simulation,
  );
  const exporting = app.get(
    '/export',
    identityContext,
    creditController.exporting,
  );
  return app as Hono<
    AuthEnv,
    SchemaOf<typeof list> &
      SchemaOf<typeof rates> &
      SchemaOf<typeof detail> &
      SchemaOf<typeof create> &
      SchemaOf<typeof update> &
      SchemaOf<typeof cancel> &
      SchemaOf<typeof status> &
      SchemaOf<typeof confirm> &
      MergeSchemaPath<SchemaOf<typeof review>, '/review'> &
      SchemaOf<typeof simulation> &
      SchemaOf<typeof exporting>
  >;
}

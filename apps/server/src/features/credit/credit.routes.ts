import type { AuthEnv } from '@server/constant/interface';
import type { SchemaOf } from '@server/constant/type';
import { creditController } from '@server/features/credit/credit.controller';
import { identityContext } from '@server/middleware/identity-context.middleware';
import { Hono } from 'hono';

export function creditRoutes() {
  const app = new Hono<AuthEnv>();
  const list = app.get('/list', identityContext, creditController.list);
  const detail = app.get('/detail', identityContext, creditController.detail);
  const rates = app.get('/rates', identityContext, creditController.rates);
  const create = app.post('/create', identityContext, creditController.create);
  const update = app.put('/update', identityContext, creditController.update);
  const review = app.put('/review', identityContext, creditController.review);
  const reviewList = app.get(
    '/review/list',
    identityContext,
    creditController.reviewList,
  );
  const reviewDetail = app.get(
    '/review/detail',
    identityContext,
    creditController.reviewDetail,
  );
  const reviewExport = app.get(
    '/review/export',
    identityContext,
    creditController.reviewExport,
  );
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
      SchemaOf<typeof review> &
      SchemaOf<typeof reviewList> &
      SchemaOf<typeof reviewDetail> &
      SchemaOf<typeof reviewExport> &
      SchemaOf<typeof simulation> &
      SchemaOf<typeof exporting>
  >;
}

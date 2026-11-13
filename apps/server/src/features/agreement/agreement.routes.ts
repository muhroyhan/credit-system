import type { AuthEnv } from '@server/constant/interface';
import type { SchemaOf } from '@server/constant/type';
import { agreementController } from '@server/features/agreement/agreement.controller';
import { identityContext } from '@server/middleware/identity-context.middleware';
import { Hono } from 'hono';

export function agreementRoutes() {
  const app = new Hono<AuthEnv>();
  const download = app.get('/', identityContext, agreementController.download);
  const count = app.get('/count', identityContext, agreementController.count);
  const render = app.post(
    '/render',
    identityContext,
    agreementController.render,
  );
  return app as Hono<
    AuthEnv,
    SchemaOf<typeof download> & SchemaOf<typeof count> & SchemaOf<typeof render>
  >;
}

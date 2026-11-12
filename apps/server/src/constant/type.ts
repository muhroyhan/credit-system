import type { connectDatabase } from '@credit/database/client';
import type { Hono } from 'hono';

export type DatabaseTransaction = Parameters<
  Parameters<ReturnType<typeof connectDatabase>['db']['transaction']>[0]
>[0];
export type SchemaOf<T> =
  T extends Hono<infer _E, infer S, infer _P> ? S : never;

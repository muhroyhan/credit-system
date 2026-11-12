import type { Hono } from "hono";
export type SchemaOf<T> =
  T extends Hono<infer _E, infer S, infer _P> ? S : never;

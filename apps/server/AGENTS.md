# Backend

The dependency order is global routes → feature routes → controller → service →
repository. Tests may import the unit under test. Credit applications and BPR
reviews are separate features; review services may reuse the credit repository,
and review routes share the credit URL prefix.

- `app.ts` mounts `/api` once and exports `AppType`. Define method, path and
  middleware in feature routes, using a `new Hono()` instance and separate
  method calls. Controllers handle requests and responses; use `input` for
  validated bodies, `query` for filters and `result` for service results.
- Apply authentication, required permission/scope, Zod validation, service and
  response in that order. Public routes stay public. Malformed JSON is invalid
  input; do not disguise internal errors as validation failures. Inspect routes,
  contracts and tests for existing status and response behavior.
- Services own business rules and business errors. A non-GET service opens one
  `withTransaction` and passes the same transaction to all DB operations; let
  errors escape for rollback. Non-DB work can happen before the transaction.
- Repositories query and map typed data; they do not start transactions or create
  business errors. Return concrete DTOs, null, booleans or IDs, select public
  columns explicitly and never expose password hashes. For nontransactional
  reads obtain `connectDatabase().db` once per function. Close the pool only at
  application or standalone runner shutdown. Audit actors come from the server;
  MySQL manages `createdAt` and `updatedAt`.
- Middleware is created when used, imported by feature routes and accesses
  business rules through services. Wrap built-in middleware in the same folder.
  ACL uses `PROGRAM_ACTION` via `permission(...)`; inspect shared contracts and
  existing routes for program and action mappings.
- Preserve Hono RPC types while combining routes. The frontend may import
  `AppType` with `import type`, never server code or secrets into its bundle.
- Exports use `utils/export-file.ts` and `exportHeaders`; services reuse listing
  queries without pagination, preserving filters, sort and scope. ZIP exports
  read only server-generated private keys, at most five in parallel, and return
  an empty archive when appropriate. Do not fetch client or external URLs.
- `utils/controller.ts` handles JSON and service-error categories; feature
  errors inherit shared categories. Use `utils/password.ts` for password hashes
  and typed `saveChild` for credit children with the service transaction. Put
  feature-specific utilities under that feature and shared utilities in
  `src/utils`.

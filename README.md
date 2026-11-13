# Credit System

Credit System is a multi-tenant credit application for bank administrators, HR
staff and employees. It brings registration, employee profiles, credit
simulation and applications, HR and bank review, customer confirmation,
agreement documents, exports and dashboards into one workflow.

The MVP is complete. A Bun/Hono API and React/Vite frontend run together with
MySQL, Drizzle and shared Zod contracts. See [open risks and decisions](docs/logic-holes.md)
before changing business behavior or migrating existing data.

## Getting started

Install Bun, Node.js, pnpm 10.18.0 (as specified in `package.json`) and Docker
with Compose. Docker runs MySQL 8.4 only; run the application and tools locally.
Use synthetic local data and credentials, never production data or secrets.

1. Run `pnpm install` from the repository root.
2. Copy `.env.example` to `.env`. Set `MYSQL_ROOT_PASSWORD`, `DATABASE_URL` and
   `JWT_SECRET`; the URL must match the local credentials, database and port.
   Configure bank identity fields if generating agreements.
3. Run `docker compose up -d` and wait for MySQL to become ready.
4. Run `pnpm db:migrate`. To load synthetic accounts, set `SEED_SYNTHETIC=true`
   and `SEED_PASSWORD` to at least eight characters in the environment, then
   run `pnpm db:seed`. The database name must match `credit_*development` or
   `credit_*test`. See [seed.ts](packages/database/src/seed.ts) for account names.
5. Run `pnpm dev` and open the Vite URL printed in the terminal. Vite proxies
   `/api` to `localhost:3000`. For the combined build, run `pnpm build` then
   `pnpm start`; `PORT` controls the server port.

Bun loads `.env` from the working directory. Set environment variables in the
shell for Node-based test runners rather than assuming they load `.env`.
Migrations are explicit and do not run at build or startup. The current single
baseline is for an empty database; if the baseline changes or migration history
differs, use a new disposable database. Do not discard an existing database or
volume as a routine reset. Existing data needs a separately designed migration.

Private documents default to `.data/documents`; `DOCUMENT_STORAGE_DIR` can
override this. Preserve that directory in deployment and serve files through the
authorized API. Agreement generation requires `AGREEMENT_BANK_NAME`,
`AGREEMENT_BANK_ADDRESS` and `AGREEMENT_BANK_REPRESENTATIVE`;
`AGREEMENT_LATE_FEE_PERCENT` defaults to 0.2. WhatsApp delivery uses the
`WHATSAPP_*` and `PUBLIC_APP_URL` settings in `.env.example`, including an
approved template whose first body parameter is the status URL. Live delivery
was not tested in the recorded MVP verification.

## Checks and tests

| Purpose                            | Command                                                 |
| ---------------------------------- | ------------------------------------------------------- |
| Lint / typecheck / build           | `pnpm lint` / `pnpm typecheck` / `pnpm build`           |
| Unit tests                         | `pnpm test:unit`                                        |
| Integration and HTTP tests         | `pnpm test:integration`                                 |
| Browser E2E tests                  | `pnpm test:e2e`                                         |
| Generate baseline / migrate / seed | `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:seed` |

Integration and E2E tests need a separate disposable local MySQL database named
`credit_*test`, migrated and seeded with synthetic data. Set `DATABASE_URL`,
`JWT_SECRET`, `SEED_PASSWORD`, `SEED_SYNTHETIC=true` and
`DOCUMENT_STORAGE_DIR` to a directory inside `.data/qa`; remove live WhatsApp
credentials. Set the three agreement bank identity variables for successful PDF
cases. Install the Playwright browser matching the dependency or set
`PLAYWRIGHT_BROWSER_PATH` to a compatible local executable. Tests use the
Asia/Jakarta timezone. Do not run integration and E2E suites simultaneously
against the same seeded dataset. The test runner starts its own server on port
3100. Clean up only disposable test resources after the runners stop.

## Repository

- `apps/server`: API, business services and server-side exports.
- `apps/web`: React application.
- `packages/contracts`: shared schemas, enums and DTOs.
- `packages/database`: schema, migration, connection and synthetic seed.
- `packages/test-utils` and `tests`: test helpers and full-stack tests.

For contribution conventions and architecture constraints, see
[AGENTS.md](AGENTS.md). For help or to propose a change, open an issue in this
repository; contributions can be submitted as pull requests for maintainer
review. Git history records the MVP plans and verification details.

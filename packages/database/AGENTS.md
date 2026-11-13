# Database

Inspect the physical schema, current DDL and relevant queries before changing
schema or constraints. Use the Drizzle runners described in the
[README](../../README.md); migrations do not run during build or startup. Pool
and transaction rules are in the [backend instructions](../../apps/server/AGENTS.md).

While the project is not in production, maintain the single
`drizzle/0000_baseline.sql` and snapshot using `pnpm db:generate`. The baseline
is for empty databases. Never rewrite the history of a database containing data;
use a new disposable local database when the baseline changes. If deployed data
or a different migration history must be supported, design and verify a separate
forward migration instead of assuming the baseline handles it.

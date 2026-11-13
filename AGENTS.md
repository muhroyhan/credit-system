# Agent instructions

The MVP phases P00–P13 are complete. Improve the existing application without
changing business rules unless the user instructs it. Inspect the implementation,
contracts, schema and tests before changing behavior; distinguish requirements,
implementation and verification. Record unresolved risks, compatibility impacts
and decisions in [logic-holes.md](docs/credit-system/logic-holes.md).

## Architecture

One Bun/Hono deployment serves the API and React/Vite assets. MySQL uses Drizzle;
the UI uses Mantine, TanStack Router and Query, React Hook Form and Zod. The
workspace uses pnpm, Turbo, Biome and strict TypeScript. Setup and commands are
in [README.md](README.md).

- Server features use `feature.routes.ts`, `feature.controller.ts`,
  `feature.service.ts`, `feature.repository.ts`, `feature.type.ts`, and an
  optional error file. Middleware has one function per file.
- Web features use feature pages, routes, API and type files, with feature
  hooks, components and utilities in their own directories. Shared components
  and utilities live under `src/components` and `src/utils`.
- `packages/contracts` owns shared Zod schemas and DTOs; `packages/database`
  owns physical schema, connections, migration and seed; `packages/test-utils`
  owns synthetic fixtures and adapters. Shared definitions within an app use
  the appropriate files under `src/constant`.
- Import packages through `@credit/...` public exports and app code through
  `@server/*` or `@web/*`; keep TypeScript, runtime and test resolution aligned.
  Use `import type` and `export type` for type dependencies. Backend principal
  symbols use featureCamelCaseLayer. Feature types and schemas belong in
  `feature.type.ts`, feature constants in `feature.constant.ts`.
- Repeated domain choices use one `as const` enum object and same-named union
  per `kebab-case.enum.ts`. Place feature-only enums in that feature, app-wide
  enums in the app's `src/enums`, and cross-app or shared DTO enums in contracts.
  Zod, comparisons and UI share that definition. Column names, paths and free
  text are not enums.

## TypeScript and style

Biome is the formatting source: two spaces, single quotes, explicit semicolons,
target width 80 and braces for control blocks. Prefer interfaces for object
shapes, type aliases for unions, conditional types and Zod inference; use `T[]`
for simple arrays and `Array<T>` for complex elements. Imports go first; prefer
named exports and function declarations for named factories and handlers.
Default exports are reserved for `*.config.ts` and Bun `index.ts` entries;
external default imports are allowed when required by the dependency.

Keep strict compiler checks, including isolated modules, verbatim module syntax,
unchecked indexed access, unused, casing, override and fallthrough checks. Do
not introduce blanket suppressions, fake ambient declarations, `any`, non-null
assertions or disabled strictness to bypass errors. Return types may be inferred,
especially for Hono/TanStack composition. Document public exports and utilities
with JSDoc describing their boundaries. Packages remain private and export
TypeScript source; public distribution needs a separate artifact design.

## Work and verification

- Use synthetic data and credentials for development and tests. Docker is for
  local MySQL only; run the app, tooling and tests on the host.
- Work in a custom branch. Check the branch before starting and before each
  commit; do not commit on `main` or a detached HEAD. Use focused commits with
  `<type>(optional scope): <imperative lowercase subject>`, at most 50
  characters, no final period; wrap body at 72 characters. For tracked phase
  tasks, retain their `Pxx-Tyy` identifier in a `Task: Pxx-Tyy` footer. Record
  task status, decisions and commit identifiers where the work is tracked.
- For improvements, run checks and tests appropriate to the change; report
  actual results and limitations. For a phase's final verification run lint,
  typecheck, build and relevant full suites. Keep permanent tests and fixtures;
  remove temporary test scripts. Schema changes require migration review and
  seed updates where needed. Unresolved business decisions block only dependent
  work.
- The P13 record from 13 November 2026 reports lint, typecheck and build passing,
  plus 317 unit, 203 Vitest integration, 7 HTTP integration and 23 browser E2E
  cases on disposable MySQL. Live WhatsApp delivery was not tested. This is
  historical evidence for that revision, not a claim about later changes.

Read the directory instructions for [server](apps/server/AGENTS.md),
[web](apps/web/AGENTS.md), [database](packages/database/AGENTS.md), and
[E2E](tests/e2e/AGENTS.md). Historic MVP documents are available in Git history.

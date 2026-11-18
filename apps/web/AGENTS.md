# Frontend

Use [DESIGN.md](DESIGN.md) as the primary guide for frontend layout and visual
design, including proposed custom design work.

Components use hooks/use cases; RPC and DTO mapping live in `feature.api.ts`.
Each feature hook has its own file named after the hook. Import package types
directly from public exports. Dashboard, auth, credit applications, BPR review
and registration are separate features; share contracts without duplicating
implementation.

Use `src/utils/api-client.ts` and `download-file.ts` for shared transport and
downloads. DTO validation stays in the feature. Use `toExportQuery` from
`search-params.ts` to copy filters without mutating the caller's query.

The root router defines `/`, `/login` and feature prefixes; feature routes use
`createCrudRoutes`. Standard list, add, edit and view pages provide filtering,
sorting, pagination and export; view pages display text rather than disabled
inputs. Reuse `CrudPage`, `ListingTable`, `RecordState`,
`DetailFields`, `DeleteAction` and `FormActions` from `src/components/crud`.

TanStack Router handles routing and Query handles API state. Include session and
parameters in query keys, invalidate related queries after mutations, and clear
cache on logout. React Hook Form uses the Zod resolver and displays field errors;
show loading, empty, success and failure states as appropriate.

Use `src/hooks/useListing.ts` with explicit filters, keys, API and invalidation.
Each listing has one `[queries, setQueries]` state for filters, sort and
pagination; empty filters are `undefined` and omitted from URLs. List and export
share state; filter or sort changes reset the page to one.

CRUDA gates protect pages and actions before content or queries mount, including
direct URLs. UI permissions are a login snapshot; API authorization remains
mandatory. Inspect the existing contracts and routes for session and permissions.

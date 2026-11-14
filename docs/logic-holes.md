# Risks and compatibility decisions

This post-MVP register tracks open questions, limitations and decisions that
constrain improvements. P00–P13 are complete. Historical analysis IDs identify
risks in the original system; they do not prove each remains a current defect.
Check source, tests and history before acting. Business-rule changes require user
direction. Earlier MVP plans and verification records remain in Git history.

## Open business and product decisions

| ID | Risk or decision needed |
| --- | --- |
| QA-01 | Company interest validation accepts finite, nonnegative numeric strings, including exponent notation or whitespace, while the credit simulator accepts digits and optional decimal fractions. Decide on a consistent input format; ordinary decimals and simulator rejection of exponent notation were tested, not every schema-accepted form. |
| SUPPORT-03, SUPPORT-11 | Debtor login does not check company status; public slugs include inactive and blocked tenants. A product decision is required before restricting these behaviors. |
| SUPPORT-16 | Administrators can delete themselves or the last administrator, risking loss of access. Decide whether to add a guard. |
| FLOW-07, SUPPORT-04, SUPPORT-15 | Customer cancellation sets BPR status to rejected but leaves HRD status approved, so HRD-based open-credit and dashboard totals still include it. `totalUsers` counts active/inactive companies globally for all actors; `totalDebitor` is global for admins, tenant-scoped for HRD and zero for debtors. `totalCredits` sums nominal amounts by HRD pending/approved/completed status within actor scope, not outstanding balances. Change only with a business decision. |
| FLOW-08, FE-01 | The simulator uses flat monthly interest and an informational score comparing monthly salary with total principal. Do not silently replace the formula or labels. |
| FLOW-10, FE-07, FE-08 | Agreement numbers are stable and globally unique per credit creation month, allocated with a monthly counter and credit lock in a transaction; the number snapshots company name and month. They require two approvals, acknowledgment and complete bank details. Re-rendering reuses the stored number. The eight-article template uses new wording, flat monthly interest, configured bank identity and an initial late fee of 0.2% per day. Official article/letter text, bank identity and interest/fee labels still need authoritative confirmation. |
| SUPPORT-05 | Parent/child writes are transactional, but conflict checks can race without a physical uniqueness constraint. Account creation/update locks the company and uses current reads; external writers bypassing the service still require a constraint after data audit. |
| Contract/query/form duplication | Shared pagination, admin/company password validation and list DTO factories, plus local employee ownership and auth permission query extraction, remain candidates. Do not conflate employee password rules or tenant scopes without a decision. |

## Compatibility and operational risks

- Listing APIs accept an optional `search` parameter that OR-matches the text
  columns named in each listing. Existing per-column parameters remain supported
  and combine with `search` as additional filters. List, count and exports use
  the same criteria and tenant scope. New sort keys cover visible columns;
  clients using old sort keys remain supported. Search retains MySQL LIKE
  wildcard and collation behavior, which may differ from literal matching.
  Credit search also matches partial company and debtor IDs as text; the older
  exact ID API parameters remain available to clients that require exact match.
- The frontend now has a classic-sidebar shell. Direct-route access gates,
  permission-dependent actions, public flows and existing dashboard aggregate
  meanings must remain intact in further design work. Mobile navigation uses a
  Mantine Drawer. Responsive tests check Escape dismissal and focus return on
  mobile; a complete assistive-technology audit is still outstanding. Remaining
  custom proposals are in `design-improvement.md`.
- P08 stores expense snapshots as `DECIMAL(30,2)` and calculates in cents, a
  change from the original integer dictionary. Check legacy data compatibility.
  Stamp duty is Rp10,000 and fixed savings Rp100,000. The snapshot and decision
  commit together; repeated decisions conflict. Notifications happen after
  commit, do not roll it back and have no durable queue or automatic retry. A
  crash can lose a notification; live WhatsApp delivery has not been tested.
- HRD decisions are limited to the owning tenant's HRD, pending to approved or
  rejected, with server-owned scope and audit. Approved/rejected are locked;
  other legacy statuses including completed/null have no defined HRD transition.
  Handling those records requires a business decision.
- Migration 0005 could overwrite `created_at` on updates; 0006 stopped that but
  cannot restore overwritten dates. Check historical sources before using
  affected dates for agreement numbering. The current single baseline applies
  to empty databases and does not automatically migrate older histories or
  convert legacy ACL `WRITE` to granular CRUD. The runner rejects mismatched
  histories; design and verify a separate legacy-data migration.
- Profile document columns now store server-generated private keys mapped to
  authorized download endpoints. Legacy external URLs are not fetched and need
  a storage migration. Upload limits are 10 MB per file and 64 MB per request;
  signature, MIME and extension are checked but not antivirus. Storage is
  outside SQL transactions: compensation removes new files on failure, but a
  crash or failed cleanup can leave orphan files for reconciliation.
- Verify telephone/NUMBER mappings, unsigned coordinates, amount precision,
  nullable DTOs, child cardinality and orphan data before migrating existing
  records. Derived scores and aggregates are not automatically stored columns;
  conceptual relations are not necessarily physical foreign keys or unique
  constraints. Inspect the schema and DDL.

## Technical limitations

- The 14 November frontend source audit in `design-audit.md` led to shared
  responsive form/filter grids and grouped details across CRUD features. Browser
  coverage now checks all feature page patterns at three widths, public card
  colors and page overflow. It is not a pixel-baseline or full accessibility
  audit. Fonts use fallbacks unless installed locally. Lookup-selector proposals
  depend on authorized data sources and must preserve tenant scopes/contracts.
- The recorded audit found sixteen `as never` assertions in RPC gateways,
  including four P05 manual controller query validations. They weaken end-to-end
  input type checking; verify current code and use typed Hono validators before
  claiming end-to-end request type safety.
- Frontend type checking still needs ambient Bun types through the `AppType`
  graph. Independent RPC declarations would improve browser type isolation.
- `skipLibCheck` remains enabled: a prior probe failed on Bun/Node dependency
  declarations, optional Drizzle drivers and Hono/jsPDF DOM types. Do not add
  fake ambient stubs to hide the problem.
- JSDoc coverage and function-declaration preferences were incomplete in the
  audit. Hono schema composition and jsPDF output casts do not prove runtime
  validity; response validation is not uniform across DTOs.
- UI permissions are a login snapshot and can become stale; the server
  revalidates. Unbounded exports hold generated data or documents in server
  memory. Review limits and streaming before scaling.

## Historical risk inventory

These identifiers were recorded against the original business source. They are
investigation prompts, not current-defect assertions.

| IDs | Original concern to recheck |
| --- | --- |
| FLOW-01/02/03, FLOW-14 | Credit ownership, role/field authorization, tenant scopes, state transitions and server validation. P07 restricted HRD decisions as described above. |
| FLOW-04/05/09, FE-06 | Duplicate approvals, partial fee payloads, expense calculations and transaction boundaries; P08 implemented transactional snapshots and repeat conflicts. |
| FLOW-06, FE-03/04/15 | Bank account, name confirmation, acknowledgment and two-approval prerequisites; sequencing save, document generation and redirects. |
| FLOW-11/12/13, SUPPORT-12/13 | Export/document ownership, untrusted URLs, child writes, audit actor and timestamps, file validation and storage cleanup. |
| SUPPORT-10, FE-11 | Amount parsing, zero/division and tenor configuration. P06 accepts digits or dot-separated thousands, requires positive configured tenor and caps tenor at 12 months below Rp8 million. |
| FE-02/09/10/16 | Profile form validation, file/base64 handling, password regex and date offset. P05 uses field validation, separate private file keys, a non-global password regex and calendar dates without adding seven hours. |
| FE-12/13/17 | Admin credit form lock, acknowledgment field spelling, and shared menu/ACL abbreviations. Verify implementation and mapping before changing them. |
| SUPPORT-01/02/08/09/14, FE-05 | Identity and role revalidation, explicit action ACL, request validation, server audit and page gates were implemented in P02–P04; check coverage for the affected feature. |
| SUPPORT-06/07, FE-14 | Empty arrays delete company configuration; child records must belong to the company, updates use user ID, and `bungaPercentage` is consistent. |
| FLOW-15 | Keep database and provider secrets in environment configuration, never client bundles. |

## Verification context

On 13 November 2026 P13 recorded passing lint, typecheck and build, 317 unit,
203 Vitest integration, 7 HTTP integration and 23 browser E2E cases with
disposable MySQL and synthetic data. Live Meta delivery was not tested. These
results describe that revision only; they do not prove later changes or all
inputs, browsers and concurrency interleavings. Consult Git history for the
full historic test and phase records.

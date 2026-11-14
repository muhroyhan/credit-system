# Frontend design audit — 14 November 2026

Status: source audit and proposed layout decisions; no UI or business-rule changes.
Reviewed all feature page entry points, their shared CRUD wrappers and form
components, DESIGN.md, and the existing responsive test. This is not a new visual
browser, contrast or assistive-technology verification. Earlier passing E2E tests
establish behavior only within their assertions, not complete visual compliance.

## Reference interpretation

- [Figr: eight golden rules](https://figr.design/blog/eight-golden-rules-interface-design-understanding):
  consistency, accessible use, feedback, completion, prevention, reversibility,
  control and reduced memory burden guide this review.
- [AdminLTE: dashboard design](https://adminlte.io/blog/admin-dashboard-design/):
  retain the classic sidebar and prioritize readable operational records,
  hierarchy, restrained color, clear numerals and deliberate loading/empty states.

The column counts and widths below are project-specific design recommendations,
not prescriptions from either article. Preserve the supplied design tokens and
use standard Mantine Grid, SimpleGrid, Paper, Group and Stack composition.

## Coverage by feature

| Feature | Pages reviewed | Findings and proposed layout |
| --- | --- | --- |
| Admin users | list, add, edit, detail | List has 3 filters plus 2 sort controls in an unconstrained Group. Add/edit share AdminUserForm: account fields and per-program permissions are one long Stack. Use 2 columns for account fields, a separate 2-column permissions section, and a full-row action group. Detail should group account identity and permissions instead of a flat role list. |
| Companies | list, add, edit, detail | List has 5 filters plus 2 sort controls. CompanyForm mixes identity, credentials, status and repeating rates/fees. Use 2 columns for main fields; each rate row has 2 fields and a separate remove action; each fee row can have 3 data columns when wide enough. Detail needs aligned rate/fee rows and explicit empty sections. |
| Employees | list, add, edit, detail | List has 2 filters plus 2 sort controls. Add uses the account form only. Edit has 3 independently saved forms: account, profile and documents. Use 2 columns for account/profile fields, 2 columns for document tiles and full-row addresses. Separate section headings and action groups must make save boundaries visible. Detail needs identity, address, contact, employment/income and document groups. |
| Credit applications | list, add, edit, detail, thanks | List has 2 filters plus 2 sort controls. CreditForm is one wide Stack with an interleaved rates table and a pipe-separated simulation summary. Use 2 columns for inputs; give rates/results their own full-row sections. Detail mixes facts, HRD decisions and customer confirmation; distinguish these sections. Bank confirmation fields use 2 columns, acknowledgment full row. Thanks remains a focused completion message with existing document actions. |
| Credit review/BPR | list, decision edit, detail | List has 5 filters plus 2 sort controls, including numeric IDs. No add page exists. Decision form has 4 fields in a wide Stack and no debtor identity beside them. Use 2 columns with a read-only record summary above; keep the decision and submit controls together. Detail needs grouped financial values and separate HRD/BPR statuses. |
| Authentication/registration | login, public registration | Narrow containers exist but lack white Paper cards and gray viewport backgrounds. Use 1 column in a centered card of roughly 420–480px, with responsive padding and vertical scrolling on short screens. |
| Dashboard | summary | Cards are present but contain undifferentiated text. Separate label/value hierarchy without changing metric definitions; preserve scope and units. |

## Shared listing findings

1. **High — filters have no defined grid.** `ListingTable` renders filters in
   Group; field widths and wrapping depend on available space. Establish a filter
   grid with 1 mobile, 2 tablet and up to 3 desktop columns, using actual available
   content width. Aim for at least 220–240px per field. Put sorting in a distinct
   group so the last row of domain filters is not mixed with sort controls.
2. **High — primary action is visually subordinate to exports.** Add is a plain
   link in the same Group as 3–4 filled export buttons. Place a Mantine button-link
   near the title; use secondary/outline export actions, keeping all formats and
   current query semantics. A standard Menu is optional if labels remain clear.
3. **Medium — pagination consumes a full row as NumberInput.** Use a compact
   pagination region with the current page and total. Preserve the current
   20-record page size and behavior; no new page-size control is implied.
4. **Medium — errors can also show “Tidak ada data”.** With no rows and loading
   false, ListingTable shows that text even if a request failed. Separate initial
   loading, refetch, failed request, genuinely empty results and filtered-empty
   results when known. Do not mask errors or discard existing rows.
5. **Medium — financial presentation is inconsistent.** Credit and BPR list/detail
   values include raw numeric strings. Display Rupiah, tenor units and numeric
   alignment consistently without changing numeric precision or calculations.
6. **Medium — technical labels reach users.** Several sort options show keys such
   as createdAt and jumlahPengajuan; raw status values also appear. Use a shared
   display-label mapping while retaining enum values and request parameters.
7. **Medium — row actions have competing emphasis.** Lihat/Ubah are text links
   beside a filled destructive Hapus button. Keep navigation obvious, use restrained
   destructive styling and retain confirmation and existing permissions.

## Form layout decision

Use **2 columns as the desktop default** for related short fields; **1 column on
mobile**. Tablet may use 2 only when both controls have enough space after sidebar
and card padding. Base decisions on usable form width, not device names alone.
Use a form content width around 800–960px; lists can continue to use wider space.
Do not expand short input fields across the entire XL content container.

Use **3 columns only within repeated short-data rows**, such as company fee name,
type and amount, when at least approximately 900px of inner width is available.
At narrower widths use 2 or 1. Keep helper/error text associated with its field;
place remove actions in a separate aligned cell or row. Never squeeze all forms
into 3 columns to reduce page height.

Full-row elements: section headings, addresses, rate tables, simulation results,
alerts, acknowledgment and save/back actions. Preserve reading and keyboard order
row by row. Each independently submitted employee form keeps its own labeled
save action; do not introduce a misleading global “save all”.

## Additional UX findings

- **High — ID recall:** employee creation asks admins to read a comma-separated
  company list and type an ID; credit creation asks for an employee ID; BPR
  filtering asks for company/debtor IDs. Searchable selectors would reduce errors,
  but require checking permitted lookup data, scale and endpoint support first.
- **High — decision context:** BPR edit lacks the debtor/company summary shown on
  detail. Display existing query identity and current statuses beside the decision
  so users can verify the affected record before committing.
- **Medium — duplicate decision feedback:** BPR edit can render both parent
  notification and mutation-result alerts after save. Consolidate presentation
  while preserving the distinction between saved decision and notification outcome.
- **Medium — optional edit password:** admin/company/employee edit password fields
  need explicit helper text describing existing blank-password behavior after
  confirming each form's contract. Do not infer one shared password rule.
- **Medium — document guidance:** upload fields show accepted formats via accept,
  but lack visible file size/format guidance. Reflect existing server limits in
  help text and distinguish selected files from already stored documents.
- **Medium — detail hierarchy:** DetailFields produces flat label/value text. Use
  grouped read-only fields with clear headings and wrapping for long values;
  present missing values consistently. Avoid disabled inputs on detail pages.
- **Medium — mobile navigation:** AppShell navbar supports close and Escape but
  lacks the modal focus behavior described in the guide. Prefer standard Mantine
  Drawer for overlay navigation and verify focus return and keyboard access.
- **Medium — typography/theme:** blue Mantine primary differs from the retained
  green token; Inter is requested but not bundled; JetBrains Mono is not applied.
  Define deliberate theme mappings, fallbacks and contrast checks. Preserve token
  values rather than silently replacing the source palette.

## Required DESIGN.md clarifications

The document is directionally aligned with both references but is too permissive
to produce consistent layouts. It needs explicit page patterns and measurable
acceptance criteria rather than another broad stylistic description:

- State white cards on the shared #F0F0F0 background for public login/registration;
  define card width, viewport padding and short-screen scrolling.
- Adopt the filter/sort layout and per-feature form decisions above. Separate
  full-width page surfaces from constrained form content width.
- Define list header, primary add action, exports, numeric columns, status labels
  and pagination placement. Define employee save boundaries and decision context.
- Resolve competing H1 values (2.25rem versus 2.5rem); specify a single operational
  page-title scale while reserving hero sizing for an actual hero use case.
- Separate source tokens, semantic aliases and implemented theme values. The old
  “Surface” yellow token must not be confused with the white card surface.
- Match the second golden rule to the source's universal usability: cover novice
  users and accessibility in addition to expert efficiency.
- Keep product-dependent undo, unsaved-change protection, lookup selectors and
  preferences separate from simple Mantine layout work. Do not require new APIs
  or workflow changes as a consequence of a visual guideline.
- Add acceptance coverage for every feature's list/add/edit/detail where present,
  long labels, empty/error/loading states, dynamic fee rows, upload controls,
  permissions, zoom and keyboard use. Existing responsive tests inspect only an
  admin list/form and do not assert login/card colors or complete visual quality.

## Suggested order

First fix shared filters, form widths/columns, public-page surfaces and decision
context. Next improve detail groups, action hierarchy, financial formatting and
feedback. Finally verify accessibility and assess lookup/custom interaction work.
All recommendations preserve current fields, endpoint parameters, authorization,
credit formulas and transitions unless separately approved.

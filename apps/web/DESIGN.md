# Frontend design guide

This is the primary frontend design reference for Credit System. Use standard
Mantine components and responsive props; prefer composition over custom skins.
Inspect existing routes, permissions, contracts and tests before implementation.
Visual changes do not authorize changes to business rules, calculations, scopes,
workflow transitions or API behavior. Record custom proposals in this document
before implementation.

The guide applies [Shneiderman's eight golden rules](https://figr.design/blog/eight-golden-rules-interface-design-understanding)
and the [AdminLTE classic-sidebar dashboard pattern](https://adminlte.io/blog/admin-dashboard-design/).
The dimensions below are project decisions, not requirements from those sources.

## Visual foundations

Use a light, calm operational interface for frequent record review and data
entry. Favor hierarchy, readable density and whitespace over decoration, nested
cards and animation. Use consistent Indonesian labels, meaningful feedback and
existing data without inventing metrics or comparisons.

| Original token    | Value     | Use                                              |
| ----------------- | --------- | ------------------------------------------------ |
| Primary           | `#2ECC40` | Brand and primary actions; Mantine brand shade 6 |
| Secondary         | `#005691` | Navigation and secondary controls                |
| Tertiary          | `#FFFFFF` | Content surfaces                                 |
| Neutral           | `#333333` | Main text and dark neutral surfaces              |
| Surface           | `#FFD700` | Warning and attention, not the card background   |
| Accent            | `#FF8C00` | Secondary emphasis                               |
| Additional accent | `#9370DB` | Limited emphasis                                 |
| Light neutral     | `#F0F0F0` | Page background and muted surfaces               |

Use semantic success, warning and danger colors sparingly with text or icons;
never communicate status by color alone. Primary buttons use Mantine auto-contrast
with dark text. Verify text contrast of at least 4.5:1, or 3:1 for large text,
and 3:1 for controls and focus indicators. Keep Mantine control dimensions.

Use Inter for interface text and JetBrains Mono for technical values with
fallbacks. These fonts are requested by the theme but are not bundled. The
operational H1 is 2.25rem at weight 700; H2 is 1.5rem; body is 1rem at weight
400 and 1.6 line-height; labels/captions are 0.875rem at weight 500. A future
hero may use `clamp(2.5rem, 5vw, 4rem)` at weight 700. Limit prose to about
72ch. Use an 8px base spacing and radius, approximately 16px inside groups and
24px between major sections. Keep motion functional and respect reduced motion.

## Shell and public pages

Authenticated pages use a classic sidebar around 250px wide, a compact top bar
and a fluid content area. The sidebar scrolls independently, shows only existing
permitted destinations, and marks the current page visually and semantically.
The top bar contains session context, logout and the mobile menu trigger.
Direct-route gates and server authorization remain mandatory.

Below Mantine's `sm` breakpoint, hide the desktop sidebar and use a Mantine
Drawer with keyboard access, Escape, focus management and focus return. Use about
16px content padding on mobile and 24–32px on desktop; allow actions to wrap.

Login and registration remain outside the authenticated shell: a single-column
form in a white Paper card, up to 480px wide, on a full-viewport `#F0F0F0`
background. Use responsive padding and allow vertical scrolling on short screens.
Preserve account selection, tenant context, fields, links and feedback. Apply a
similarly focused layout to public completion pages when applicable.

## Page patterns

### Dashboard

Show the page title and session context followed by a responsive grid of simple
summary cards. Distinguish labels, counts, monetary values and units. Preserve
existing aggregate meanings and actor scope described in
[logic-holes.md](../../docs/logic-holes.md); do not add targets, trends or
comparisons without data and a separate product decision.

### Listings

Order the page as title; permitted add action with secondary export controls;
one search input and structured filters; results; pagination and total. The
search label names the fields matched with OR:

| Listing                                     | Search fields                                    |
| ------------------------------------------- | ------------------------------------------------ |
| Admin User                                  | Username, email                                  |
| Perusahaan                                  | Company name, username, email                    |
| Master Karyawan                             | Name, alias                                      |
| Pengajuan Kredit and Daftar Kredit Karyawan | Debtor name, company name, company ID, debtor ID |

Status and entity filters remain separate. Filters use one column, two from
480px and three from 760px of available container width. List and export share
filter and sort state; changing either resets the page to one. Search supports
partial ID matching; legacy exact ID API parameters remain available. Sort using
header buttons with a direction indicator and `aria-sort` on the active column.
The default is creation date descending; clicking another column starts ascending,
then toggles direction.

Use `ListingTable` and Mantine `Table`. Keep rows and actions easy to scan,
right-align financial numbers where practical, and retain all essential columns.
Wide tables use a labeled, keyboard-accessible horizontal scroll region rather
than page-level overflow. Distinguish loading, errors and genuinely empty results;
do not imply an error means there is no data. Keep pagination and totals truthful.

### Forms and details

Use `CrudPage`, `DetailFields`, `FormActions` and `RecordState` as appropriate.
Read-only details are labeled text grouped by subject, not disabled inputs; wrap
long values and represent absent data consistently. Use related section headings,
labels above fields, required indicators and nearby help and validation messages.
Preserve input on recoverable errors. Place permitted save and back/cancel actions
together where applicable; do not promise unsaved-change protection.

`FormSection` limits form content to 960px. `FieldsGrid` uses one column below
580px of available width and two from 580px. A third column from 900px is reserved
for short repeated fee fields. Addresses, headings, tables, alerts, acknowledgments
and actions span the grid or sit outside it. Maintain logical reading and keyboard
order; descriptions and errors stay associated with their fields.

| Feature            | Form layout and boundaries                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Admin User         | Two-column account and per-program permission fields                                                                            |
| Perusahaan         | Two-column main fields and rates; up to three fee fields per row                                                                |
| Karyawan           | Separate account, profile and document forms, each with its own save action; two-column fields/documents and full-row addresses |
| Pengajuan Kredit   | Two-column amount, tenor and date; separate rates and simulation sections                                                       |
| Keputusan BPR      | Identity and status summary above two-column decision fields; one result notification                                           |
| Konfirmasi nasabah | Two-column bank fields; acknowledgment and submit below                                                                         |

Present simulation results, rates and expenses with their existing labels,
precision and units. Format monetary strings without rounding, and use tabular
numerals where available. Visually separate destructive actions and preserve
existing confirmations, permissions, status transitions and decision eligibility.
Never imply a committed action can be undone if the system cannot do so.

## Interaction and accessibility

Apply the eight golden rules: consistent navigation and wording; universal
usability for novice and experienced users; informative feedback; clear task
completion; error prevention; available reversal before commitment; user
control; and reduced memory load. Existing cancel/back paths are not a promise
of undo after saving.

Use semantic landmarks and headings, associated field labels, descriptive action
names, visible focus and logical tab order. Aim for comfortable 44px touch
targets where practical. Test responsive reflow at 320px, tablet and desktop,
and 200% zoom, including long labels, dynamic rows, uploads, errors, keyboard
navigation and assistive technology. Verify actual contrast rather than relying
on palette values alone.

## Deferred proposals and open design risks

These items require assessment of accessibility, compatibility, implementation
cost and product impact; they are not approved functionality:

| Proposal                               | Decision or dependency                                                                                    |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Searchable company/employee selectors  | Verify authorized lookup sources, tenant scope, pagination and accessibility before replacing ID entry.   |
| Compact table density preference       | Decide default, persistence, consistent styling and accessible target sizes.                              |
| Persistent collapsible desktop sidebar | Decide state persistence and verify icon labels, tooltips and keyboard behavior.                          |
| Undo or restore committed actions      | Requires product decisions and server support for each action; some credit decisions may be irreversible. |
| Unsaved-change protection              | Decide when a form is dirty and handle route and browser navigation.                                      |

Some validation messages originate from shared contracts and remain technical;
review shared messages before translating them. Recheck dynamic company fee rows,
independently saved employee sections, BPR decision context, financial values,
empty/error states and document guidance when changing those features.

## Verification history

On 14 November 2026 the recorded implementation checks used synthetic data and a
disposable MySQL database. Lint, workspace typecheck and build passed; 319 unit
tests, 23 functional browser scenarios and three responsive scenarios passed.
The responsive scenarios covered public cards, dashboard, CRUD pages, BPR
review and customer confirmation at 320px, 768px and 1440px, including overflow,
Drawer Escape and focus return. Representative screenshots were reviewed; they
were not pixel-baseline tests. Build emitted Zod annotation and large-chunk
warnings. These results describe that revision, not later changes.

Full assistive-technology testing, every role and state, physical devices and
200% browser zoom were not established by that verification. Run checks relevant
to each subsequent change; do not represent historical results as current proof.

# Frontend design guide

This is the primary visual and layout guide for Credit System. It describes the
target for future UI work, not a claim that the current screens already implement
it. Use Mantine's standard components, variants, spacing and responsive props;
prefer composition to custom component skins. Record proposals needing custom
design work in [design-improvement.md](../../docs/design-improvement.md) before
implementation. This guide does not authorize changes to business rules, API
contracts, permissions, calculations, workflow transitions or available data.

References: [Shneiderman's eight golden rules](https://figr.design/blog/eight-golden-rules-interface-design-understanding)
and [AdminLTE dashboard design](https://adminlte.io/blog/admin-dashboard-design/),
especially its classic sidebar pattern.

## Implemented baseline and verification

The authenticated shell now provides a 250px sidebar, a top bar with session
context and logout, and a mobile menu below Mantine's `sm` breakpoint. Existing
permission checks determine navigation visibility. CRUD content uses a white
surface, dashboard summaries use responsive cards, and listing tables have a
keyboard-focusable horizontal scroll region. Public authentication and
registration remain outside the shell. Existing routes and business rules are
unchanged.

The theme maps primary green `#2ECC40` to Mantine brand shade 6, uses
`#333333` for dark text, and retains `#005691` for navigation and secondary
controls. Status badges use text plus semantic color. Inter and JetBrains Mono
are requested with fallbacks; font files are not bundled. Light mode is explicit.

FieldsGrid uses container queries: one column below 580px of available width,
two from 580px, and an optional third from 900px for short repeated fee fields.
FormSection constrains content to 960px. Addresses, headings, alerts and actions
span the grid or sit outside it.

| Feature            | Implemented form composition                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| Admin User         | Two-column account and per-program permission fields                                            |
| Perusahaan         | Two-column main fields and rates; up to three fee fields per row                                |
| Karyawan           | Independent account/profile/document saves; two-column fields and documents; full-row addresses |
| Pengajuan kredit   | Two-column amount/tenor/date; separate rate table and simulation result sections                |
| Keputusan BPR      | Identity/status summary above two-column decision fields; one save notification                 |
| Konfirmasi nasabah | Two-column bank fields; acknowledgment and submit below                                         |
| Login/registrasi   | One-column form in white card over gray background                                              |

## Product and visual direction

Design for an operational credit administration application: users scan records,
enter data and make decisions repeatedly. Keep the interface calm, predictable
and information-dense enough for daily work. Use Indonesian labels consistent
with existing screens and contracts. Favor clear hierarchy and whitespace over
decoration, nested cards or prominent shadows. Maintain a light appearance.

- Retain the original design tokens below. Use white surfaces and dark text;
  reserve semantic colors for meaningful signals rather than decoration.
- Use semantic success, warning and danger colors sparingly, always accompanied
  by text or an icon. Never infer a business status from color alone. Check text
  contrast at least 4.5:1 (3:1 for large text) and visible controls and focus
  indicators at least 3:1 against adjacent colors.
- Use Inter for interface text and JetBrains Mono for technical values, with
  appropriate fallbacks. Use one clear page title, smaller section headings, normal body text
  and muted supporting text. Financial values need consistent units, existing
  precision and locale formatting; use tabular numerals where available.
- Use Mantine spacing consistently: approximately 8px between related elements,
  16px within groups and 24px between major sections. Use the 8px base radius;
  prefer Mantine borders, control heights and focus states. Align controls and avoid ornamental
  animation; respect reduced-motion preferences.

### Original design tokens

| Token             | Value     | Intended use                        |
| ----------------- | --------- | ----------------------------------- |
| Primary           | `#2ECC40` | Primary brand and action color      |
| Secondary         | `#005691` | Deep blue brand color               |
| Tertiary          | `#FFFFFF` | White content surfaces              |
| Neutral           | `#333333` | Main text and dark neutral surfaces |
| Surface           | `#FFD700` | Warning and attention               |
| Accent            | `#FF8C00` | Secondary emphasis                  |
| Additional accent | `#9370DB` | Limited emphasis                    |
| Light neutral     | `#F0F0F0` | Muted surfaces and borders          |

Primary buttons use the original green with Mantine auto-contrast and neutral
text. Keep standard Mantine control dimensions rather than forcing the original
12px padding onto every button. Preserve token values and verify color pairs; do not use light neutral as text on white without verification.
Use Mantine variants and theme settings before considering custom styling.

Typography retains the original Inter scale: hero `clamp(2.5rem, 5vw, 4rem)`
at weight 700 for a future hero use case; operational H1 is `2.25rem`
at weight 700; H2 `1.5rem`; body `1rem`, weight 400, line-height 1.6; and
labels or captions `0.875rem`, weight 500. Limit prose to approximately 72ch.
The base radius is `8px` and the spacing unit is `8px`.

## Application shell: classic sidebar

For authenticated work areas, the shell has a persistent left navigation
on desktop, a compact top bar and a main work area. Mantine `AppShell`, `NavLink`,
`Burger`, `Group`, `Stack` and `Container` are suitable starting points. The
shell provides the main structure; the remaining details below guide future work.

```text
Desktop:  [brand / sidebar] [top bar: context             account / logout]
          [navigation     ] [page title, context, primary action          ]
          [               ] [filters / content / tables                   ]
Mobile:   [menu button    top bar / account                               ]
          [page title, context, actions                                   ]
          [content                                                       ]
```

- Give the sidebar a stable, readable width (about 240–260px); allow its own
  vertical scrolling for long menus. Place the product identity first, followed
  by Beranda and existing permitted destinations. Group related destinations
  only when useful; preserve their existing labels and routes.
- Highlight the current destination with both visual treatment and accessible
  current-page semantics. Keep navigation order and location consistent across
  authenticated pages. Show only destinations already permitted by existing
  access rules; keep direct-route gates and server authorization intact.
- The top bar holds the mobile menu trigger and existing session/account context
  and logout. Do not invent global search, notifications or account features.
  Avoid repeating navigation and logout inside every page when a shared shell is
  implemented, while preserving access to them.
- Use a fluid work area with roughly 16px mobile and 24–32px desktop padding;
  limit long forms and prose for readability, but allow tables more width. Place
  the page title and optional parent context above the main content. Put the
  primary permitted action near the title; secondary actions remain subordinate.
- Below Mantine's `sm` breakpoint, use a menu button and Mantine Drawer;
  hide the desktop navbar and preserve standard modal focus management; keep the page usable at narrow widths. Opening, closing,
  focus return, Escape and keyboard operation must follow the chosen Mantine
  component's accessible behavior. The sidebar must not obscure the work area
  when closed. Stack header actions as needed.
- Login and public registration use a white Paper card, a container up to 480px
  wide, a full-viewport `#F0F0F0` background and responsive padding. Allow vertical
  scrolling on short screens. Keep these pages outside authenticated navigation. Preserve their existing account selection,
  tenant context, fields, links and error/success flows. Apply the same focused
  treatment to public completion screens where applicable.

## Page patterns

### Dashboard

Start with the page title and session context, then show the existing summary
values in a responsive grid of simple surfaces. Labels, units and values must
remain clear; distinguish counts from monetary totals. Use one column on narrow
screens and add columns as space permits. Do not add trends, targets, charts or
comparisons without available data and a separate product decision. Preserve
the exact meaning and scope of existing totals; see
[logic-holes.md](../../docs/logic-holes.md).

### Lists and tables

Use a consistent order: title; permitted add action with secondary outline
exports; one search input naming searchable fields and structured filters;
results; compact pagination and total. Filters use one column, two from 480px
and three from 760px of container width. Sort with table header buttons: the
active column exposes `aria-sort`, and clicking again reverses the direction.
Filters and actions wrap
on smaller screens. Keep filters, sort, pagination and export semantics intact,
including the shared filter state and page reset rules in `AGENTS.md`.

The search label names the fields checked together with OR. Admin User searches
username and email; Perusahaan searches company name, username and email;
Master Karyawan searches name and alias; both credit listings search debtor name
and company name. Status, entity and ID filters remain separate. List and export
use the same search, structured filters and sort state. The existing default
order remains creation date descending until a visible column is selected.

Use `ListingTable` and Mantine `Table` as the basis. Keep column headings
visible and rows easy to scan; align numeric values consistently, preferably to
the right, and keep row actions identifiable. Do not hide essential columns or
change the data to make the table fit: put wide tables in a labeled, keyboard
accessible horizontal scroll region. Avoid page-level horizontal overflow.
Distinguish loading, no records, no matching results when actually known, and
errors without implying that an error is an empty result. Keep current records
and pagination behavior truthful during refetching.

### Details, forms and decisions

Use `CrudPage`, `DetailFields`, `FormActions` and `RecordState` where applicable.
Present read-only details as labeled text, grouped by subject; do not turn them
into disabled inputs. Put long values and document actions where they remain
legible, and show missing values consistently without inventing data.

Group related fields under concise headings and maintain logical order. Use
FieldsGrid and FormSection as specified above. Reserve three columns for short
repeated fee fields. Keep employee forms independently saved and clearly labeled. Place labels above fields, required indicators alongside labels,
and help or validation messages near their field. Never rely on placeholder text
as the label. Keep user-entered values on recoverable errors. Place primary and
available cancel/back actions together at the end, wrapping on mobile; do not
invent a cancel destination or promise unsaved-change protection.

Show existing simulation inputs, rate information and results together with
their original labels and units. For approvals, rejection, deletion and other
decisions, make the affected record and action clear, visually separate
destructive actions, and retain existing confirmation and eligibility behavior.
Do not imply that a completed decision can be undone when the system cannot do
so. Keep status, permissions and decision controls faithful to existing rules.

## Interaction and accessibility checklist

Apply all eight golden rules to every pattern:

1. **Consistency:** repeat navigation, titles, field labels and action placement.
2. **Efficiency:** keep frequent permitted actions easy to find; support normal
   keyboard navigation and existing shortcuts without inventing new workflows.
3. **Feedback:** show pending, success and failure where supported; describe what
   happened without claiming a request succeeded before it does.
4. **Closure:** make the end of a task and the available next step clear, while
   preserving current navigation and completion behavior.
5. **Prevent errors:** keep labels, constraints, field errors and existing
   confirmations visible and understandable; validation remains authoritative.
6. **Reversal:** offer existing cancel/back paths before commitment. Undo or
   restore after a committed action requires separate product and technical work.
7. **User control:** avoid unexpected navigation, obscured actions or blocking
   overlays; users initiate actions and can understand pending states.
8. **Reduce memory load:** retain relevant context, labels and current filters on
   screen; use progressive disclosure only when it does not hide required data.

Use semantic landmarks and heading order, associated field labels, descriptive
button and icon names, visible keyboard focus and a logical tab order. Do not
communicate state by color alone. Aim for comfortable 44px touch targets where
practical without changing control behavior. Verify reflow at 320px width,
desktop and 200% zoom; check sidebar, long labels, tables, dialogs and errors
with keyboard and assistive technology. Use Mantine defaults where they satisfy
these requirements and verify the actual composed interface.

## Implementation and review boundary

Before implementing a screen, inspect its existing routes, permissions,
components, contracts and tests. Reuse the shared CRUD components and Mantine
primitives first. Preserve user-visible values, authorization, actions and
workflow outcomes. Proposed custom visual controls or behavior belong in the
design improvement register for review, not silently in this baseline. Verify
responsive layout, states, keyboard access and contrast with representative
synthetic data; run checks appropriate to any implementation change.

## Verification record - 14 November 2026

Responsive browser scenarios use the real API and disposable synthetic MySQL.
They cover login/registration card colors, dashboard, list/add/edit/detail in
all four standard CRUD features, BPR list/detail/decision, and customer bank
confirmation at 320px, 768px and 1440px. Assertions check page overflow, Drawer
Escape dismissal and focus return, and browser runtime errors. Each scenario
saves 23 screenshots in test-results; representative public, list, form, detail,
dashboard and decision screenshots were visually reviewed. These are not
pixel-baseline regression tests. Narrow tablet content can remain single-column
beside the sidebar to preserve field readability.

Results: lint, workspace typecheck and workspace build pass; 319 unit tests pass.
The 23 functional browser scenarios and all three expanded responsive scenarios
pass on Chrome. The final responsive rerun followed a test synchronization fix
for waiting until debtor login completes. Build emits Zod annotation and large
chunk warnings; these do not fail the build. The agreement suite covers the
completion/download flow.

Full assistive-technology coverage, every role/state combination, physical devices
and 200% browser zoom are not established by these tests. Lookup selectors, undo,
unsaved-change guards and persisted density preferences remain proposals in the
improvement register, not implicit additions to business behavior. Some validation
messages remain contract-provided technical text and need a shared-message review.

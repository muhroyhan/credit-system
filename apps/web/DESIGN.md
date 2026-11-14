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

| Token | Value | Intended use |
| --- | --- | --- |
| Primary | `#2ECC40` | Primary brand and action color |
| Secondary | `#005691` | Deep blue brand color |
| Tertiary | `#FFFFFF` | White content surfaces |
| Neutral | `#333333` | Main text and dark neutral surfaces |
| Surface | `#FFD700` | Warning and attention |
| Accent | `#FF8C00` | Secondary emphasis |
| Additional accent | `#9370DB` | Limited emphasis |
| Light neutral | `#F0F0F0` | Muted surfaces and borders |

The original primary button uses the primary background, neutral text and 12px
padding. Preserve these tokens as design intent while checking each actual color
pair for contrast; do not use light neutral as text on white without verification.
Use Mantine variants and theme settings before considering custom styling.

Typography retains the original Inter scale: hero `clamp(2.5rem, 5vw, 4rem)`
at weight 700; H1 `2.25rem` (the original front matter also specifies `2.5rem`
at weight 700); H2 `1.5rem`; body `1rem`, weight 400, line-height 1.6; and
labels or captions `0.875rem`, weight 500. Limit prose to approximately 72ch.
The base radius is `8px` and the spacing unit is `8px`.

## Application shell: classic sidebar

For authenticated work areas, the target shell has a persistent left navigation
on desktop, a compact top bar and a main work area. Mantine `AppShell`, `NavLink`,
`Burger`, `Group`, `Stack` and `Container` are suitable starting points. The
current implementation uses individual containers and dashboard links, so this
is a future layout target, not existing behavior.

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
- At Mantine's `sm` breakpoint, transition to a menu button and an overlay or
  drawer navigation; keep the page usable at narrow widths. Opening, closing,
  focus return, Escape and keyboard operation must follow the chosen Mantine
  component's accessible behavior. The sidebar must not obscure the work area
  when closed. Stack header actions as needed.
- Login and public registration use a focused, centered narrow container rather
  than authenticated navigation. Preserve their existing account selection,
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

Use a consistent order: title and permitted add action; labeled filters and
sorting; export actions; results; pagination and total. Filters and actions wrap
on smaller screens. Keep filters, sort, pagination and export semantics intact,
including the shared filter state and page reset rules in `AGENTS.md`.

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

Group related form fields under concise headings, maintain their logical order,
and use one column on mobile; use two columns only for short related fields when
space permits. Place labels above fields, required indicators alongside labels,
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

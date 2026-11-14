# Design improvement proposals

This register holds ideas that need custom design or interaction work beyond
composing standard Mantine components. They are proposals, not approved scope or
existing functionality. Assess accessibility, compatibility, effort and any
business impact before implementation; do not change business rules implicitly.

| Proposal | Benefit | Dependencies and decision needed |
| --- | --- | --- |
| User-selectable compact table density | Lets frequent users scan more records. | Requires a custom preference and consistent table styling; decide persistence, default and accessible target sizes. |
| Persistent collapsible desktop sidebar | Gives more room to wide tables. | Requires custom shell state, icon labels/tooltips, keyboard behavior and a decision on persistence. The baseline uses a readable expanded desktop sidebar. |
| Undo or restore for committed actions | Could help users recover from mistakes. | Requires product approval and server support for each action; some credit decisions may be irreversible. Existing cancellation and confirmation remain authoritative. |
| Unsaved-change protection | Could prevent accidental loss when leaving a form. | Requires route and browser navigation handling and a decision about when data is considered dirty. |

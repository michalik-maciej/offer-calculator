# Visual Coverage Matrix

## TL;DR

Seven of the eight entries in `analysis/design-context/INDEX.md` are covered by at least one task
group. The eighth, `component:type-picker`, is variant B of the add-run screen and is uncovered on
purpose: the spec rejects it, and with it `core/ui/radio-group.tsx` stays unused. Two mockups carry
two competing variants each, so the matrix records which half of the file is binding and which half
must not be built.

## Key Decisions

- **Variant-level locators, not file-level.** `dodawanie-ci-gu-dwa-warianty.html` and
  `gondola-na-planie-dwa-warianty.html` each contain a rejected variant. Coverage points at the
  winning half by line range so an implementer cannot build the loser by reading the file top to
  bottom.
- **`screen:konfigurator-z-gondola` is split across two groups.** Its buttons and subtitle land in
  group 4, its gondola card in group 6. A screen may be covered by more than one group.
- **`component:layout-plan-header` and `component:plan-unit` are covered twice on purpose.** Group 3
  extracts them against the wall path, group 6 consumes them for the gondola. The second row is what
  proves the extraction was not speculative.

## Open Questions / Risks

- `screen:szuflada-edycji-gondoli` shows the drawer heading as „Regał 3" where the application says
  „Ciąg {n}". The plan keeps the application's copy, because the spec changes only the note (R6) and
  R15 forbids inventing strings. Recorded as a deviation, not as an uncovered element.

---

Source: `analysis/design-context/INDEX.md`

| Screen/Component ID | Covered By Task Group(s) | Status |
|---------------------|--------------------------|--------|
| `screen:dodawanie-ciagu` | Group 4 (Factory and add buttons), variant A only | Covered |
| `screen:gondola-na-planie` | Group 6 (Gondola plan, dispatch and drawer), variant A only | Covered |
| `screen:konfigurator-z-gondola` | Group 4 (buttons row and page subtitle), Group 6 (gondola card in a mixed list) | Covered |
| `screen:szuflada-edycji-gondoli` | Group 5 (the four sections, unchanged, under a units path prefix), Group 6 (drawer host and the note) | Covered |
| `component:layout-plan-header` | Group 3 (extracted from `WallLayoutPlan.tsx:97-137`), Group 6 (consumed unchanged by the gondola plan) | Covered |
| `component:plan-unit` | Group 3 (`ShelvesSummary` and `SCALE_PX_PER_CM` extracted), Group 6 (the gondola's clickable boxes on both strips) | Covered |
| `component:both-sides-note` | Group 6 (rendered above the editor inside the gondola drawer) | Covered |
| `component:type-picker` | none | Not built, by decision |

**Coverage: 7 of 8 entries. 1 deliberately not built.**

## Rejected variants, named so they are not built by accident

| Mockup | Winning region | Rejected region |
|---|---|---|
| `dodawanie-ci-gu-dwa-warianty.html` | Variant A, lines 261 to 269: two buttons side by side | Variant B, lines 270 to 278: one button opening a type menu |
| `gondola-na-planie-dwa-warianty.html` | Variant A, lines 261 to 277: two strips back to back | Variant B, lines 278 to 288: one strip at doubled depth |

## Uncovered Items

- **`component:type-picker`.** This is the run-type chooser from variant B of
  `screen:dodawanie-ciagu`, built in the mockup on `core/ui/radio-group.tsx`. The specification
  closes decision I1 in favour of variant A (two buttons side by side, requirement R1 and the Visual
  Design table), so the picker has no place in the implementation. `core/ui/radio-group.tsx` remains
  used only by `inventory/components/InventoryItem.tsx`, exactly as today. Nothing in the plan should
  reference this component; a task group that did would be building the rejected variant.

Every other entry in `INDEX.md` is covered by at least one task group, and every UI task group in
`implementation-plan.md` carries a `Visual References` block naming the mockup, the element ID, the
region and the acceptance criteria it is responsible for matching.

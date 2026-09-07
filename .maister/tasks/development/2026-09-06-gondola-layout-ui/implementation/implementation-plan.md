# Implementation Plan: Gondola layout support in the offer configurator UI

## TL;DR

Seven task groups in one strictly serial chain, no parallelism: the domain upright rule first
(the only half `pnpm vitest run` can verify), then the type widening behind a `pnpm typecheck` gate,
then the plan extractions, then factory and buttons, the editor parameterisation, and the gondola
drawing last. 40 steps, 4 domain tests (one assertion moved, three added), zero web tests by project
decision. The spec's decomposition is confirmed on all three counts, with one correction that would
otherwise ship as a silent runtime bug.

## Key Decisions

- **Confirm: one `ShelfUnitEditor` parameterised on a units path prefix.** The variants differ by one
  path segment, and a sibling would be a 363-line copy. Whatever `pnpm validate` cannot check about
  it, a diff against the wall drawer can.
- **Confirm: two plan components sharing an extracted header.** The gondola geometry (two strips,
  one selection, captions) is a different drawing, not a parameter.
- **Confirm: the six sub-components inside `ShelfUnitEditor.tsx` stay file-local and unexported.**
  One editor serves both variants, so no second consumer exists. Extracting them would be exactly the
  speculative extraction `minimal-implementation.md` exists to prevent. This overturns the
  codebase-analysis recommendation, which was written before the shared-editor decision removed its
  premise.
- **Correction to the spec's parenthetical: `ShelvesFields` does take the units path prefix.** Its
  `useFieldArray` name is `layouts.{i}.shelfUnits.{u}.shelves`, which is a wall path. Only `height`
  and `extras` are genuinely untouched. This gets its own acceptance criterion because the wall path
  still typechecks under the widened union and would write to a key a gondola does not have.
- **Extract `ShelvesSummary` and `SCALE_PX_PER_CM` alongside `LayoutPlanHeader`.** All three acquire
  a real second consumer in group 6, so extracting them in group 3 is the same non-speculative move
  the spec already sanctions for the header, and it keeps the two drawings on one scale by
  construction.
- **The leg scope enters as a key on the context object, not as a third parameter.** It keeps the
  `(context, inventory)` signature that `backend/domain.md` mandates, and the default is expressed
  where it reads best: `numberOfLegLayouts = numberOfLayouts` in the destructuring pattern.
- **Buttons and factory (group 4) land before the gondola drawing (group 6).** A gondola is priced by
  the server on its first autosave with no plan component in existence. That is the one
  mid-implementation checkpoint a running app can confirm, and the spec names it.
- **Groups are serialised by dependency, not scheduled concurrently.** `OfferLayouts.tsx`,
  `WallLayoutPlan.tsx` and `ShelfUnitEditor.tsx` are each touched by three groups, and the
  working-process standard asks for one concern per step regardless.

## Open Questions / Risks

- **The two numbers in the gondola's delegated context are not the same number.** The delegated
  `numberOfLayouts` keeps folding in the side count (feet, back panels, base shelves and shelves stay
  full per side); the leg scope is the run-level count narrowed by `ceil(numberOfGondolaUnits / 2)`.
  Confusing them distorts the price with no failing test, because the fixture's second entry
  (`numberOfGondolaUnits: 1`) gives the same answer either way. Step 1.3 exists only for this, and
  test 1.1c pins the feet alongside the uprights so the two cannot be swapped silently.
- **A wall path inside the parameterised editor typechecks and fails at runtime.**
  `layouts.{i}.shelfUnits.{u}.shelves` remains a legal `Path<OfferInput>` after the widening, because
  RHF distributes over the union. A missed prefix in `ShelvesFields` therefore compiles, passes lint,
  and writes shelves into a key a gondola object does not carry. Step 5.3 checks each of the six
  paths by name.
- **Template literal path composition is the one typing surface with no precedent in this repo.**
  `${unitsPath}.shelfUnits.${unitIndex}.width` must satisfy `FieldPathByValue<OfferInput, number>`
  with `unitsPath` a two-member union. Fallback in 5.5, and it never involves a cast.
- **The mockup's drawer heading reads „Regał 3" where the application says „Ciąg {n}".** The spec
  changes nothing about the drawer title (R6 names only the note), and R15 forbids inventing strings,
  so the plan keeps „Ciąg {n}" for both variants and records the deviation rather than acting on it.
  Raise it with the maintainer if the mockup heading was intentional.
- **Five of the seven groups have no automated gate at all.** Groups 2 to 6 are covered by
  `pnpm validate` for types, lint and formatting, and by nothing else until the E2E phase. Success
  Criteria 1 to 5 are that phase's script. No step touching the view may be reported as done on the
  strength of `pnpm validate` alone.
- **`component:type-picker` is deliberately uncovered.** It is variant B of
  `screen:dodawanie-ciagu`, which the spec rejects, and with it `core/ui/radio-group.tsx` stays
  unused. Recorded in `visual-coverage.md` rather than silently dropped.
- **Every offer re-saved after this change re-prices its gondolas.** Nothing is persisted today, so
  there is nothing to migrate, but the same input priced before and after gives different numbers.

---

## Overview

Total Steps: 40 (excluding the seven N.0 parent items)
Task Groups: 7
Expected Tests: 4 to 6 for the whole feature (4 in group 1, up to 2 more in group 7)

That number is far below the usual band for a task this size, and it is honest rather than thin.
Only the domain half is testable here: there are zero tests under `packages/apps/web`, Vitest runs in
a Node environment with no JSDOM (`vitest.config.ts` would not match a `.test.tsx` file), coverage is
collected from `packages/domain` only, and
`.maister/docs/standards/testing/test-writing.md` records that UI components have no unit tests by
decision. Do not propose component tests, and do not propose lifting the constraint inside this task.

### What verifies what

| Group | `pnpm vitest run` | `pnpm validate` | Running app / E2E phase |
| --- | --- | --- | --- |
| 1 Domain upright rule | Yes, primary gate | Yes | No |
| 2 Form type widening | Regression only | Yes, primary gate | Yes, wall path unchanged |
| 3 Plan extractions | Regression only | Yes | Yes, primary gate |
| 4 Factory and add buttons | Regression only | Yes | Yes, primary gate |
| 5 Editor parameterisation | Regression only | Yes | Yes, primary gate |
| 6 Gondola plan and drawer | Regression only | Yes | Yes, primary gate |
| 7 Review and success criteria | Yes | Yes | Hands SC 1 to 5 to the E2E phase |

---

## Implementation Steps

### Task Group 1: Domain, shared uprights via an optional leg scope

**Dependencies:** None
**Files to Modify:**
`packages/domain/src/orchestrations/calculateWallLayoutDemand/calculateWallLayoutDemand.ts`,
`packages/domain/src/orchestrations/calculateGondolaLayoutDemand/calculateGondolaLayoutDemand.ts`,
`packages/domain/src/orchestrations/calculateGondolaLayoutDemand/calculateGondolaLayoutDemand.test.ts`
**Estimated Steps:** 5

- [x] 1.0 Complete the domain layer
  - [x] 1.1 Write 4 focused tests in `calculateGondolaLayoutDemand.test.ts`
    - Keep the file's existing shape: one explicit `import { describe, expect, it } from "vitest"`,
      one top-level `describe("calculateGondolaLayoutDemand")`, `it` blocks inside it, fixtures from
      `packages/domain/src/fixtures` (`componentCatalogMock`), assertions on the whole result with
      `toEqual`. Nothing is mocked.
    - (a) Modify the existing `returns complete demand` case: the first entry's
      `{ id: "leg-130-8-3", quantity: 8 }` becomes `quantity: 4`. Change that number and nothing
      else, including the `toHaveLength(11)` and the element order.
    - (b) New: a two-sided entry with `numberOfLayouts: 3` yields
      `(units + 1) * 3` uprights, one shared column per run copy.
    - (c) New: feet and uprights diverge in the same result. Assert both lines of a single two-sided
      entry: feet at `(units + 1) * numberOfLayouts * numberOfGondolaUnits` and uprights at
      `ceil(numberOfGondolaUnits / 2) * (units + 1) * numberOfLayouts`. This is the test that catches
      the two numbers being swapped.
    - (d) New: an odd side count (`numberOfGondolaUnits: 3`) produces no fractional quantity;
      assert the whole list and that every `quantity` is an integer.
    - Do not touch `calculateWallLayoutDemand.test.ts`, `calculateLegDemand.test.ts`,
      `calculateOfferDemand.test.ts` or `createOfferPreview.test.ts`. If one of them moves, the fix
      is the wall call site, not the expectation.
  - [x] 1.2 Add the optional leg scope to `calculateWallLayoutDemand`
    - Widen the context parameter to `LayoutWall & { numberOfLegLayouts?: number }` and destructure
      `numberOfLegLayouts = numberOfLayouts` after `numberOfLayouts` in the same pattern, so the
      default is the current behaviour by construction.
    - Feed it to `legContext.numberOfLayouts` only. `footContext`, `shelfContext`,
      `backPanelContext`, `baseShelfContext` and `countShelfUnitsByWidth` keep the run-level
      `numberOfLayouts` untouched.
    - The wall call site (`calculateOfferDemand.ts`) passes nothing, so the returned list is
      identical in content and in order. No new file, no new folder, no new domain test.
    - Fallback if the intersection type reads badly at the call site: a third parameter
      `numberOfLegLayouts?: number`. Prefer the context key, because `backend/domain.md` fixes the
      `(context, inventory)` signature.
  - [x] 1.3 Pass the narrowed scope from `calculateGondolaLayoutDemand`, and only there
    - The delegated context keeps `numberOfLayouts: numberOfLayouts * numberOfGondolaUnits`. Do not
      change it. That is what keeps back panels, base shelves, shelves and feet at a full set per
      side (R11).
    - Add one key: `numberOfLegLayouts: Math.ceil(numberOfGondolaUnits / 2) * numberOfLayouts`.
    - Assert the difference deliberately against the existing fixture before moving on: entry zero
      (2 sides, 3 units, 1 run) gives feet 8 and uprights 4; entry one (1 side, 1 unit, 1 run) gives
      feet 2 and uprights 2.
    - `ceil` keeps the argument an integer for every integer side count, so no fraction can leave the
      orchestration into `breakdownDemandByCategory` or `calculateBomPrice`, neither of which rounds
      a quantity.
  - [x] 1.4 Ensure the domain tests pass
    - Run only the touched files:
      `pnpm vitest run packages/domain/src/orchestrations/calculateGondolaLayoutDemand packages/domain/src/orchestrations/calculateWallLayoutDemand`
  - [x] 1.5 Run the full regression gate and prove the blast radius
    - `pnpm vitest run` and `pnpm validate`.
    - `git diff --stat packages/domain` must show exactly three files, and the diff of
      `calculateGondolaLayoutDemand.test.ts` must contain exactly one changed number among the
      pre-existing assertions.

**Acceptance Criteria:**
- The 4 tests pass and the rest of the suite is untouched.
- `calculateWallLayoutDemand.test.ts` passes with no edit, including its whole-list order.
- The only pre-existing assertion in the repository that changed is `leg-130-8-3`, 8 to 4, in
  `calculateGondolaLayoutDemand.test.ts`.
- No new file under `packages/domain`.

---

### Task Group 2: Widen the form type to `OfferInput`

**Dependencies:** 1
**Files to Modify:**
`packages/apps/web/src/offer/offer.types.ts` (deleted),
`packages/apps/web/src/offer/components/OfferFormProvider.tsx`,
`packages/apps/web/src/offer/components/OfferLayouts.tsx`,
`packages/apps/web/src/offer/components/plan/WallLayoutPlan.tsx`,
`packages/apps/web/src/offer/components/editor/ShelfUnitEditor.tsx`,
`packages/apps/web/src/offer/components/editor/ExtrasFields.tsx`,
`packages/apps/web/src/routes/offer/route.tsx`
**Estimated Steps:** 6

No test is written here and none can be. The gate is `pnpm typecheck`, and it is the gate the whole
rest of the plan is sequenced behind.

- [x] 2.0 Complete the type widening
  - [x] 2.1 Replace the generic at all six consumers, then delete the file
    - `OfferFormProvider.tsx:13,18,43`, `OfferLayouts.tsx:10,13`, `WallLayoutPlan.tsx:14,57`,
      `ShelfUnitEditor.tsx:15,17,76,139,206,297`, `ExtrasFields.tsx:19,22`,
      `routes/offer/route.tsx:17,28`.
    - Each becomes `OfferInput` from `@/schemas/Offer.schema`. Delete
      `packages/apps/web/src/offer/offer.types.ts`.
    - Keep the three-tier import order; `@/schemas` sits in the second tier.
  - [x] 2.2 Remove the hydration cast
    - `OfferFormProvider.tsx:37` becomes `reset(offer.input)`. This is a live defect independent of
      this task: a saved gondola was force-cast to the wall type on load.
    - `OfferFormProvider.tsx:43` `mutationFn: (values: OfferInput)`.
  - [x] 2.3 Narrow every whole-layout read with a schema guard, never a cast
    - `WallLayoutPlan.tsx:57` reads `useWatch({ name: 'layouts.{i}' })`, which now returns
      `LayoutGondola | LayoutWall | undefined`. Fold the narrowing into the existing guard at line 93:
      `if (!layout || !isLayoutWall(layout)) return null`.
    - `isLayoutWall` comes from `@/schemas/LayoutWall.schema`. It is a `v.safeParse` on required-key
      presence, so a gondola fails it in both directions.
    - **SUPERSEDED during Group 3.** This instruction was carried out and then reversed. `isLayoutWall`
      is a full `safeParse`, not a shape probe: clearing the „Liczba ciągów" input yields `NaN` under
      `valueAsNumber`, `NaN` fails `minValue(0)`, the guard returns false and the component unmounts
      the very input being cleared. The guard is now `if (!layout || "gondolaUnits" in layout) return
      null`, which narrows structurally with no cast and runs no validation at render time.
      Validation stays at the API boundary. Decided by the maintainer after Group 2 reported it.
    - Do not add a `type` discriminant: Valibot strips unknown keys, so a UI-added marker vanishes on
      the first save.
  - [x] 2.4 Verify the first typing surface: `FieldPathByValue`
    - `ShelfUnitEditor.tsx:17` becomes `FieldPathByValue<OfferInput, number>`. Expected to resolve,
      because RHF's `PathImpl` and `PathValue` are distributive conditionals, so the union yields the
      paths of both members.
    - Fallback if it does not: type the stepper `name` props explicitly. Never reintroduce a
      per-variant cast.
  - [x] 2.5 Verify the second typing surface: `useFieldArray` over a union array
    - Three call sites take array paths that exist on one union member only:
      `OfferLayouts.tsx:14` (`layouts`), `WallLayoutPlan.tsx:69` (`layouts.{i}.shelfUnits`),
      `ShelfUnitEditor.tsx:210` (`...shelfUnits.{u}.shelves`). These resolve through
      `ArrayPath` / `FieldArray`, so 2.4's fallback does not reach them.
    - Fallback if it bites: give `name` an explicitly typed value at those three sites and leave the
      runtime path unchanged.
  - [x] 2.6 Gate the rest of the plan on a clean typecheck
    - `pnpm typecheck` first, on its own, then `pnpm validate` and `pnpm vitest run`.
    - `grep -rn 'WallOfferInput' packages/apps/web/src` returns nothing.
    - In a running app: open an existing wall offer, edit a dimension, confirm the 800 ms autosave
      still returns a description and a price. Nothing new is visible yet; the point is that nothing
      broke.

**Acceptance Criteria:**
- `pnpm typecheck` passes with no cast added anywhere.
- `offer.types.ts` no longer exists and no `as WallOfferInput` remains.
- `pnpm vitest run` still green.
- A wall run still renders, edits and prices in a running app.

---

### Task Group 3: Extract the shared plan pieces, wall path only

**Dependencies:** 2
**Files to Modify:**
`packages/apps/web/src/offer/components/plan/WallLayoutPlan.tsx`,
`packages/apps/web/src/offer/components/plan/LayoutPlanHeader.tsx` (new),
`packages/apps/web/src/offer/components/plan/ShelvesSummary.tsx` (new),
`packages/apps/web/src/offer/components/plan/planScale.ts` (new)
**Visual References:**
- mockup: analysis/design-context/mockups/konfigurator-z-gondol.html
  element: component:layout-plan-header
  locator: lines 265 to 272, the `.between.gondola-head` block of the first card
  acceptance: one row, left group is the index `Badge` then the server description; right group in
  this order: „Liczba ciągów" label, the numeric input, the price right-aligned, „Powiel ciąg" icon
  button, „Usuń ciąg" icon button. The extraction is byte-equivalent to `WallLayoutPlan.tsx:97-137`,
  including both Polish `aria-label`s.
- mockup: analysis/design-context/mockups/gondola-na-planie-dwa-warianty.html
  element: component:plan-unit
  locator: lines 267 to 269, the three `.unit` rectangles of variant A
  acceptance: the caption stays `width/depth/height` joined by `/`, with the shelves summary
  underneath, and the box is sized at `SCALE_PX_PER_CM` from the shared module rather than a literal.
**Estimated Steps:** 5

Pure refactor. Nothing visible changes, which is precisely what makes it verifiable without tests.

- [x] 3.0 Complete the extraction
  - [x] 3.1 Create `planScale.ts` exporting `SCALE_PX_PER_CM = 1.6`
    - Move it out of `WallLayoutPlan.tsx:17`. Both drawings must be on one scale by construction,
      and the no-bare-numbers rule forbids duplicating the literal.
  - [x] 3.2 Extract `LayoutPlanHeader.tsx`
    - Move the `<header>` element, `WallLayoutPlan.tsx:97-137`, verbatim.
    - Props inline, destructured, alphabetical:
      `{ layoutIndex, onDuplicate, onRemove, preview }`. It owns the
      `register('layouts.{i}.numberOfLayouts', { valueAsNumber: true })` call through
      `useFormContext<OfferInput>()`, so both plans get the same field with no prop drilling.
    - `formatPrice` stays the only price formatter; do not create a second one.
    - `numberOfLayouts` still has no React Hook Form validation, only the HTML `min`. Carry that
      verbatim; it is pre-existing and out of scope (see Known Limitations in the spec).
  - [x] 3.3 Extract `ShelvesSummary.tsx`
    - Move it verbatim from `WallLayoutPlan.tsx:21-44`. Type `shelves` on the shape both schemas
      share; `LayoutWall["shelfUnits"][number]["shelves"]` and the gondola equivalent are identical,
      so either annotation is correct, but do not import a gondola type just to widen a comment.
  - [x] 3.4 Rewire `WallLayoutPlan.tsx` to consume all three
    - The file should lose roughly 60 lines and gain three imports. No behaviour change, no markup
      change, no copy change.
    - **Added to this step by the orchestrator**: replace Group 2's `isLayoutWall` guard with the
      structural check `if (!layout || "gondolaUnits" in layout) return null`, and drop the now
      unused import. See the superseded note under step 2.3 for why. Group 6 repeats the same three
      token check inline; no shared helper until a third consumer exists.
  - [x] 3.5 Verify
    - `pnpm validate` and `pnpm vitest run`.
    - In a running app: a wall run's header, drawing, duplicate, remove and drawer all behave exactly
      as before. Compare against the wall card in `konfigurator-z-gondol.html`, lines 263 to 277.

**Acceptance Criteria:**
- `pnpm validate` passes.
- The wall run is visually and behaviourally identical to before the group.
- `SCALE_PX_PER_CM` is declared once in the repository.
- Implementation matches each `acceptance` criterion declared above.

---

### Task Group 4: The gondola factory and the two add buttons

**Dependencies:** 2
**Files to Modify:**
`packages/apps/web/src/offer/helpers/createDefaultGondolaLayout.ts` (new),
`packages/apps/web/src/offer/components/OfferLayouts.tsx`
**Visual References:**
- mockup: analysis/design-context/mockups/dodawanie-ci-gu-dwa-warianty.html
  element: screen:dodawanie-ciagu
  locator: variant A only, lines 261 to 269 (its two buttons at 264 to 267), plus the empty-state
  card at lines 280 to 282. Variant B (lines 270 to 278) is rejected and must not be built.
  acceptance: two buttons side by side in this order, „Dodaj ciąg przyścienny" then „Dodaj gondolę",
  both from `core/ui/button.tsx`, each disabled independently when its own factory returns `null`,
  and the hint under them naming the type that cannot be built. No `radio-group`, no menu, no
  `Select`.
- mockup: analysis/design-context/mockups/konfigurator-z-gondol.html
  element: screen:konfigurator-z-gondola
  locator: lines 258 to 262, the page title row and the subtitle
  acceptance: the two buttons sit on the title row, and the subtitle underneath reads exactly
  „Oferta może mieszać oba rodzaje ciągów. Wycena spływa z serwera po zapisie." (R17).
**Estimated Steps:** 6

- [x] 4.0 Complete the entry point
  - [x] 4.1 Write `createDefaultGondolaLayout.ts`
    - Same folder, same `InventoryDimensions` parameter, same contract as
      `createDefaultWallLayout`: `LayoutGondola | null`, where `null` means the inventory cannot
      furnish a run and the button stays disabled.
    - Call `createDefaultWallLayout(dimensions)` and return `null` when it does. Then build the
      gondola object key by key from its values: `height`, `numberOfLayouts`, `extras: []`, and one
      `gondolaUnits` entry `{ depth, numberOfGondolaUnits: GONDOLA_SIDES, shelfUnits }` reusing the
      wall factory's `shelfUnits` array as-is (both schemas declare it identically, and `shelves` is
      required in both, so it is always at least `[]`).
    - `const GONDOLA_SIDES = 2` at module top, per the no-bare-numbers rule.
    - Never spread a wall layout. A hybrid object carrying both `gondolaUnits` and layout-level
      `depth` / `shelfUnits` is persisted as a gondola with the wall keys stripped, yet read as a
      wall by a guard checking wall first.
    - JSDoc on the export, as `createDefaultWallLayout` has, documenting the `null` contract and the
      one-entry, two-sided shape. No inline comments.
    - Adds no `@/domain` import: the only one on this path
      (`DEFAULT_SHELF_COUNT_BY_HEIGHT`) stays inside the wall factory. The count must remain eleven.
  - [x] 4.2 Replace the single button in `OfferLayouts.tsx`
    - Two buttons, „Dodaj ciąg przyścienny" and „Dodaj gondolę", each calling `append` with its own
      factory result, each `disabled` on its own factory returning `null`.
    - Keep the existing `Plus` icon usage and `variant="outline"`.
  - [x] 4.3 Split the disabled hint
    - Today's single string is „Uzupełnij magazyn komponentów, żeby móc dodać ciąg."
      (`OfferLayouts.tsx:48`). It must now name the type that cannot be built. Both factories fail on
      the same missing dimensions today, so in practice both are disabled together, but the copy must
      still be honest per requirement R1 and the mockup's own annotation.
    - Compose from the existing vocabulary only. No new noun is coined here; „ciąg przyścienny" and
      „gondola" both come from the buttons above.
  - [x] 4.4 Add the page subtitle
    - „Oferta może mieszać oba rodzaje ciągów. Wycena spływa z serwera po zapisie.", verbatim,
      under the buttons.
  - [x] 4.5 Memoise nothing that was not memoised before
    - `createDefaultWallLayout` is called unconditionally on every render today; the gondola factory
      inherits that. It is a recorded pre-existing defect and is out of scope. Do not fix it here.
  - [x] 4.6 Verify, and take the mid-implementation checkpoint
    - `pnpm validate` and `pnpm vitest run`.
    - In a running app: click „Dodaj gondolę". The configurator draws nothing for it yet, because
      `WallLayoutPlan` now narrows to wall and returns `null`, and that is expected at this point.
    - Confirm the round trip on the offer page instead: `routes/offer/route.tsx` lines 149 to 168
      iterate layouts reading only `description` and `basePrice`, so after the 800 ms autosave the new
      run must appear there with a description beginning „1 x ciąg regałów dwustronnych" and a price.
      That proves schema, API, pricing and persistence accept the gondola this factory builds, before
      a single pixel of it has been drawn.

**Acceptance Criteria:**
- A gondola can be created and is priced by the server, with no plan component in existence.
- `grep -rn 'from "@/domain' packages/apps/web/src` still returns eleven lines.
- Both buttons disable independently and the hint names the unavailable type.
- Implementation matches each `acceptance` criterion declared above.

---

### Task Group 5: Parameterise `ShelfUnitEditor` on a units path prefix

**Dependencies:** 3
**Files to Modify:**
`packages/apps/web/src/offer/components/editor/ShelfUnitEditor.tsx`,
`packages/apps/web/src/offer/components/plan/WallLayoutPlan.tsx`
**Visual References:**
- mockup: analysis/design-context/mockups/szuflada-edycji-gondoli.html
  element: screen:szuflada-edycji-gondoli
  locator: lines 284 to 299, the four sections of the drawer body
  acceptance: section order and labels are unchanged from today's wall drawer, which this mockup
  reproduces: „Ciąg" (Głębokość bazy, Wysokość), „Regały" (Szerokość, Liczba regałów, Dodaj regały),
  „Półki", „Inne elementy ciągu". This group changes only where the fields write, never what the
  drawer looks like.
**Estimated Steps:** 6

Still wall-only. The gondola has no drawer to open until group 6, so any visible difference here is a
regression.

- [x] 5.0 Complete the editor parameterisation
  - [x] 5.1 Introduce the prefix type and prop
    - `type UnitsPath = \`layouts.${number}\` | \`layouts.${number}.gondolaUnits.${number}\``
    - `ShelfUnitEditor` keeps `layoutIndex` and gains `unitsPath`, alphabetical among the props. The
      prefix points at the object that carries `depth` and `shelfUnits`, which is the entire
      difference between the two variants.
  - [x] 5.2 Repoint the two unit-scoped and one run-scoped fields in the editor body
    - „Głębokość bazy": `layouts.{i}.depth` becomes `${unitsPath}.depth` (`:314`).
    - „Szerokość": `${unitsPath}.shelfUnits.{u}.width` (`:334`).
    - „Liczba regałów": `${unitsPath}.shelfUnits.{u}.numberOfShelfUnits` (`:339`).
    - The `useWatch` on the unit (`:301`) becomes `${unitsPath}.shelfUnits.{u}`.
    - „Wysokość" stays at `layouts.{layoutIndex}.height` (`:319`). It is a run-level field in both
      schemas and must not move.
  - [x] 5.3 Give `ShelvesFields` the prefix too, and check all six paths by name
    - `ShelvesFields` is file-local and unexported, and it currently owns two wall paths:
      `useFieldArray` on `layouts.{i}.shelfUnits.{u}.shelves` (`:210`) and the `shelfPath` template
      (`:216`). Both take `${unitsPath}.shelfUnits.{u}...`.
    - Its `useWatch` on `layouts.{layoutIndex}.height` (`:207`) does not move: the shelf count default
      comes from the run height in both variants.
    - `ExtrasFields` is untouched. `layouts.{i}.extras` is a valid path for both schemas.
    - This is the step the spec's parenthetical understates. After the widening, a leftover
      `layouts.{i}.shelfUnits...` still typechecks, still lints, and silently writes to a key a
      gondola object does not have. Enumerate the six paths and confirm each one by reading it, not
      by trusting the compiler.
  - [x] 5.4 Update the one existing call site
    - `WallLayoutPlan.tsx` passes `unitsPath={\`layouts.${layoutIndex}\`}`. Everything else about the
      drawer, including `key={selectedUnit.id}` and the `Ciąg {n}` title, stays as it is.
  - [x] 5.5 Resolve the template literal path typing
    - `${unitsPath}.shelfUnits.${unitIndex}.width` must satisfy
      `FieldPathByValue<OfferInput, number>` with `unitsPath` a two-member union. TypeScript
      distributes template literal types over unions, so both branches should be produced and both
      should be legal paths.
    - Fallback if it does not resolve: keep the prop union and compose the paths in the two callers
      instead, passing already-formed literal paths down. That keeps every path a literal at its
      construction site. Do not reach for a cast under any circumstance.
  - [x] 5.6 Verify
    - `pnpm validate` and `pnpm vitest run`.
    - In a running app, on the wall path only: open the drawer, change base depth, height, width and
      unit count, add and remove shelves, add and remove an extra, duplicate and remove a unit. All
      of it must behave exactly as before, and the autosave must still return a price.

**Acceptance Criteria:**
- The wall drawer is behaviourally identical to before the group.
- No `layouts.{i}.shelfUnits` path remains inside `ShelfUnitEditor.tsx`.
- `pnpm validate` passes with no cast introduced.
- Implementation matches each `acceptance` criterion declared above.

---

### Task Group 6: The gondola plan, the dispatch and the drawer

**Dependencies:** 4, 5
**Files to Modify:**
`packages/apps/web/src/offer/components/plan/GondolaLayoutPlan.tsx` (new),
`packages/apps/web/src/offer/components/OfferLayouts.tsx`
**Visual References:**
- mockup: analysis/design-context/mockups/gondola-na-planie-dwa-warianty.html
  element: screen:gondola-na-planie
  locator: variant A only, lines 261 to 277. Variant B (lines 278 to 288, one strip at doubled
  depth) is rejected and must not be built.
  acceptance: „Strona 1" caption above the first strip, two strips separated by a hairline gap, the
  same unit rectangles in both, „Strona 2" caption below the second strip. Each rectangle is
  `unit.width * SCALE_PX_PER_CM` wide by `gondolaUnit.depth * SCALE_PX_PER_CM` tall, and depth is
  read from the gondola unit, never from the layout.
- mockup: analysis/design-context/mockups/gondola-na-planie-dwa-warianty.html
  element: component:plan-unit
  locator: lines 267 to 269
  acceptance: caption `width/depth/height` joined by `/`, shelves summary underneath, the box is a
  keyboard-reachable `button`, and clicking one on either strip opens the drawer and highlights the
  matching box on both strips (R5).
- mockup: analysis/design-context/mockups/konfigurator-z-gondol.html
  element: screen:konfigurator-z-gondola
  locator: lines 278 to 300, the second card
  acceptance: the gondola card carries the identical shared header (index `Badge`, the server
  description „1 x ciąg regałów dwustronnych ...", „Liczba ciągów", price, „Powiel ciąg", „Usuń
  ciąg"), and a wall card and a gondola card sit in one list without a visual break between them.
- mockup: analysis/design-context/mockups/konfigurator-z-gondol.html
  element: component:layout-plan-header
  locator: lines 279 to 286
  acceptance: consumed unchanged from group 3. No gondola-specific header variant is created.
- mockup: analysis/design-context/mockups/szuflada-edycji-gondoli.html
  element: screen:szuflada-edycji-gondoli
  locator: lines 282 to 299
  acceptance: the drawer opens on the same editor state from either strip, with the note above the
  editor body and the four sections unchanged underneath.
- mockup: analysis/design-context/mockups/szuflada-edycji-gondoli.html
  element: component:both-sides-note
  locator: line 283
  acceptance: the note reads exactly „Zmiany dotyczą obu stron gondoli.", period included, rendered
  above the editor inside the drawer, styled as muted secondary text.
**Estimated Steps:** 7

- [x] 6.0 Complete the gondola view
  - [x] 6.1 Create `GondolaLayoutPlan.tsx` from the `WallLayoutPlan` template
    - Same prop set as `WallLayoutPlan`: `{ layoutIndex, onDuplicate, onRemove, preview }`. The two
      must be interchangeable at the dispatch site.
    - `useWatch({ name: 'layouts.{i}' })`, then `if (!layout || !isLayoutGondola(layout)) return null`.
    - **SUPERSEDED by the orchestrator before Group 6 ran.** `isLayoutGondola` is
      `v.safeParse(LayoutGondolaValue, layout).success`, a full validation, not a shape probe. It is
      the same guard that unmounted the card being edited in Group 2: clearing „Liczba ciągów" gives
      `NaN` through `valueAsNumber`, `minValue(0)` fails, the guard returns false and the whole run
      disappears mid-keystroke. Use the structural check instead:
      `if (!layout || !("gondolaUnits" in layout)) return null`. This is the same three-token check
      Group 3 put into `WallLayoutPlan.tsx`, repeated inline as step 3.4 already anticipated.
    - `const GONDOLA_UNIT_INDEX = 0` at module top. This UI reads and writes entry zero only.
    - `useFieldArray` on `layouts.{i}.gondolaUnits.0.shelfUnits`; carry over `handleDuplicateUnit`,
      `handleRemoveUnit` with its index fix-up, and the `structuredClone(getValues(...))` duplication
      idiom, all one level deeper.
  - [x] 6.2 Draw the two strips
    - Consume `LayoutPlanHeader`, `ShelvesSummary` and `SCALE_PX_PER_CM` from group 3.
    - Build the strip once (a mapped list of unit rectangles) and render it twice, both from
      `gondolaUnits.0`. Caption „Strona 1" above the first, „Strona 2" below the second.
    - Depth comes from `gondolaUnits.0.depth`; height from `layout.height`; width from each unit.
  - [x] 6.3 Share one selection across both strips
    - A single `selectedUnitIndex` and `selectedShelfIndex`, exactly as the wall plan holds them. A
      click on either strip sets the same index and both copies of that box highlight. There is no
      side index and no third selection coordinate, by design: the gondola is one configuration.
    - React keys must stay unique across the two strips; key on the field id, the copy index and the
      side.
  - [x] 6.4 Host the drawer and the symmetry note
    - Same right-side `Drawer` with `key={selectedUnit.id}`, same `Ciąg {n}` title as the wall path.
    - Render the note „Zmiany dotyczą obu stron gondoli." inside the drawer, above
      `<ShelfUnitEditor />`. It lives in this component, not in the editor, so the editor stays free
      of variant knowledge.
    - Pass `unitsPath={\`layouts.${layoutIndex}.gondolaUnits.${GONDOLA_UNIT_INDEX}\`}`.
  - [x] 6.5 Dispatch in `OfferLayouts.tsx`
    - Branch per layout on `isLayoutGondola(getValues(\`layouts.${index}\`))`, a hand-written branch
      matching the three the domain already uses. No layout-kind registry.
    - **SUPERSEDED by the orchestrator before Group 6 ran**, for the same reason as step 6.1, and
      here the failure is worse: a `safeParse` guard failing mid-edit does not blank one card, it
      routes the layout to the wall branch, which then returns `null` on its own shape check. The
      run vanishes entirely while the user is typing. Branch on `"gondolaUnits" in layout` instead.
    - Read the value from `getValues` or `useWatch`, never from the `useFieldArray` `field`
      snapshot: RHF merges an `id` into it and it can be stale.
    - Both branches receive the identical prop set, `onDuplicate` and `onRemove` included, so
      duplicating a gondola clones the whole layout value and any `gondolaUnits` entries beyond the
      first survive (R9).
  - [x] 6.6 Confirm the out-of-scope shape is not destroyed
    - A gondola that arrives with several diverging `gondolaUnits` entries is schema-legal and this
      editor cannot express it. No code is written for that case. The requirement is only that
      nothing destroys it: the editor reads and writes entry zero, RHF keeps the rest in the value,
      and duplication clones the whole layout. Check by reading the code path, not by building a
      fixture.
  - [x] 6.7 Verify
    - `pnpm validate` and `pnpm vitest run`.
    - In a running app, the full Success Criteria 1 to 5 script: add a gondola and see two strips
      with their captions; edit base depth, height, width, unit count and shelves and watch both
      strips follow; wait for the autosave and read the description and price on the header; reload
      and confirm the gondola comes back; check Rozpiska for fractional quantities and for the
      uprights line reading `N + 1` per run copy; and price a mixed offer, confirming the wall run's
      price is what it was before this task.

**Acceptance Criteria:**
- Success Criteria 1 to 5 pass in a running application, with evidence left by the E2E phase.
- The gondola and wall headers are the same component with no variant branch.
- Rozpiska shows no fractional quantity for any gondola.
- Implementation matches each `acceptance` criterion declared above.

---

### Task Group 7: Test review and success-criteria verification

**Dependencies:** 1, 2, 3, 4, 5, 6
**Files to Modify:**
`packages/domain/src/orchestrations/calculateGondolaLayoutDemand/calculateGondolaLayoutDemand.test.ts`
(only if 7.2 finds a gap; otherwise no file changes)
**Estimated Steps:** 5

- [x] 7.0 Review and fill critical gaps
  - [x] 7.1 Review the 4 tests from group 1
    - Confirm each still asserts on a whole result with `toEqual`, mocks nothing, imports fixtures
      from `packages/domain/src/fixtures`, and sits beside its subject.
  - [x] 7.2 Analyse gaps for this feature only, and write at most 2 further tests
    - The cap for this group is 10; the realistic number is 0 to 2, because the only untested surface
      the suite can reach is the domain, and group 1 covers the rule, the scaling, the two numbers
      and the integer guarantee.
    - Add a test only for a genuine gap. Do not add coverage for the web layer, and do not add a
      `.test.tsx` file: the runner would not match it and the environment could not run it.
  - [x] 7.3 Run the feature tests, then the whole suite
    - `pnpm vitest run` in full. Expect green with the single moved assertion and nothing else.
  - [x] 7.4 Run the mechanical success criteria
    - SC 6: `pnpm validate` and `pnpm vitest run` pass, and `git diff` shows the only changed
      pre-existing assertion in the repository is `leg-130-8-3`, 8 to 4.
    - SC 7: `packages/apps/web/src/offer/offer.types.ts` does not exist and no `as WallOfferInput`
      remains.
    - SC 8: `grep -rn 'from "@/domain' packages/apps/web/src` returns eleven lines, the same eleven
      as before.
  - [x] 7.5 Report the split plainly in the work log
    - State which parts were verified by `pnpm vitest run`, which by `pnpm validate` only, and which
      by exercising the running application. No step touching the view may be reported as done on
      `pnpm validate` alone.
    - Leave every change unstaged in the working tree. No `git add`, no commit, no push, no branch.
      Propose a commit message and stop.

**Acceptance Criteria:**
- All feature tests pass (4 to 6 total).
- No more than 2 additional tests added, and none of them a component test.
- Success Criteria 6, 7 and 8 all verified from the command line, with the commands and their output
  recorded.
- Success Criteria 1 to 5 handed to the E2E phase with the script above.

---

## Execution Order

One serial chain. Three files are touched by three groups each
(`OfferLayouts.tsx` in 2, 4 and 6; `WallLayoutPlan.tsx` in 2, 3 and 5;
`ShelfUnitEditor.tsx` in 2 and 5), so nothing here is safe to run concurrently even where the
dependency graph would allow it.

1. Group 1, Domain shared uprights (5 steps, no dependencies)
2. Group 2, Form type widening (6 steps, depends on 1)
3. Group 3, Plan extractions (5 steps, depends on 2)
4. Group 4, Factory and add buttons (6 steps, depends on 2)
5. Group 5, Editor parameterisation (6 steps, depends on 3)
6. Group 6, Gondola plan, dispatch and drawer (7 steps, depends on 4 and 5)
7. Group 7, Review and success criteria (5 steps, depends on all)

Groups 3 and 4 are the only pair whose declared dependencies would permit concurrency, and they are
still run in order because group 4's checkpoint is easier to read against an unchanged wall path.

## Standards Compliance

Follow the standards in `.maister/docs/standards/`, with `CLAUDE.md` and `docs/decisions.md` taking
precedence wherever they disagree:

- `global/coding-style.md`: named exports, function declarations, `type` over `interface`, three-tier
  import order, named constants (`SCALE_PX_PER_CM`, `GONDOLA_SIDES`, `GONDOLA_UNIT_INDEX`), a real
  guard instead of a cast at every indexed or optional read.
- `global/commenting.md`: no inline comments; JSDoc on the exported factory only.
- `global/minimal-implementation.md`: no registry, no extraction of the six editor sub-components, no
  stubs for asymmetric gondolas.
- `global/validation.md`: Valibot stays the contract; no new form-layer validation.
- `backend/domain.md`: the domain depends on nothing, one folder per function, `(context, inventory)`,
  pure functions.
- `frontend/components.md`: feature folders, props inline, destructured and alphabetical, one
  `useForm` shared through context, the browser bundle never importing domain code.
- `frontend/language.md`: every user-facing string in Polish, prices through the single `formatPrice`.
- `frontend/accessibility.md`: semantic markup, keyboard-reachable unit boxes, Polish `aria-label`s
  on icon-only buttons.
- `testing/test-writing.md`: nothing is mocked, tests beside their subject, explicit vitest import,
  one top-level `describe`, fixtures from `packages/domain/src/fixtures`, whole-result assertions,
  UI deliberately untested.
- `workflow/git.md` and `workflow/process.md`: one concern per step, changes left unstaged, no
  commits or pushes by the agent, `pnpm validate` and `pnpm vitest run` before each step is reported.

## Notes

- Test-Driven: group 1 starts with its 4 tests. Groups 2 to 6 have no test to start with, which is a
  project decision and not an omission; each names its real gate instead.
- Run Incrementally: run the touched tests after each step, then `pnpm vitest run` as the regression
  gate before reporting.
- Mark Progress: check off steps as they complete. This markdown is the resume source of truth.
- Reuse First: `createDefaultWallLayout`, `useInventoryDimensions`, `ExtrasFields`, `formatPrice`,
  `core/ui/*`, the two schema guards and `calculateWallLayoutDemand` all carry the gondola without
  being restructured.
- The gondola shipped here has no end cap, while the client's standard gondola does, so the quote for
  the standard case is systematically low. Accepted knowingly, closed by a separate task, and to be
  said to the client before the demo.

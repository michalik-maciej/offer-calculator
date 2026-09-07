# Specification: Gondola layout support in the offer configurator UI

## TL;DR

A gondola becomes creatable, editable, drawable and priceable, always symmetric: one `gondolaUnits`
entry with `numberOfGondolaUnits: 2`. The form generic collapses to `OfferInput`, deleting
`offer.types.ts` and the hydration cast with it. Uprights become shared between the sides, carried
by an optional leg scope that `calculateWallLayoutDemand` defaults for the wall path, so no wall
assertion can move. The gondola ships without an end cap, understating the standard case.

## Key Decisions

- **Collapse the form type to `OfferInput`, delete `offer.types.ts`.** A mixed offer makes any
  per-variant narrowing factually false, so keeping two narrowed types would double a cast the
  coding-style standard already rules out.
- **Upright rule: `ceil(numberOfGondolaUnits / 2) * (units + 1) * numberOfLayouts` per
  `gondolaUnits` entry.** One shared column per pair of sides, a full column for a lone side, and no
  fraction can ever leave the orchestration.
- **`calculateWallLayoutDemand` keeps its leg counting and gains an optional leg scope, defaulting
  to `numberOfLayouts`.** The wall path passes nothing, so its result and its list order are
  untouched by construction, and no new domain file is needed.
- **The gondola orchestration passes `ceil(numberOfGondolaUnits / 2) * numberOfLayouts` as that
  scope.** `calculateLegDemand` already expresses the rule through its `numberOfLayouts` argument,
  so the shared column costs one argument rather than a refactor of the file the working wall
  pricing rests on.
- **The wall demand output is frozen in content and in order.** Three passing tests compare whole
  results with `toEqual`, and the default keeps that promise without anyone having to preserve an
  order by hand.
- **Two add buttons: „Dodaj ciąg przyścienny" and „Dodaj gondolę".** Binding mockup decision, and
  this control is the only entry point into the whole feature.
- **The gondola is drawn as two strips back to back, both from the same configuration.** Binding
  mockup decision, it is what a gondola physically is, and it matches the v2 prior art geometry.
- **One editor parameterised on a units path prefix, two separate plan components.** The editor
  difference between the variants is one path segment; the plan difference is what it draws.
- **The gondola factory takes its defaults from `createDefaultWallLayout` and builds the gondola
  object key by key.** No twelfth `@/domain` import in the browser, and no wall key can leak into a
  gondola object.

## Open Questions / Risks

- React Hook Form typing over a union array is the one thing that could turn the type widening from
  mechanical into awkward, and it has **two** surfaces, not one. Verify both with `pnpm typecheck`
  before any new component is written.
  - `FieldPathByValue<OfferInput, number>` for the stepper `name` props. Fallback: type those props
    explicitly, never reintroduce a per-variant cast.
  - `useFieldArray`, which resolves through `ArrayPath` / `FieldArray` and is therefore untouched by
    the first fallback. Three call sites take array paths that exist on only one member of the
    union: `OfferLayouts.tsx:14` (`layouts`), `WallLayoutPlan.tsx:69`
    (`layouts.{i}.shelfUnits`) and `ShelfUnitEditor.tsx:210` (`...shelfUnits.{u}.shelves`). Both
    surfaces should resolve by the same distributive-conditional mechanism, so this is a
    completeness gap in the risk register rather than a predicted failure. Fallback if it bites:
    give `name` an explicitly typed value at those three sites, and keep the runtime path
    unchanged.
- The wall path is protected by a default, not by discipline, but the default has to actually be
  applied. `calculateWallLayoutDemand.test.ts:43` asserts `{ id: "leg-130-8-3", quantity: 12 }` as
  the tenth element of a whole-list `toEqual`, so any wall assertion that moves means the wall call
  site started passing a scope it should not pass.
- **A gondola priced by this iteration carries no end cap, while the client's standard gondola has
  one** (`analysis/client-requirements.md`, section 5: "standardowo: ze szczytem"). The quote for
  the standard case is therefore systematically understated. This is a known and accepted gap, to be
  closed by a separate task before the feature is shown to the client.
- Every offer re-saved after this change re-prices its gondolas under the new upright rule. Nothing
  is persisted today (the UI never created a gondola), so there is nothing to migrate, but the same
  input priced before and after the change gives different numbers.
- Nothing added on the web side is covered by the test suite: zero tests under
  `packages/apps/web`, Vitest runs in Node with no JSDOM, coverage is collected from
  `packages/domain` only. Browser verification in the E2E phase is not a nice-to-have here, it is
  the only real gate the view layer has, and Success Criteria 1 to 5 are written to be run there.
- A schema-legal gondola with several diverging `gondolaUnits` entries cannot be expressed by this
  editor. The form shows and edits entry zero and leaves the rest of the array untouched, so the
  drawing shows less than the price covers.

---

## Goal

Give the user a way to add, edit, see and price a double-sided run (gondola) in the offer
configurator, and correct what a gondola costs by sharing one column of uprights between its two
sides, as the first version of this calculator did.

## User Stories

- As an offer author, I want to add a gondola next to a wall run, so that I can quote a
  double-sided display without leaving the configurator.
- As an offer author, I want to edit a gondola's base depth, height, unit width, unit count and
  shelves once and have both sides follow, so that the roughly 90% of gondolas that are symmetric
  take one pass instead of two.
- As an offer author, I want to see the gondola on the plan as two strips back to back, so that the
  drawing matches the object I am quoting.
- As the maintainer, I want a gondola to be priced with one shared column of uprights, so that the
  quote matches what the client was charged by the first calculator.

## Core Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| R1 | Two add buttons side by side replace the single „Dodaj ciąg": „Dodaj ciąg przyścienny" and „Dodaj gondolę". Each is disabled independently when its own factory returns `null`, and the hint under the buttons names the type that cannot be built. | must |
| R2 | The default gondola is exactly one `gondolaUnits` entry with `numberOfGondolaUnits: 2`, one shelf unit, the smallest height, base depth and unit width the inventory offers, a shelf depth preferring the run depth, a shelf count from the height table with fallback 1, `shelves` always present (at least `[]`), `numberOfLayouts: 1` and `extras: []`. The factory returns `null` when the inventory cannot furnish a run, exactly like the wall factory. | must |
| R3 | The configurator dispatches per layout to the wall plan or the gondola plan, discriminating structurally with `isLayoutWall` / `isLayoutGondola` from `@/schemas`, reading the value from `useWatch` / `getValues` and never from the `useFieldArray` field snapshot. | must |
| R4 | The gondola plan draws a top view at `SCALE_PX_PER_CM = 1.6`: two strips of unit rectangles back to back, both rendered from `gondolaUnits.0`, captioned „Strona 1" above the first strip and „Strona 2" below the second. Box captions stay width/depth/height as in the wall plan, with the shelves summary underneath. | must |
| R5 | Clicking a box on either strip opens the right drawer with the same editor state, and selecting a unit highlights the matching box on both strips, so the drawing says these are one configuration and not two editable rows. | must |
| R6 | The drawer carries the note „Zmiany dotyczą obu stron gondoli." above the editor. | must |
| R7 | The gondola editor collects: „Głębokość bazy" at `layouts.{i}.gondolaUnits.0.depth`, „Wysokość" at `layouts.{i}.height`, „Szerokość", „Liczba regałów" and „Dodaj regały" under `layouts.{i}.gondolaUnits.0.shelfUnits.{u}`, „Półki" under that unit's `shelves`, and „Inne elementy ciągu" at `layouts.{i}.extras`. It must not collect a layout-level depth and must not put extras on a gondola unit. | must |
| R8 | The run header is identical for both types: index `Badge`, the server-computed description, „Liczba ciągów", the price through `formatPrice`, „Powiel ciąg" and „Usuń ciąg". Wall header behaviour, markup and copy do not change. | must |
| R9 | Duplicating and removing a gondola run work from the shared header and clone or drop the whole layout value, preserving any `gondolaUnits` entries beyond the first. | must |
| R10 | Uprights for a gondola are counted as `ceil(numberOfGondolaUnits / 2) * (units + 1) * numberOfLayouts` per `gondolaUnits` entry, where `units` is that entry's summed `numberOfShelfUnits` and `numberOfLayouts` is the run-level count. No fractional quantity may leave `calculateGondolaLayoutDemand`. | must |
| R11 | Feet stay counted in full per side, and back panels, base shelves and shelves stay per side. Only uprights change. | must |
| R12 | `calculateWallLayoutDemand` keeps its `calculateLegDemand` call and gains one optional leg scope, defaulting to `numberOfLayouts`. The wall call site passes nothing, so the wall demand list stays identical in content and in order. `calculateGondolaLayoutDemand` keeps delegating per side and passes `ceil(numberOfGondolaUnits / 2) * numberOfLayouts` as that scope. No leg-free core is extracted and no new domain file is created. | must |
| R13 | The form generic becomes `OfferInput`: `offer.types.ts` is deleted, the `as WallOfferInput` cast at `OfferFormProvider.tsx:37` is removed, and every whole-layout consumer narrows with the schema guards. | must |
| R14 | The web layer gains no new `@/domain` import. The eleven existing ones are recorded debt and this task does not add to it. | must |
| R15 | Every new user-facing string is Polish, drawn from the vocabulary already in the application: ciąg, regał, półki, Głębokość bazy, Wysokość, Szerokość, Liczba ciągów, Liczba regałów, Liczba półek, Inne elementy ciągu, Powiel ciąg, Usuń ciąg, plus the domain's own „N x ciąg regałów dwustronnych" (`buildLayoutDescription.ts:29`). „Strona" is the one genuinely new word: it appears nowhere under `packages/`, and comes from the maintainer's naming decision (`analysis/clarifications.md`, question 4) as rendered in the mockups. | must |
| R16 | Pricing stays server-side. Nothing in the browser computes a price; the existing 800 ms debounced autosave PUT remains the only path from an edit to a number on screen. | must |
| R17 | The configurator page carries the mockup's subtitle under the two buttons: „Oferta może mieszać oba rodzaje ciągów. Wycena spływa z serwera po zapisie." | should |

## Visual Design

Mockups in `analysis/design-context/` are binding inputs, not references. The
implementation-planner will attach `Visual References` to the UI task groups.

| ID | File | What it fixes |
| --- | --- | --- |
| `screen:dodawanie-ciagu` | `analysis/design-context/mockups/dodawanie-ci-gu-dwa-warianty.html` | Variant A wins: two buttons side by side, reusing `core/ui/button.tsx`. The type picker variant (and with it `core/ui/radio-group.tsx`) is not built. |
| `screen:gondola-na-planie` | `analysis/design-context/mockups/gondola-na-planie-dwa-warianty.html` | Variant A wins: two strips back to back at `depth * 1.6` each, not one strip at doubled depth. Side captions „Strona 1" and „Strona 2". |
| `screen:konfigurator-z-gondola` | `analysis/design-context/mockups/konfigurator-z-gondol.html` | The full page: a wall run and a gondola side by side, shared header (badge, domain description, „Liczba ciągów", price, duplicate, delete), the two add buttons and the page subtitle. |
| `screen:szuflada-edycji-gondoli` | `analysis/design-context/mockups/szuflada-edycji-gondoli.html` | The right drawer for a gondola: the note „Zmiany dotyczą obu stron gondoli." above the existing sections Ciąg, Regały, Półki and Inne elementy ciągu. |
| `component:layout-plan-header` | `konfigurator-z-gondol.html` | The shared run header, the extraction target in `WallLayoutPlan.tsx:97-137`. |
| `component:plan-unit` | `gondola-na-planie-dwa-warianty.html` | The unit rectangle at 1.6 px per cm, caption width/depth/height, clickable, opens the drawer. |
| `component:both-sides-note` | `szuflada-edycji-gondoli.html` | The symmetry note, the only element that communicates shared configuration. |

**Fidelity**: structural, not pixel-perfect. The mockups were built against this project's own
tokens (`packages/apps/web/src/index.css`) and `core/ui` primitives, so the implementation reuses
those primitives and reproduces the layout, spacing intent and copy, not exact pixel values. The
two decisions listed above (two buttons, two strips) are binding, not advisory.

## Reusable Components

### Existing Code to Leverage

| Path | What it provides | How it is used |
| --- | --- | --- |
| `packages/apps/web/src/offer/components/plan/WallLayoutPlan.tsx` | The per-run plan template: header, scale drawing, duplicate/remove, drawer host, `handleRemoveUnit` index fix-up, `structuredClone(getValues(...))` duplication idiom | Header block (lines 97-137, the `<header>` element) extracted into a shared component and consumed by both plans; the rest is the template the gondola plan follows |
| `packages/apps/web/src/offer/components/editor/ShelfUnitEditor.tsx` | The drawer editor with `OptionStepper`, `CountStepper`, `SectionNavigator`, `SectionLabel`, `ValueDisplay`, `ShelvesFields` | Parameterised on a units path prefix and reused for both variants; the six file-local sub-components are not extracted, because a single editor serves both |
| `packages/apps/web/src/offer/components/editor/ExtrasFields.tsx` | „Inne elementy ciągu" at `layouts.{i}.extras` | Reused unchanged apart from the form generic; the path is valid for both variants |
| `packages/apps/web/src/offer/helpers/createDefaultWallLayout.ts` | The default-picking rule and the `null` means cannot-furnish contract | The gondola factory takes its values from it, keeping one source for the rule and avoiding a new `@/domain` import |
| `packages/apps/web/src/offer/hooks/useInventoryDimensions.ts` | `layoutHeights`, `layoutDepths`, `shelfUnitWidths`, `shelfDepths` | Reused unchanged: a gondola is constrained by the same four dimensions, because gondola demand delegates per side to the wall calculation |
| `packages/apps/web/src/offer/helpers/formatPrice.ts` | The only price formatter (`Intl`, `pl-PL`, PLN) | Used through the shared header; no second formatter is created |
| `packages/schemas/src/LayoutWall.schema.ts`, `LayoutGondola.schema.ts` (`isLayoutWall`, `isLayoutGondola`) | Structural type guards, browser-safe | The only sanctioned way the UI tells the two variants apart |
| `packages/apps/web/src/core/ui/*` (`button`, `badge`, `drawer`, `input`, `label`) | The primitives the wall path already uses | Reused as-is; no new primitive is added |
| `packages/domain/src/orchestrations/calculateWallLayoutDemand/calculateWallLayoutDemand.ts` | The per-side demand composition (back panels, base shelves, shelves, legs, feet, extras) that both variants run through | Extended, not restructured: one optional leg scope is added, defaulting to `numberOfLayouts`. The wall call site passes nothing; the gondola orchestration keeps delegating per side and passes the shared scope |
| `packages/domain/src/calculations/calculateLegDemand/calculateLegDemand.ts` | `(numberOfUnits + 1) * numberOfLayouts` for a given height | Unchanged. Its `numberOfLayouts` argument already expresses "how many columns of this run exist", which is exactly what the leg scope feeds, and `ceil(n / 2)` keeps that argument an integer |
| `packages/domain/src/fixtures/` (`componentCatalogMock`, `validOfferInput`) | Test data | The fixtures for every domain test touched here; no new fixture file unless an existing one cannot express the case |
| `packages/apps/api`, `packages/schemas/src/Offer.schema.ts`, Prisma schema | Validation, pricing round trip, persistence | Unchanged. `OfferInputSchema` already accepts the union and `updateOffer.controller.ts` already prices whatever validates |

### New Components Required

| Path | Why existing code cannot serve |
| --- | --- |
| `packages/apps/web/src/offer/components/plan/GondolaLayoutPlan.tsx` | The geometry is genuinely different: two strips from one configuration, side captions, a doubled set of clickable boxes sharing one selection. That is what a separate component is for, and parameterising `WallLayoutPlan` on it would put two drawings in one file. |
| `packages/apps/web/src/offer/components/plan/LayoutPlanHeader.tsx` | Extracted, not written: the header (`WallLayoutPlan.tsx:97-137`) is identical for both types and would otherwise be about 40 duplicated lines. Extracting it before the second plan exists is what keeps the wall header and the gondola header from drifting. |
| `packages/apps/web/src/offer/helpers/createDefaultGondolaLayout.ts` | The wall factory returns a `LayoutWall`, which is a different shape with different required keys. The contract (`null` means cannot furnish) is mirrored exactly, the values are taken from the wall factory, and the object is built key by key so no wall key leaks. |

No other new file is justified, and in particular **no new domain file**: the leg scope is one
optional argument on a function that already exists, so nothing is extracted into a shared leg-free
core and no new folder, name or test appears under `packages/domain`. Also declined: no layout-kind
registry (a speculative abstraction under the minimal-implementation standard, a hand-written branch
matches the three that already exist in the domain), no gondola-specific editor (the difference is
one path segment), no gondola constraints in the domain (the constraints are identical and importing
them would breach R14), and no `type` discriminant in the schemas (it would mean changing both
layout schemas, switching to `v.variant` and migrating every persisted `input` JSON).

## Technical Approach

### The form type: collapse to `OfferInput`

`packages/apps/web/src/offer/offer.types.ts` narrows the layout union to `LayoutWall[]` and is the
form's type argument in six other files (`useForm` at `OfferFormProvider.tsx:18`, `useFormContext`
everywhere else). Two options were carried into this
specification (see `analysis/technical-clarifications.md`, T1). **Option A is chosen: the type
collapses to `OfferInput` and the file is deleted.**

Reasoning, in the order that decided it:

1. **Option B is not merely stylistic debt, it is false.** The configurator explicitly supports an
   offer that mixes both run types (R1, and the mockup says so on the page). For such an offer
   neither `WallOfferInput` nor a new `GondolaOfferInput` describes the form value: the `layouts`
   array holds both. Option B therefore keeps a cast that asserts something the data contradicts,
   in two places instead of one.
2. **It removes a live defect for free.** `OfferFormProvider.tsx:37` force-casts a hydrated offer to
   the wall type today, so a saved gondola would be mistyped on load. Widening deletes the cast
   rather than duplicating it, and `.maister/docs/standards/global/coding-style.md` is explicit that
   narrowing is done with a real guard and never with a cast.
3. **It deletes a file instead of adding one**, which is what the minimal-implementation standard
   asks of a change with two viable shapes.
4. **The narrowing it forces is needed anyway.** R3 already requires a structural guard per layout
   to dispatch the plan. Each plan component narrows once at the top and returns `null` otherwise,
   which folds into the `if (!layout) return null` guard that `noUncheckedIndexedAccess` already
   requires there.
5. **Field paths widen for free.** `FieldPathByValue<OfferInput, number>` covers the gondola paths,
   so `OptionStepper` and `CountStepper` need no change.

The cost is real and named in the risks: every whole-layout `useWatch` returns a union. The order of
work follows from it: widen the type and run `pnpm typecheck` before writing any new component, so
that the one uncertainty (React Hook Form path typing over a union array) resolves before anything
is built on top of it.

### The upright rule and how it reaches `calculateLegDemand`

Per `gondolaUnits` entry:

- uprights: `ceil(numberOfGondolaUnits / 2) * (units + 1) * numberOfLayouts`, where `units` is the
  entry's summed `numberOfShelfUnits` and `numberOfLayouts` is the run-level value
- feet: unchanged, `(units + 1) * numberOfLayouts * numberOfGondolaUnits`, that is, a full set per
  side
- back panels, base shelves, shelves: unchanged, per side

For the shape this UI creates (one entry, two sides) that is one column of `units + 1` uprights per
run copy. For a lone side it is a full column, which is physically right. The `ceil` guarantees the
result is an integer: no fraction may leave the orchestration, because `calculateBomPrice` and
`breakdownDemandByCategory` take the demand list raw and neither rounds, so half an upright would
surface in Rozpiska as "0.5".

Uprights are the only one of the five demands that now needs a scope different from the other four,
and `calculateWallLayoutDemand` computes all five in one call. **`calculateWallLayoutDemand` keeps
that call and takes one optional leg scope, defaulting to `numberOfLayouts`.** The wall path passes
nothing and is therefore unchanged, byte for byte and element for element. The gondola orchestration
keeps delegating per side and passes `ceil(numberOfGondolaUnits / 2) * numberOfLayouts`, which
`calculateLegDemand` multiplies by `units + 1` to give exactly the rule above.

Read the two numbers carefully, because they are not the same number. The delegated context keeps
folding the side count into its `numberOfLayouts` (`numberOfLayouts * numberOfGondolaUnits`), which
is what keeps back panels, base shelves, shelves and feet at a full set per side. The leg scope is
the run-level `numberOfLayouts` narrowed by `ceil(numberOfGondolaUnits / 2)` instead, and it applies
to uprights only. Worked against the existing gondola fixture: entry zero (2 sides, 3 units, 1 run)
gives feet `(3 + 1) * 2 = 8`, unchanged, and uprights `(3 + 1) * 1 = 4`, down from 8; entry one
(1 side, 1 unit, 1 run) gives `ceil(1 / 2) = 1`, so both feet and uprights stay at 2.

Three reasons this beats extracting a leg-free core into a shared function:

1. **It cannot move the wall path.** Legs sit in the middle of the returned list (back panels, base
   shelves, shelves, **legs**, feet, extras), and `calculateWallLayoutDemand.test.ts:43` freezes
   `{ id: "leg-130-8-3", quantity: 12 }` as the tenth element of a whole-list `toEqual`. Any
   extraction either restores legs to the middle by hand or reorders the list; a default argument
   does neither, because nothing about the wall call changes.
2. **It creates no new domain file.** The order-preserving extraction needs a shared leg-free
   function, which under `.maister/docs/standards/backend/domain.md` means a new folder, a new name
   and a new test, on the one path where nothing was wrong.
3. **`calculateLegDemand` already expresses the rule.** Its `numberOfLayouts` argument means "how
   many columns of this run exist", which is exactly what the gondola narrows. No new calculation,
   no coefficient invented for the occasion.

The counter-argument is that a scope argument is a coefficient passed into a shared calculation,
which reads less explicitly than two orchestrations each counting their own. That is accepted here
because the argument is named, optional and defaulted: the wall call site says nothing at all, so
the function still reads as "a full column per run copy unless the caller says otherwise". The
earlier reason for rejecting this shape, that it introduces a fraction into a function working in
whole numbers, is simply false under the rule that was chosen: `ceil(n / 2)` is an integer for every
integer `n`.

**Expected test movement, in full: one assertion.**

- `calculateGondolaLayoutDemand.test.ts`: the first entry's `leg-130-8-3` goes from 8 to 4. That is
  the only change to the file. The second entry (`numberOfGondolaUnits: 1`) stays at 2, and the list
  order does not move, because the gondola still runs each side through the same composition.
- `calculateOfferDemand.test.ts`: unchanged. Its gondola has `numberOfGondolaUnits: 1`, so
  `leg-130-8-3: 2` holds, and with no reordering there is nothing else to touch.
- `calculateWallLayoutDemand.test.ts`, `createOfferPreview.test.ts`, `calculateLegDemand.test.ts`:
  unchanged. Any edit to one of them means the wall call site started passing a scope it should not
  pass, and the fix is the call site, not the expectation.

Also not carried over from the prior art: v1 priced uprights from the unhalved count, so its
upright price was double its upright quantity. Quantity and price here come from the same number.

### Component decomposition

- **Editor**: one `ShelfUnitEditor`, parameterised on a units path prefix
  (`layouts.{i}` for a wall, `layouts.{i}.gondolaUnits.0` for a gondola), which is the whole
  difference: it carries `depth` and `shelfUnits`. `height` stays at `layouts.{i}.height` and
  `extras` at `layouts.{i}.extras` for both variants, so `ShelvesFields` and `ExtrasFields` are
  untouched apart from the generic. A gondola sibling would be a copy of 363 lines differing by one
  path segment.
- **Plan**: two components sharing the extracted header. The gondola plan iterates
  `gondolaUnits.0.shelfUnits`, renders the resulting strip twice, and reads depth from the gondola
  unit rather than from the layout.
- **Dispatch**: a hand-written branch in `OfferLayouts.tsx`, matching the three structural branches
  the domain already uses.

### The gondola shape this UI creates

Exactly one `gondolaUnits` entry with `numberOfGondolaUnits: 2`. That field is pinned by the factory,
never rendered and never edited, which is what removes the side index, the per-side editor and the
third drawer-selection coordinate that a per-side model would have required. Because there is one
entry, `buildLayoutDescription` reading only `gondolaUnits[0]` is correct for everything this UI can
produce, and the domain needs no change there.

What that shape prices, and what it does not: two sides of shelf units with their back panels, base
shelves, shelves, one shared column of uprights, two full sets of feet, and whatever the user adds
under „Inne elementy ciągu". It carries **no end cap, no double back and no bottom or top cover**,
all three deferred by decision 3 in `analysis/clarifications.md`. The end cap is the commercially
significant one: `analysis/client-requirements.md` section 5 says the client's standard gondola has
one ("standardowo: ze szczytem"), so a quote produced by this iteration for the standard case is
systematically low. Anything an end cap would have contributed can still be entered by hand as an
extra, but nothing in the UI says so. This is accepted, and it is the reason the gap belongs in
front of the client before the first demo rather than after it.

### Discrimination and the union-ordering trap

`OfferInputSchema` lists gondola first in the union and Valibot returns the first fully valid option
while stripping unknown keys, whereas the domain switches on `isLayoutWall` first. An object
carrying both `gondolaUnits` and layout-level `depth` / `shelfUnits` would be persisted as a gondola
with its wall keys stripped, yet classified as a wall by a client guard checking wall first. This
stays dormant as long as no code path produces a hybrid object, which is why the gondola factory
builds its result key by key and never by spreading a wall layout, and why nothing in this task
converts an existing run from one type to the other.

### Persistence and data lifecycle

No schema change, no migration, no API change, no Prisma change. A gondola appended into the field
array is validated and priced by the server on the first autosave, before any plan component exists,
which is the natural mid-implementation checkpoint to exercise in a running app. Offers keep the
output they were quoted at (decision 7 in `docs/decisions.md`), so no saved offer re-prices until
something makes its form dirty again.

A persisted gondola with several diverging `gondolaUnits` entries is schema-legal and cannot be
drawn by this editor. No code is written for that case (see `analysis/scope-clarifications.md`, I4).
The required behaviour is only that nothing destroys it: the editor reads and writes entry zero,
React Hook Form keeps the remaining entries in the value, and duplication clones the whole layout,
so entries one and up survive an edit and an autosave.

## Implementation Guidance

### Testing Approach

2 to 8 focused tests per implementation step group. Test verification runs the new and touched
tests, not the entire suite, with `pnpm vitest run` as the regression gate before the step is
reported.

The domain half is the only part this suite can verify. Candidate assertions for that group:

1. A two-sided gondola entry yields one shared column of uprights (`units + 1`), multiplied by
   `numberOfLayouts`.
2. A one-sided entry keeps a full column, so mixed entries add up as the rule says.
3. No demand entry the orchestration returns carries a fractional quantity.
4. The wall demand result is unchanged when no leg scope is passed, asserted on the whole list
   including order (this is the existing `calculateWallLayoutDemand` test, which must pass
   untouched).

Project constraints that bind every one of them (`.maister/docs/standards/testing/test-writing.md`):
nothing is mocked, ever (the domain package depends on nothing and collaborators are injected);
tests sit beside their subject as `{name}.test.ts`; each file opens with an explicit
`import { describe, expect, it } from "vitest"` and holds a single top-level `describe` with `it`;
fixtures come from `packages/domain/src/fixtures`; assertions compare the whole result object with
`toEqual`.

**The React layer cannot be unit-tested here.** There are zero tests under `packages/apps/web`,
Vitest runs in a Node environment with no JSDOM (`vitest.config.ts` would not even match a
`.test.tsx` file), and coverage is collected from `packages/domain` only. This is a recorded
decision, not an accident: `.maister/docs/standards/testing/test-writing.md` states that UI
components have no unit tests by decision. Do not propose or write component tests, and do not
propose lifting the constraint inside this task.

**Browser verification is what stands in for those tests, and it is the only real gate for the view
layer** (`analysis/requirements.md` names the E2E phase as „jedyną realną bramką dla warstwy
widoku"). It is therefore not optional manual clicking: the E2E phase runs the script in Success
Criteria 1 to 5 against a running application and leaves evidence, and Success Criteria 6 to 8 are
the mechanical half that the command line can check. Where the two halves split:

| Verified by | Covers |
| --- | --- |
| `pnpm vitest run` | The upright rule and the frozen wall result (Success Criteria 6) |
| `pnpm validate` plus the grep in Success Criteria 8 | Types, lint, formatting, the deleted type file and the eleven `@/domain` imports (Success Criteria 7 and 8) |
| The E2E phase, in a browser | Adding a gondola, the two strips and their captions, the drawer applying to both sides, the description and price arriving from the autosave, reload, and a mixed offer (Success Criteria 1 to 5) |

The work log must say plainly which parts were verified statically only, and no step touching the
view may be reported as done on the strength of `pnpm validate` alone.

### Standards Compliance

| Standard | What it binds here |
| --- | --- |
| `.maister/docs/standards/global/coding-style.md` | Named exports, function declarations, `type` over `interface`, three-tier import order, guarding an indexed or optional read with a real guard and never a cast (the reason Option A wins), named constants instead of bare numbers (`SCALE_PX_PER_CM`) |
| `.maister/docs/standards/global/minimal-implementation.md` | No registry, no speculative extraction of the six editor sub-components, no future stubs for asymmetric gondolas |
| `.maister/docs/standards/global/commenting.md` | No inline comments; JSDoc on the exported factory, as `createDefaultWallLayout` has |
| `.maister/docs/standards/global/validation.md` | Valibot schemas stay the contract; no new validation is added at the form layer beyond what already exists |
| `.maister/docs/standards/backend/domain.md` | The domain depends on nothing, layers run one way, one folder per function, pure functions with no I/O |
| `.maister/docs/standards/frontend/components.md` | Feature folders, props inline, destructured and alphabetical, forms shared through context and never a second `useForm`, the browser bundle never importing domain code (R14) |
| `.maister/docs/standards/frontend/language.md` | Every user-facing string in Polish, `Intl` with `pl-PL` through the single existing price formatter |
| `.maister/docs/standards/frontend/accessibility.md` | Semantic markup, keyboard-reachable unit boxes and buttons, `aria-label` in Polish on icon-only buttons, as the wall header already does |
| `.maister/docs/standards/testing/test-writing.md` | See Testing Approach above |
| `.maister/docs/standards/workflow/git.md`, `workflow/process.md` | One concern per step, changes left unstaged in the working tree, no commits or pushes by the agent, `pnpm validate` and `pnpm vitest run` before each step is reported |
| `CLAUDE.md`, `docs/decisions.md` | Take precedence over the standards where they disagree. Read `docs/decisions.md` before touching package wiring, auth or how offers are persisted |

## Out of Scope

Each of these is its own future task and must not be folded into this one:

- Gondola end caps (szczyt), in any form. **Note the commercial consequence**: the client's standard
  gondola has an end cap, so every quote this iteration produces for the standard case is
  understated. Accepted knowingly, to be closed by a separate task, and to be said out loud to the
  client before the feature is demonstrated.
- Double back panels („podwójne plecy", 0 / 1 / 2)
- Bottom and top covers („osłona dolna", „osłona górna")
- The „półka nie głębsza niż baza" validation
- A right-click context menu on plan elements
- Redesigning the shelves dialog, and shelf ordering by depth
- Reordering the controls inside the drawer (unit add/remove to the top)
- The permanent caption at the bottom of the screen
- Asymmetric gondolas, per-side editing, and any „rozłącz gondolę" action
- Converting an existing run between wall and gondola
- Fixing `buildLayoutDescription` to cover `gondolaUnits` entries beyond the first
- The smaller pre-existing defects recorded in `analysis/codebase-analysis.md` (the `numberOfLayouts`
  validation hole, the `key={extraValues.length}` remount hack, the duplicated `CATEGORY_LABELS`
  name, the repo-absolute import in `routes/order.tsx`, the `if (parsed.issues)` spelling in
  `createOffer.controller.ts`, the unmemoised factory call, the dead `offerQueries.preview`, the
  wording in `BreakdownList.tsx:26`) and the `CLAUDE.md` drift about `packages/apps/web/src/layout/`

## Success Criteria

Criteria 1 to 5 are the E2E script for the view layer, which has no unit tests by decision. Criteria
6 to 8 are mechanical and run from the command line.

1. From a logged-in session with a stocked inventory, „Dodaj gondolę" produces a run whose plan
   shows two strips of identical boxes, „Strona 1" above and „Strona 2" below.
2. Editing base depth, height, unit width, unit count or shelves through the drawer changes both
   strips at once, and after the 800 ms autosave the header shows a description beginning with
   „1 x ciąg regałów dwustronnych" and a price.
3. Reloading the offer brings the gondola back unchanged, with no cast in the hydration path.
4. Rozpiska shows no fractional quantity for any gondola, and the uprights line for a default
   gondola with N units reads `N + 1` per run copy, not `2 * (N + 1)`.
5. An offer mixing a wall run and a gondola prices both, and the wall run's price is identical to
   what it was before this change.
6. `pnpm validate` passes, `pnpm vitest run` passes, and **the only changed assertion in the whole
   suite is the gondola upright quantity, 8 to 4** in
   `calculateGondolaLayoutDemand.test.ts`. Nothing else moves, including list order.
7. `packages/apps/web/src/offer/offer.types.ts` no longer exists and no `as WallOfferInput` cast
   remains.
8. `grep -rn 'from "@/domain' packages/apps/web/src` still returns eleven lines, the same eleven as
   before (R14).

## Known Limitations

- The description on a gondola header is built from `gondolaUnits[0]`. Correct for everything this
  UI creates, incomplete for a run that arrives with several entries by another route.
- A gondola that arrives with several diverging entries draws only entry zero while its price
  covers all of them. Nothing is corrupted, but the drawing and the price disagree silently.
- The gondola shipped here is a correct but partial answer to point 5 of the client's list
  (`analysis/client-requirements.md`): end caps, double backs and covers are deliberately deferred.
  Because the client's standard gondola has an end cap, the quote for the standard case is
  systematically low, and the only workaround in this iteration is entering the missing parts by
  hand under „Inne elementy ciągu". Say this to the client before the demo rather than letting the
  demo raise it.
- `numberOfLayouts` still has no React Hook Form validation, only an HTML `min` attribute, so a run
  can be driven to zero and silently priced at nothing. The gondola header inherits this verbatim
  from the shared header; it is pre-existing and out of scope here.

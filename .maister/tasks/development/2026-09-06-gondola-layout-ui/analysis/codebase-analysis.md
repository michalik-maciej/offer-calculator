# Codebase Analysis Report

**Date**: 2026-09-06
**Task**: Add gondola layout support to the offer configurator UI
**Description**: The domain already calculates gondola demand (`calculateGondolaLayoutDemand`, with tests), the Valibot contract exists (`packages/schemas/src/LayoutGondola.schema.ts`) and `buildLayoutDescription` already produces Polish descriptions for gondolas, but nothing under `packages/apps/web` references gondolas at all: a user cannot add one. Needed: choosing the run type when adding a run, the gondola dimension form, plan rendering and pricing for it. All user-facing text in Polish.
**Analyzer**: codebase-analyzer skill (3 Explore agents: File Discovery, Code Analysis, Pattern Mining)

---

## TL;DR

This is a web-only change: schemas, domain, API and Prisma need zero edits, and a gondola appended into the form's field array would already be priced correctly by the server on the first autosave. The single blocker is `packages/apps/web/src/offer/offer.types.ts`, which narrows the layout union to `LayoutWall[]` and is threaded through 6 other files; widening it forces narrowing at every whole-layout `useWatch`. The real work is the extra nesting level (`layouts.i.gondolaUnits.g.shelfUnits.u`), a third drawer-selection index, and a genuinely new double-sided plan drawing. Verified counts: 0 occurrences of "gondola" anywhere under `packages/apps/web/src`, 7 files referencing `WallOfferInput`. Estimated blast radius: about 6 files edited, 3 files added, 1 extraction worth doing first.

## Key Decisions

- Discriminate structurally with `isLayoutWall` / `isLayoutGondola` from `@/schemas` rather than adding a `type` discriminant: adding one means changing both layout schemas, switching to `v.variant`, and migrating every persisted `input` JSON.
- Widen `WallOfferInput` to the full `OfferInput` (the narrowed type collapses to `OfferInput` and the file may disappear): this removes the unchecked cast at `OfferFormProvider.tsx:37` and makes `FieldPathByValue<..., number>` cover gondola paths for free, so `OptionStepper` and `CountStepper` need no change.
- Extract the plan header (`WallLayoutPlan.tsx:96-137`) into a shared component before writing the second plan: it is roughly 40 lines that would otherwise be copied verbatim. This is the one refactor of existing code all three agents converged on.
- Reuse `useInventoryDimensions` unchanged: gondola depth is constrained by `foot` and height by `leg` exactly as a wall is, because `calculateGondolaLayoutDemand` delegates to `calculateWallLayoutDemand`. Adding `GONDOLA_LAYOUT_CONSTRAINTS` would require a new `@/domain` import in the browser, which the standards forbid.
- Dispatch by hand (a fourth `switch (true)` style branch, matching the three that already exist in the domain) rather than building a layout-kind registry: a registry is a speculative abstraction under the minimal-implementation standard.

## Open Questions / Risks

- **No Polish noun exists for a `gondolaUnit`.** The domain names the run type ("ciąg regałów dwustronnych") but never names a unit inside it. This is the only piece of gondola copy with no in-repo precedent and needs a decision from the maintainer.
- **The gondola description is incomplete by construction.** `buildLayoutDescription` reads only `gondolaUnits[0]`, so units 2..n never appear in the description shown on the plan header and in the offer list. The configurator must not present that string as a full summary. This is existing domain behaviour, not something the UI change introduces, so fixing it is a separate step.
- **Type switching of an existing run is the one thing that could push this from moderate to complex.** It activates the union-ordering trap (see Concerns), forces a data-loss decision and confirmation copy. Recommend leaving it out of scope.
- **No UI test harness exists.** Zero tests under `packages/apps/web`, Vitest runs in a Node environment with no JSDOM, and coverage is collected from `packages/domain` only. Nothing new here is testable by the existing suite, so verification is manual plus `pnpm validate`.
- **Gondola plan geometry is undesigned.** Two rows back to back, or one row at double depth, is a visual design decision, not a variant of existing markup. Worth a mockup before implementation.
- **`numberOfLayouts` has no RHF validation today**, only an HTML `min` attribute and no error slot, so a user can drive a run to zero and silently zero its price. The gondola side should add a real inline Polish rule and consider `numberOfGondolaUnits` too.

---

## Summary

Gondola support is already complete below the API boundary and completely absent above it. `OfferInputSchema.layouts` accepts `v.array(v.union([LayoutGondolaValue, LayoutWallValue]))`, the domain dispatches on structural type guards in three places, `updateOffer.controller.ts` prices whatever validates, and `OfferOutput["layouts"][number]` carries no layout-type field at all, so description, pricing and breakdown rendering are already variant-agnostic. The web app, by contrast, is wall-only by construction through a single 8-line type file.

The work divides into one contract decision (how the UI tells the two variants apart, where the recommendation is structural narrowing with the existing guards), one type widening that ripples through 7 files, three new files following existing templates, and one genuinely new piece of visual design for the double-sided plan.

---

## Files Identified

Paths are relative to the repository root. Line counts were verified during this analysis.

### Primary Files (must change)

**`packages/apps/web/src/offer/offer.types.ts`** (8 lines)
- Defines `WallOfferInput = Omit<OfferInput, "layouts"> & { layouts: LayoutWall[] }` at line 6, with a comment stating the narrowing is deliberate and temporary.
- The root cause of the wall-only assumption. All three agents identified this independently as the decision that governs the whole implementation. Verified: 6 other files import it.

**`packages/apps/web/src/offer/components/OfferLayouts.tsx`** (54 lines)
- Owns the `layouts` `useFieldArray`, calls `createDefaultWallLayout(dimensions)` at line 20, always renders `WallLayoutPlan` at lines 25-33, `append` at 39, "Dodaj ciąg" button at 44, empty-state copy at 48, `useFormContext<WallOfferInput>()` at 13.
- This is where the run-type choice goes. Caveat raised by File Discovery: `useFieldArray` `fields` are RHF snapshots that merge an `id` and can be stale, so discrimination must read from `useWatch` / `getValues`, not from `field`.

**`packages/apps/web/src/offer/components/plan/WallLayoutPlan.tsx`** (215 lines)
- The per-layout template and the single best file to clone. Named for wall, typed to wall at line 57, reads wall-only fields at lines 71, 82, 142 (`layout.shelfUnits`), 158 and 164 (`layout.depth`), 164 (`layout.height`). `ShelvesSummary` is typed `LayoutWall["shelfUnits"][number]["shelves"]` at line 26, though that shape is byte-identical in the gondola schema.
- Contains the header block (lines 96-137) recommended for extraction, `SCALE_PX_PER_CM = 1.6`, the `structuredClone(getValues(path))` duplication idiom, `handleRemoveUnit` index fix-up at lines 78-91, the right-side `Drawer` with `key={selectedUnit.id}`, and the `if (!layout) return null` guards required by `noUncheckedIndexedAccess`.

**`packages/apps/web/src/offer/components/editor/ShelfUnitEditor.tsx`** (363 lines)
- The drawer editor template and the largest single piece of work. Wall-bound in six verified places: `NumericPath = FieldPathByValue<WallOfferInput, number>` at line 17, and `useFormContext<WallOfferInput>()` at lines 76, 139, 206 and 297. Field paths: `layouts.${layoutIndex}.height` at 207, `.shelfUnits.${unitIndex}.shelves` at 210 and 216, `layouts.${layoutIndex}.depth` at 314 labelled "Głębokość bazy", `.height` at 319, `.shelfUnits.${unitIndex}.{width,numberOfShelfUnits}` at 334 and 339.
- Holds six file-local, unexported sub-components worth extracting rather than duplicating: `OptionStepper`, `CountStepper`, `SectionNavigator`, `SectionLabel`, `ValueDisplay`, `ShelvesFields`.

**`packages/apps/web/src/offer/components/OfferFormProvider.tsx`** (95 lines)
- `useForm<WallOfferInput>` at line 18, `reset(offer.input as WallOfferInput)` at 37, autosave `mutationFn: (values: WallOfferInput)` at 43, the 800 ms debounced autosave at 59-74, and the missing-component banner at 76-82.
- Line 37 is a live bug independent of this task: a saved offer containing a gondola is force-cast to the wall type on hydration. Widening the form type removes the cast.

**`packages/apps/web/src/offer/components/editor/ExtrasFields.tsx`** (94 lines)
- Reusable as-is. `useFormContext<WallOfferInput>()` at line 22 is the only thing needing widening; the field path `layouts.${layoutIndex}.extras` is valid for both variants.

**`packages/apps/web/src/routes/offer/route.tsx`** (215 lines)
- `useFormContext<WallOfferInput>()` at line 28, `useFieldArray` at 30, iterates layouts at 149-168 reading only `description` and `basePrice`, so it is behaviourally variant-agnostic. Copy at line 144 still reads correctly for mixed runs. Only the generic argument changes.

### New Files (to create)

- `packages/apps/web/src/offer/components/plan/GondolaLayoutPlan.tsx`
- `packages/apps/web/src/offer/components/editor/GondolaUnitEditor.tsx` (plus a shared module for the extracted steppers)
- `packages/apps/web/src/offer/helpers/createDefaultGondolaLayout.ts`
- A run-type picker, either inline in `OfferLayouts.tsx` or as its own component

### Related Files (read, probably do not change)

**`packages/schemas/src/LayoutGondola.schema.ts`** (37 lines)
- Shape verified: `{ height, numberOfLayouts (min 0), gondolaUnits: [{ depth, numberOfGondolaUnits (min 0), shelfUnits: [{ numberOfShelfUnits (min 0), shelves: [{ depth, numberOfShelves (min 0) }], width }] }], extras?: [{ id, quantity }] }`. Exports `LayoutGondola` and `isLayoutGondola` (a `v.safeParse(...).success` call).

**`packages/schemas/src/Offer.schema.ts`** (84 lines)
- The union is at line 9, gondola listed first. `OfferOutputSchema.layouts` entries are `{ breakdown, description, basePrice }`, identical for both variants, which is why pricing and description rendering need no change.

**`packages/schemas/src/LayoutWall.schema.ts`** (32 lines) - the sibling contract, exports `isLayoutWall`.

**`packages/apps/web/src/offer/helpers/createDefaultWallLayout.ts`** (48 lines)
- The factory precedent, and the only helper in the feature carrying a full JSDoc block. Its null-means-cannot-furnish contract drives the disabled add button. Caveat: it imports `@/domain/models/shelfDefaults`, one of the eleven recorded `@/domain`-in-browser deviations, so a gondola version needing `DEFAULT_SHELF_COUNT_BY_HEIGHT` either repeats the deviation or triggers the recorded fix of moving that constant into `packages/schemas`.

**`packages/apps/web/src/offer/hooks/useInventoryDimensions.ts`** (41 lines) - returns `layoutHeights`, `layoutDepths`, `shelfUnitWidths`, `shelfDepths` via `WALL_LAYOUT_CONSTRAINTS` at lines 6, 36-37. Wall-flavoured naming, directly reusable, no functional change.

**`packages/apps/web/src/offer/offer.api.ts`** (75 lines) - `create` / `update` / `preview` are typed `apiType<OfferInput>()`, the full union, so the wire is already gondola-ready. Note `offerQueries.preview` (lines 69-74) and `offerApi.preview` (lines 48-53) are defined but never called: dead code.

**`packages/domain/src/orchestrations/calculateGondolaLayoutDemand/calculateGondolaLayoutDemand.ts`** (22 lines) plus its test (about 70 lines, the only realistic gondola fixture in the repo); `calculateWallLayoutDemand.ts` (56 lines); `buildLayoutDescription.ts` (55 lines); `mapLayoutsToOfferOutput.ts` (31 lines); `calculateOfferDemand.ts` (42 lines); `createOfferPreview.ts` (24 lines); `packages/domain/src/models/layoutConstraints.ts` (16 lines).

**`packages/apps/api/src/controllers/offer/updateOffer.controller.ts`** (49 lines) - confirms a gondola in the payload already validates and prices. No API change needed.

**`packages/apps/web/src/inventory/components/InventoryItem.tsx`** lines 132-168 - the existing `Controller` plus `RadioGroup` plus `Badge` pattern with Polish labels, the best in-repo template for a run-type picker. `packages/apps/web/src/core/ui/radio-group.tsx` (42 lines) is already wired to Radix and currently used only here.

**No change required**: `routes/order.tsx` (29 lines), `BreakdownList.tsx` (52 lines), `routes/config.tsx` (41 lines, unless the picker is hoisted to page level), `createMethod.api.ts`, the query keys, `useOffer`, `useAutoSaveState`, `useCreateOffer`, `describeMissingComponent`, `PreviewErrorBanner`.

---

## Current Functionality

### End-to-end flow of a wall run

1. User clicks "Dodaj ciąg" (`OfferLayouts.tsx:39`).
2. `useInventoryDimensions()` runs `useQuery(inventoryQueries.list())` against `GET /inventory/items`, then calls `getDimensionOptions()` three times, picking arrays via `WALL_LAYOUT_CONSTRAINTS` / `SHELF_UNIT_CONSTRAINTS` / `SHELF_CONSTRAINTS`, producing `{ layoutHeights, layoutDepths, shelfUnitWidths, shelfDepths }`.
3. `createDefaultWallLayout(dimensions)` picks the smallest height, depth and width, takes the shelf count from `DEFAULT_SHELF_COUNT_BY_HEIGHT` (fallback 1), prefers a shelf depth matching the layout depth if the inventory has one, and returns `LayoutWall | null`. Null keeps the add button disabled.
4. `append(defaultLayout)` into `useFieldArray({ control, name: "layouts" })`.
5. `OfferLayouts` maps fields to `WallLayoutPlan` with `layoutIndex` and `preview = output.layouts[index]`, a positional coupling.
6. `WallLayoutPlan` uses `useWatch('layouts.${i}')` for live geometry, `useFieldArray('layouts.${i}.shelfUnits')` for the unit boxes, `register('layouts.${i}.numberOfLayouts', { valueAsNumber })`, and draws `numberOfShelfUnits` copies of each unit at `depth * 1.6` by `width * 1.6` px. Clicking a box opens a right-side `Drawer` holding `ShelfUnitEditor`.
7. `ShelfUnitEditor`'s `OptionStepper` drives `Controller`s on `layouts.i.depth`, `.height`, `.shelfUnits.u.width` and `.shelves.s.depth`; `CountStepper` drives `.numberOfShelfUnits` and `.numberOfShelves`; `ShelvesFields` owns `useFieldArray(...shelfUnits.u.shelves)`; `ExtrasFields` owns `useFieldArray('layouts.${i}.extras')`.

### Form ownership

A single `useForm<WallOfferInput>` is created once in `OfferFormProvider`, mounted in `routes/__root.tsx` above `AppLayout`, so the form outlives route changes and `/config`, `/offer` and `/order` share it. Deep components reach it with `useFormContext`. There is never a second `useForm` for offer data.

### Pricing round trip

`OfferFormProvider.tsx:59-74` watches the whole control plus `isDirty`, debounces 800 ms, then calls `saveNow(getValues())`, a `PUT ${VITE_API_URL}/offers/:id`. The controller runs `v.safeParse(OfferInputSchema, body)` (the union, stripping unknown keys), calls `getAllComponents()` then `priceOffer(input, inventory)`, which calls `createOfferPreview()`, which runs `calculateOfferDemand()` (a `switch (true)` over `isLayoutWall` then `isLayoutGondola`, both delegating to `calculateWallLayoutDemand` for back, baseShelf, shelf, leg and foot plus extras), `breakdownDemandByCategory()`, `mapLayoutsToOfferOutput()` producing per-layout `{ basePrice, description, breakdown }`, and `calculateBomPrice()` producing `{ basePrice, discountPrice }`. Input and output JSON are persisted (output becomes `Prisma.DbNull` when pricing failed), the response is `{ ...savedOffer, missingComponent? }`. On success the autosave seeds the cache via `queryClient.setQueryData(offerQueries.details(id).queryKey, saved)` and calls `reset(getValues(), { keepValues: true })` to clear `isDirty`.

### Two counter-intuitive facts

- **The offer output is never computed client-side.** `POST /offers/preview` is wired in the API and `offerApi.preview` / `offerQueries.preview` exist, but no component ever calls them. Every price on screen comes from `offer.output` on the saved offer, recomputed server-side by the autosave PUT. Visible price latency is therefore the 800 ms debounce plus the round trip.
- **A missing component blanks the whole offer, not one run.** `MissingComponentError` propagates out of `createOfferPreview`, `priceOffer` catches it and nulls the entire output. `missingComponent` is returned in the response body but never persisted, so after a page reload the prices are still gone but the explanation is not.

### Key Components

- **`OfferFormProvider`**: single form owner, hydration, debounced autosave, missing-component banner.
- **`OfferLayouts`**: layout list and the add-run entry point.
- **`WallLayoutPlan`**: per-layout header, scale drawing at 1.6 px/cm, duplicate/remove, drawer host.
- **`ShelfUnitEditor`**: drawer contents, six reusable file-local sub-components.
- **`createDefaultWallLayout`**: factory with the null-means-cannot-furnish contract.
- **`useInventoryDimensions`**: the only source of allowed dimension values.
- **`isLayoutWall` / `isLayoutGondola`**: structural guards exported from `@/schemas`, browser-safe, the natural narrowing tool.

---

## Dependencies

### What the offer feature depends on

- `@/schemas` (`OfferInput`, `LayoutWall`, `LayoutGondola`, the two guards): a legal web import.
- `@/domain/models/shelfDefaults` via `createDefaultWallLayout`, and `layoutConstraints` via the inventory helper: recorded deviations, eleven `@/domain` imports exist in web despite the rule against them. Add no new ones.
- `react-hook-form` (`useForm`, `useFormContext`, `useFieldArray`, `useWatch`, `Controller`, `FieldPathByValue`).
- TanStack Query for the inventory list and the offer details, TanStack Router for the three routes.
- `core/ui` primitives (1080 lines total: drawer 115, dialog 164, select 157, accordion 87, button 58, badge 36, label 24, input 22, confirm-dialog 41, radio-group 42). `accordion` is currently unused anywhere and is a natural fit for nesting gondola units; `radio-group` is used only by `InventoryItem`.

### Consumers of the type that must change

`WallOfferInput` is imported by 6 files beyond its own definition (verified): `OfferLayouts.tsx`, `OfferFormProvider.tsx`, `WallLayoutPlan.tsx`, `ShelfUnitEditor.tsx` (4 call sites), `ExtrasFields.tsx`, `routes/offer/route.tsx`.

**Consumer Count**: 7 files touch the type; 3 further files (`createDefaultWallLayout`, `useInventoryDimensions`, `routes/config.tsx`) sit in the same flow without depending on the type.
**Impact Scope**: Medium. Wide but shallow: most call sites change only a generic argument. The deep effect is that `useWatch({ name: 'layouts.${i}' })` starts returning a union and every whole-layout consumer must narrow.

---

## Test Coverage

### Test files relevant to this task

- `packages/domain/src/orchestrations/calculateGondolaLayoutDemand/calculateGondolaLayoutDemand.test.ts` (about 70 lines): the only realistic gondola fixture in the repo, useful as the shape reference for `createDefaultGondolaLayout`.
- `packages/domain/src/transformations/buildLayoutDescription/buildLayoutDescription.test.ts`: verified during this analysis. The wall case asserts `"3 x ciąg regałów przyściennych / 4x80 / 1x100 / baza 47 / h-130 / półki 5x37"`; the gondola case uses a two-unit fixture whose second unit is at depth 37 and yields a description mentioning only `baza 47`, confirming that units 2..n are invisible.

### Coverage Assessment

- **Domain**: good. Gondola demand and gondola description are both tested and passing.
- **Web**: zero. There are no tests under `packages/apps/web`, `vitest.config.ts` collects coverage from `packages/domain` only, and the environment is Node with no JSDOM.
- **Gaps**: everything this task adds is untestable by the existing suite. Since no domain logic changes, the standard "no domain change is finished without a test change" does not bite, but it also means the only gate is `pnpm validate`, `pnpm vitest run` for regressions, and manual exercise in a running app. Say so explicitly when reporting.

---

## Coding Patterns

### Structure and naming

Feature folders under `src/{feature}/` holding `components`, `hooks`, `helpers`, a flat `{feature}.api.ts` and optionally `{feature}.types.ts`. No global `components/`, `utils/` or `services/` folders, and no `config/` or `order/` feature folder. One thing per file, named exports only, no `export default`. `PascalCase.tsx` named after the single export; `core/ui` keeps upstream kebab-case. Hooks one per file named `use{Thing}`; helpers one function per file named after the function. Exported functions declared as `export function name(...)`, arrow consts only for trivial one-liners and data constants. `type` over `interface`.

### Props

Inline, destructured, alphabetical, no `React.FC`, no separate Props type unless imported elsewhere. `ShelfUnitEditor` is the reference example with eight alphabetical props, and `onRemoveUnit` is spread conditionally at the call site (`WallLayoutPlan.tsx:199-201`).

### Form conventions

Never a second `useForm`; deep components use `useFormContext`. Native inputs use `register`, Radix-backed and stepper-like controls use `Controller`, repeated sections use `useFieldArray`, scoped reads use `useWatch`. Validation rules are inline with Polish messages and there is no Valibot resolver in the form layer. Existing wording: "Opis jest wymagany", "Opis nie może być pusty", "Musi być liczbą", "Minimum 0", "Maksimum 100", "Pole wymagane", "Nieprawidłowa wartość". Errors render field-level in the reserved-height pattern (`min-h-5` plus an `invisible` class when absent). Numeric inputs use `valueAsNumber` or an explicit `setValueAs`.

### Data layer

No hand-written `fetch`. Every endpoint is declared in `{feature}.api.ts` via `createApiMethod` from `core/createMethod.api.ts` with method, path (`:id` params inferred by `ParamsFromUrl`), a Valibot response schema and `data: apiType<T>()`. The module reads `import.meta.env.VITE_API_URL` at load and throws if missing. Errors arrive as a typed `ApiError` and callers branch on `error instanceof ApiError && error.status === n` (`routes/index.tsx:14`). Note `createApiMethod` declares `response` but never parses with it, returning `res.json()` unvalidated, so the schema is compile-time typing only. Query keys are hierarchical `as const` tuples prefixed with the feature; option factories live in `{feature}Queries`, mutation keys in `{feature}MutationKeys`, and `offerMutationKeys.autoSave = ["offer","autoSave"]` is read back by `useAutoSaveState` through `useMutationState`. Mutations report in two languages: English `console.error("<what> failed:", error)` and Polish `toast.error(..., { position: "top-center" })`.

### Language

Every user-facing string is Polish including aria-labels; identifiers, types, filenames, comments and `console.error` stay English. Numbers and dates go through module-level `Intl` formatters with `pl-PL`, never constructed inside a render; `offer/helpers/formatPrice.ts` is the only price formatter and no second one should be created. Raw dimensions render bare with `tabular-nums`. No bare numeric literal at point of use: `UPPER_SNAKE_CASE` at module top with the unit in the name, as `SCALE_PX_PER_CM` does.

### Other

Import order in three blank-line-separated blocks enforced by `simple-import-sort`; cross-package imports via `@/schemas`, same-package imports relative and never repo-absolute. `noUncheckedIndexedAccess` guards use `??` fallback or `if (!x) return`, never `!` and never a cast. Native array methods in web code, no lodash in the browser bundle. No inline comments except a two-line maximum why-comment; JSDoc on exported helpers as in `createDefaultWallLayout`. Prettier at 80 columns, 2 spaces, no semicolons, trailing commas.

---

## Complexity Assessment

| Factor | Value | Level |
|--------|-------|-------|
| Files edited | 6 existing plus 3 new plus 1 extraction | Medium |
| Largest file touched | `ShelfUnitEditor.tsx`, 363 lines | Medium |
| Type consumers | 7 files reference `WallOfferInput` | Medium |
| Contract / API / domain change | none required | Low |
| Test coverage of the changed surface | 0 tests under `packages/apps/web` | High risk |
| New visual design | gondola plan geometry, undesigned | Medium |

### Overall: Moderate

Not simple, for four reasons. The form generic widens from a concrete object to a union, touching seven files and forcing narrowing at every whole-layout `useWatch`. Gondola adds a nesting level, which means a new index threaded through the editor, a third piece of drawer selection state, and another copy of the index fix-up logic one level down. There is no discriminant, so narrowing rests on structural guards with the union-ordering trap underneath. And the double-sided plan is new visual design in a repo with no component tests.

Not complex, because the hard half is already built and tested: no schema change, no migration, no API endpoint, no domain function, no Prisma work. `calculateGondolaLayoutDemand` has a passing test, `buildLayoutDescription` already emits the Polish gondola phrase with a test, `OfferInputSchema` already accepts the union, `priceOffer` already handles the failure path, the pricing round trip is generic over `OfferInput`, `useInventoryDimensions` needs no new data, and `ExtrasFields` works unchanged. A gondola appended into the field array would be priced correctly by the server on the very first autosave, before any plan component exists.

---

## Key Findings

### Strengths

- The domain, schemas and API are already fully polymorphic. Three of three agents confirmed independently that they need zero changes.
- The wall path is a complete, coherent template covering every layer the gondola path needs: page, form owner, list, plan, editor, factory, dimensions hook.
- `OfferOutput` carries no layout-type field, so everything downstream of pricing (description, per-run price, breakdown, order view) is already variant-agnostic.
- The Polish vocabulary largely exists: the domain emits "ciąg regałów dwustronnych" against "ciąg regałów przyściennych", and "ciąg" is already used generically for a run rather than specifically for a wall run.

### Concerns

- **The union-ordering trap.** `OfferInputSchema` lists gondola first in the union and Valibot returns the first fully valid option while stripping unknown keys, whereas `calculateOfferDemand` and `mapLayoutsToOfferOutput` switch on `isLayoutWall` first. A hybrid object carrying both `gondolaUnits` and `depth` / `shelfUnits` would be persisted as a gondola with its wall keys stripped, yet classified as a wall by any client guard checking wall first. Two agents flagged this independently. It stays dormant unless a user can change an existing run's type; if that is ever offered, the layout object must be replaced wholesale, never merged, and RHF must not retain stale keys across the switch.
- **Silent field loss if a discriminant is added carelessly.** Valibot `v.object` strips unknown keys, so a UI-added `type: "gondola"` marker that is not in `LayoutGondolaValue` is dropped by `updateOfferController` before persisting and vanishes on reload.
- **`reset(offer.input as WallOfferInput)`** at `OfferFormProvider.tsx:37` is a live bug today: a saved gondola offer is force-cast to the wall type on hydration.
- **`ShelfUnitEditor` conflates layout-level and unit-level fields** under a section labelled "Ciąg" inside a unit editor. For a gondola this must be split rather than copied, because height stays at layout level while depth moves down to the gondola unit.
- **Index-based prop drilling** instead of a field-path prefix; with gondola's extra nesting this needs a third index.
- **One DOM button per physical unit**: `Array.from({ length: Math.max(unit.numberOfShelfUnits, 0) })` multiplies with gondola nesting, and every rendered copy calls the same `selectUnit`, so copies are visually distinct but functionally identical.
- Smaller items noticed, each its own step and not to be fixed in this one: `key={extraValues.length}` as a remount hack in `ExtrasFields`; two different exports named `CATEGORY_LABELS` (in `offer/helpers/categoryLabels.ts` and `inventory/components/labels.inventory.ts`, a deliberate split but an import-site collision risk); `routes/order.tsx` importing by repo-absolute path against the coding-style rule; `createOffer.controller.ts` spelling the validation check `if (parsed.issues)` against the standard's `!parsed.success`; `createDefaultWallLayout` called unconditionally on every render of `OfferLayouts` outside a memo; `offerQueries.preview` being dead code; `BreakdownList.tsx:26` saying "Ten ciąg nie zawiera jeszcze żadnych elementów." in a whole-offer context, already slightly wrong and worse with mixed run types.

### Opportunities

- Extracting the six file-local sub-components from `ShelfUnitEditor` and the header from `WallLayoutPlan` pays for itself immediately and prevents 400 lines of duplication.
- Widening the form type deletes an unchecked cast and makes `FieldPathByValue` widen automatically, so the steppers need no edits at all.
- `core/ui/accordion.tsx` is unused today and fits the gondola-unit nesting; `core/ui/radio-group.tsx` fits the run-type picker.
- Documentation drift worth fixing under the conventions standard: `CLAUDE.md` describes `packages/apps/web/src/layout/` as the "Layout builder (wall/gondola)" when it in fact holds app chrome (`AppLayout`, `TopBar`). Two agents caught this independently.

---

## Impact Assessment

- **Primary changes**: `offer.types.ts`, `OfferLayouts.tsx`, `WallLayoutPlan.tsx` (extraction plus generic), `ShelfUnitEditor.tsx` (extraction plus generic), `OfferFormProvider.tsx`, `ExtrasFields.tsx`, `routes/offer/route.tsx`.
- **Related changes**: `routes/config.tsx` only if the picker is hoisted to page level. `createDefaultWallLayout.ts` unchanged, but its contract must be mirrored exactly.
- **Test updates**: none possible in the existing suite. `pnpm vitest run` should stay green because no domain code changes; that is a regression check, not coverage of the new work.

### Risk Level: Medium

Wide reach across the offer feature with no automated safety net on the frontend, mitigated by the fact that the calculation, persistence and pricing path underneath is unchanged and already tested. The specific risks that could bite are the union-ordering trap (dormant unless type switching is offered), the hydration cast, and regressions in the wall path introduced by the shared extraction.

---

## Recommendations

This is **creating a new capability in the UI on top of existing, tested backend behaviour**. Recommended order, each item a separate verifiable step per the working-process standard:

1. **Decide the discrimination strategy first.** Recommendation: structural narrowing with `isLayoutWall` / `isLayoutGondola` from `@/schemas`. Do not add a `type` discriminant unless the maintainer accepts a schema change plus migration of every persisted `input` JSON.
2. **Widen the form type.** `Omit<OfferInput,"layouts"> & { layouts: (LayoutWall | LayoutGondola)[] }` is just `OfferInput`, so `offer.types.ts` may collapse or disappear. Update the 6 consuming files, remove the cast at `OfferFormProvider.tsx:37`, and add narrowing at every whole-layout `useWatch`. Verify with `pnpm validate` before writing any new component.
3. **Extract the shared pieces**, before the second plan exists: the header block from `WallLayoutPlan.tsx:96-137` into a shared `LayoutPlanHeader`, and `OptionStepper`, `CountStepper`, `SectionNavigator`, `SectionLabel`, `ValueDisplay`, `ShelvesFields` out of `ShelfUnitEditor` into a shared controls module. Confirm the wall path is unchanged.
4. **Add `createDefaultGondolaLayout`.** Same folder, same signature over `InventoryDimensions`, same `LayoutGondola | null` contract, same picking rule (smallest height, depth and width; shelf depth preferring the layout depth if the inventory has one; shelf count from `DEFAULT_SHELF_COUNT_BY_HEIGHT` with fallback 1), one `gondolaUnits` entry with `numberOfGondolaUnits: 2` for a genuine double-sided run. It must emit exactly the gondola shape and never leak wall keys. `shelves` is a required array in both schemas even though the domain's `ShelfUnit` model makes it optional, so always emit at least `[]`.
5. **Add the run-type choice** in `OfferLayouts`. Two buttons ("Dodaj ciąg przyścienny" / "Dodaj ciąg dwustronny") is the smaller change; a `Select` reusing `core/ui/select.tsx` as `ExtrasFields` does, or a `RadioGroup` following `InventoryItem.tsx:132-168`, are the alternatives. Each option must disable independently when its builder returns null, and the existing single hint ("Uzupełnij magazyn komponentów, żeby móc dodać ciąg.") needs to say which type is unavailable. At this point a gondola is already priced correctly by the server before any plan component exists, which is a good checkpoint to verify in a running app.
6. **Dispatch the plan**: `isLayoutGondola(getValues('layouts.${index}')) ? <GondolaLayoutPlan/> : <WallLayoutPlan/>`, both taking the identical prop set, reading the value from `getValues` / `useWatch` and never from the `useFieldArray` `field` snapshot.
7. **Build `GondolaLayoutPlan`** on the extracted header. The geometry is the new part: the outer loop is over `gondolaUnits`, each with its own depth, the inner over `shelfUnits`, and the unit caption reads depth from the gondola unit rather than the layout. Decide two rows back to back against one row at double depth before implementing. Keep `SCALE_PX_PER_CM` as the shared named constant.
8. **Build `GondolaUnitEditor`.** Paths become `layouts.${i}.gondolaUnits.${g}.depth` and `layouts.${i}.gondolaUnits.${g}.shelfUnits.${u}...`, while `ShelvesFields` watching `layouts.${i}.height` does not move. Pass a typed path prefix rather than raw indices if that stays readable; otherwise two editors sharing the extracted steppers is more in keeping with "a component renders one thing". Add a third `SectionNavigator` for the gondola-unit level and a `selectedGondolaUnitIndex`, repeating the `handleRemoveUnit` / `handleDuplicateUnit` index fix-up one level down. The form must collect one height per run, one `numberOfLayouts`, a repeatable list of gondola units each with its own depth and `numberOfGondolaUnits`, the existing shelf-unit editor unchanged inside each unit, and one extras list at run level. It must **not** collect a layout-level depth and must **not** put extras on a gondola unit.
9. **Copy.** Reuse the domain's own phrases: "ciąg regałów dwustronnych" against "ciąg regałów przyściennych". Existing configurator strings to stay consistent with: "Dodaj ciąg", "Liczba ciągów", "Powiel ciąg", "Usuń ciąg", "Ciąg {n}", "Inne elementy ciągu", "Regały", "Półki", "Głębokość bazy", "Wysokość", "Szerokość", "Liczba regałów", "Liczba półek", "Dodaj regały", "Dodaj półki", "Ten regał nie ma półek.", "bez półek", "liczenie…", "brak wyceny", "Wybierz element", "Usuń element", "Ta oferta nie ma jeszcze żadnych ciągów. Dodaj je w Konfiguratorze.". The one word that must be coined is the Polish noun for a gondola unit. Category label maps need no gondola entry.
10. **Leave out of scope**: converting an existing run between wall and gondola; fixing `buildLayoutDescription` to cover units 2..n; the smaller pre-existing defects listed under Concerns. Report them, do not fold them in.

### Where the agents disagreed or one saw something the others missed

- **`WallOfferInput` consumer count**: File Discovery said "seven consumers import it". Verified: 7 files reference the name, of which 6 import it and 1 is the definition. Use 6 as the number of files to edit for the generic.
- **Pattern Mining's quoted gondola description** `"1 x ciąg regałów dwustronnych / 2x80 / 1x100 / baza 47 / h-130"` reads as though the gondola branch emits no `półki` segment. Verified against the source: it does emit `półki ${numberOfShelves}x${depth}` from the first gondola unit when one exists. The quoted string lacks it only because that test fixture's `shelves` arrays are empty. The genuine limitation is the `gondolaUnits[0]`-only reading, which all three descriptions of it agree on.
- **Where gondola constraints should come from**: Code Analysis raised adding `GONDOLA_LAYOUT_CONSTRAINTS` and `GONDOLA_UNIT_CONSTRAINTS` to the domain to mirror the nesting honestly, then rejected it because it needs a new `@/domain` import in web. Pattern Mining reached the same conclusion from the other direction (the constraints are identical because gondola demand delegates to wall demand). Agreed outcome: reuse the existing arrays.
- **Editor decomposition**: Code Analysis leaned toward one editor parameterised on a typed path prefix; Pattern Mining leaned toward two editors sharing extracted sub-components, on the "one component renders one thing" standard. Unresolved and worth deciding during planning; both agree the six sub-components must be extracted either way.
- **Only File Discovery** noted the silent-field-loss consequence of Valibot stripping unknown keys if a `type` marker is added without a schema change.
- **Only Code Analysis** traced the missing-component behaviour (whole offer blanked, `missingComponent` not persisted so the explanation disappears on reload) and the fact that `offerQueries.preview` is dead code.
- **Only Pattern Mining** produced the field-by-field wall/gondola diff and caught that `shelves` is required in both schemas while the domain's `ShelfUnit` model makes it optional, so the form must always emit at least an empty array.
- **`packages/apps/web/src/layout/`**: File Discovery and Code Analysis independently found that it holds app chrome (`AppLayout`, `TopBar`), not a layout builder, contradicting `CLAUDE.md` and the standards index.

---

## Next Steps

Hand this report to `maister:gap-analyzer` for the current-vs-desired comparison. Two decisions should be settled before specification: the discrimination strategy (recommendation: structural guards, no schema change) and whether run-type conversion is in scope (recommendation: no). The gondola plan geometry is the one piece that would benefit from `maister:mockup-studio` before implementation. Per `CLAUDE.md`, all changes stay unstaged in the working tree and a `PreToolUse` hook blocks agent commits and pushes.

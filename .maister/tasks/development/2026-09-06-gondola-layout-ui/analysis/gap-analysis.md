# Gap Analysis: Gondola layout support in the offer configurator UI

## TL;DR

Gondola is a fully built, fully tested capability with no way in: backend completeness is 100%,
user-facing completeness is near zero, and the whole capability is orphaned below the API boundary.
Decision 1 (shared uprights) turns this from a UI task into a UI plus domain task. Decision 2 as
corrected (both sides configured together, one `gondolaUnits` entry with `numberOfGondolaUnits: 2`)
makes the UI half markedly smaller than Phase 1 assumed: no side index, no third drawer coordinate,
and the difference between a wall run and a gondola run collapses to one path segment. Risk medium,
effort medium at the low end.

## Key Decisions

- `has_reproducible_defect: false`, despite a genuine behavioural divergence: the upright rule sits
  on a code path no user can reach, has no persisted data behind it and no prior specification, so
  decision 1 defines correct behaviour rather than restoring it.
- All five characteristics other than the defect flag are true: this is simultaneously a new
  capability, a modification of existing code, a data-lifecycle completion and a UI-heavy change.
- The upright change is classified as `modificative` even though the UI half is purely additive,
  because pricing output changes for a shape the system can already be asked to price.
- Compatibility requirement is `moderate`: no schema change, no migration, no persisted gondola to
  break, but any offer re-saved after the change re-prices under the new rule.
- Corrected decision 2 answers two questions this analysis first raised as blocking (how many
  `gondolaUnits` entries, and whether `buildLayoutDescription` reading only entry zero is wrong).
  Both are settled, and both are recorded below as closed rather than dropped, because the reasoning
  matters if a later iteration reopens asymmetric gondolas.

## Open Questions / Risks

- The upright formula is unambiguous for the in-scope shape, where every candidate rule agrees, but
  `calculateGondolaLayoutDemand` still has to answer for shapes the schema permits and this UI will
  not produce. Two existing domain tests contain exactly those shapes, and which one moves depends
  on the rule chosen.
- Fractional quantities must never leave `calculateGondolaLayoutDemand`: `calculateBomPrice` and
  `breakdownDemandByCategory` consume the demand list raw and neither rounds, so a half upright
  would surface as "0.5" in Rozpiska.
- Sharing uprights means the gondola orchestration can no longer delegate wholesale to
  `calculateWallLayoutDemand`, which is the wall path's only regression exposure in this task.
- A persisted gondola with several diverging `gondolaUnits` entries is schema-legal and cannot be
  expressed by this UI. None exists today, but the form has to behave sanely if one ever appears,
  and the failure mode is quiet: a drawing showing one configuration beside a price covering more.
- Zero tests exist under `packages/apps/web` and Vitest runs without JSDOM, so nothing added on the
  web side is covered by the suite. `pnpm vitest run` is a regression check on the domain, not
  evidence the feature works.
- Widening the form generic to the layout union makes every whole-layout `useWatch` return a union;
  react-hook-form path typing over a union array is the one thing that could turn a mechanical
  change into an awkward one. Verify with `pnpm typecheck` before writing any new component.

---

## Summary

- **Risk Level**: Medium
- **Estimated Effort**: Medium, at the low end after the correction to decision 2
- **Detected Characteristics**: modifies_existing_code, creates_new_entities,
  involves_data_operations, ui_heavy

## Task Characteristics

| Characteristic | Value | Evidence |
| --- | --- | --- |
| Has reproducible defect | **no** | See "Defect assessment" below. Reproducible in a test, unreachable by a user, and the target behaviour is being defined now rather than restored. |
| Modifies existing code | **yes** | 8 existing files change: 1 domain function, 2 or 3 domain tests, 5 web files, plus the type file that may be deleted. |
| Creates new entities | **yes** | Gondola is a new entity in the web app: 0 occurrences of "gondola" under `packages/apps/web/src`, verified. 2 to 4 new files depending on decision I2. |
| Involves data operations | **yes** | Full CREATE / READ / UPDATE / DELETE lifecycle for a gondola run inside the offer's `layouts` array, persisted as JSON. |
| UI heavy | **yes** | New plan drawing, a gondola-flavoured drawer editor, a changed add-run control, all copy in Polish. |

### Defect assessment (called explicitly, as requested)

The divergence is real and precisely locatable. `calculateGondolaLayoutDemand` builds a per-side
context with `numberOfLayouts: numberOfLayouts * numberOfGondolaUnits` and hands it to
`calculateWallLayoutDemand`, which computes uprights as `(numberOfUnits + 1) * numberOfLayouts`.
Both sides therefore pay for a full column. `calculateGondolaLayoutDemand.test.ts` asserts
`{ id: "leg-130-8-3", quantity: 8 }` for three shelf units across two sides, where the rule that
actually quoted for the client gives 4. It reproduces in one command.

It is still not a defect for the purposes of this workflow, for four reasons:

1. No user can trigger it. The only producer of a gondola input is a hand-written HTTP request.
2. No persisted data carries it. Zero saved offers contain a gondola, because the UI never made one.
3. Nothing in this repository ever specified the shared rule. It exists only in a different
   repository's source, recovered as prior art in Phase 1.
4. The repository's own test asserts the current behaviour deliberately, so this is a change of
   intent, not a violation of it.

Calling it a defect would frame the work as restoring known-good behaviour and invite a
"reproduce, fix, confirm the reproduction is gone" loop against a scenario no user has. Calling it a
specification change frames it correctly: decision 1 defines what a gondola costs, for the first
time, and the definition needs a test that says so. The reproduction data is captured below anyway,
because the numbers matter regardless of the label.

## Gaps Identified

### Missing (does not exist at all)

| Gap | Evidence |
| --- | --- |
| Any way to create a gondola run | `OfferLayouts.tsx:37-45` has exactly one "Dodaj ciąg" button, wired to `createDefaultWallLayout` at line 20 and `append` at line 39. |
| A gondola default factory | Only `offer/helpers/createDefaultWallLayout.ts` exists. |
| A gondola plan drawing | `OfferLayouts.tsx:25-33` renders `WallLayoutPlan` unconditionally. No dispatch, no second plan. |
| Editor access to `gondolaUnits` | `ShelfUnitEditor.tsx` addresses `layouts.${i}.depth`, `.height` and `.shelfUnits.${u}.*`. No path in the file reaches `gondolaUnits`. |
| A Polish name for a side in the UI | Settled by decision 4: "Strona". No occurrence in code yet. |
| Any frontend test harness | 0 test files under `packages/apps/web`, `vitest.config.ts` collects coverage from `packages/domain` only, Node environment with no JSDOM. |

### Incomplete (exists, does not cover the gondola case)

| Gap | Current | Needed |
| --- | --- | --- |
| `offer.types.ts` | `WallOfferInput = Omit<OfferInput,"layouts"> & { layouts: LayoutWall[] }`, 8 lines, imported by 6 files (verified). | The full union, which collapses to `OfferInput`, so the file may disappear. |
| `OfferFormProvider.tsx:37` | `reset(offer.input as WallOfferInput)` force-casts a saved gondola to the wall type on hydration. | No cast. A live defect today, fixed for free by the widening. |
| `calculateGondolaLayoutDemand` | Delegates per side with no sharing, so uprights are counted twice. | Decision 1: shared. Cannot be done by delegation alone, see below. |
| `numberOfLayouts` validation | HTML `min` only (`WallLayoutPlan.tsx:106-113`), no RHF rule, no error slot. A run can be driven to zero and silently priced at nothing. | Pre-existing, and the gondola header inherits it verbatim if the header is shared. `numberOfGondolaUnits` is pinned at 2 and never edited, so it adds no new hole. |

### Behavioural changes needed

- Upright quantity for a gondola run: from two full columns to one shared column. Wall runs are
  untouched, so no existing saved offer changes price.
- `calculateGondolaLayoutDemand` can no longer be a pure delegation. `calculateWallLayoutDemand`
  computes back panels, base shelves, shelves, legs and feet in one call, and legs now need a
  different scope from the other four. Either a leg-free per-side demand is extracted, or legs are
  filtered out of the per-side results by category lookup. The first is cleaner and touches the
  tested wall path; the second keeps the wall path untouched and costs an inventory lookup inside
  the orchestration.

### Closed by the corrected decision 2 (recorded, not dropped)

- **How many `gondolaUnits` entries a run has.** Answered: exactly one, with
  `numberOfGondolaUnits: 2`. The field is pinned, never rendered, and never edited. This removes
  what would otherwise have been the blocking question of this analysis.
- **`buildLayoutDescription` reading only `gondolaUnits[0]`.** With a single entry this is correct
  for everything the UI can produce, so the domain needs no change here. It stays wrong only for the
  out-of-scope diverging-entries shape, which is now an edge case rather than the normal one. Do not
  fold a fix into this task.
- **A per-side editor, a side navigator and a third drawer selection coordinate.** All unnecessary.
  Phase 1 sized the editor work assuming they were needed; they are not.

## Data Lifecycle Analysis

### Entity: gondola run (`LayoutGondola` inside `OfferInput.layouts`)

Three-layer verification, executed rather than assumed.

| Operation | Backend | UI component | User access | Status |
| --- | --- | --- | --- | --- |
| CREATE | `OfferInputSchema.layouts` is `v.array(v.union([LayoutGondolaValue, LayoutWallValue]))`; `updateOffer.controller.ts` validates and prices whatever passes | none: 0 occurrences of "gondola" under `packages/apps/web/src` | no control anywhere | FAIL |
| READ (plan drawing) | `mapLayoutsToOfferOutput` emits `{ basePrice, description, breakdown }` per layout, variant-agnostic | `WallLayoutPlan` only, typed `LayoutWall` at lines 5 and 26 | rendered unconditionally at `OfferLayouts.tsx:25`, so a gondola draws an empty strip | FAIL |
| READ (price and description) | present and variant-agnostic | `routes/offer/route.tsx:149-168`, `BreakdownList.tsx` | reachable, but unreachable in practice because nothing can create the data | PARTIAL |
| READ (hydration from DB) | `GET /offers/:id` returns `input` unchanged | `OfferFormProvider.tsx:37` casts it to the wall type | the value survives in RHF and renders as an empty run | FAIL |
| UPDATE | `PUT /offers/:id` re-prices on every autosave | `ShelfUnitEditor` cannot address `gondolaUnits.*` | the drawer opens only from a unit box, and no box renders | FAIL |
| DELETE (whole run) | array removal, no endpoint needed | `OfferLayouts.tsx:31` `remove(index)` is variant-agnostic | the header holding the delete button does render for a gondola | PASS |

**Completeness**: about 15%, counting the one operation that works by accident and the one that is
reachable but unreachable in practice.
**Orphaned operations**: the entire capability. CREATE, READ-as-drawing and UPDATE all exist at the
backend layer with no UI component and no user access. This is the textbook case of backend
capability not being user operability: schema, domain function, controller, pricing, Polish
description and passing domain tests all exist, and none of it is reachable.
**Missing touchpoints**: the run-type choice in the configurator (critical for this task, it is the
only entry point), the plan drawing, and depth plus shelf units reachable one level deeper in the
editor. Rozpiska and the offer list need nothing. Deleting a side is not a touchpoint under the
corrected decision 2, because sides are not individually addressable.

## User Journey Impact Assessment

### What a person does today, and where it stops

1. Open the app. `/` redirects to `/offer` when authenticated, `/login` otherwise.
2. On `/offer`, create an offer ("Nowa oferta") or load a saved one. The offer id lives in the URL
   search; the form is owned by `OfferFormProvider` mounted in `routes/__root.tsx`, above
   `AppLayout`, so it survives route changes.
3. TopBar "Konfigurator" leads to `/config`, which renders `OfferLayouts` when an offer is open and
   otherwise prompts for a new one.
4. **The journey ends here for a gondola.** One button, "Dodaj ciąg", appends a wall run. No type
   choice exists, no hidden path exists, no URL produces one. Discoverability of gondola: 1/10,
   which is the score for "does not exist".
5. For a wall run the journey continues: a header with an index badge, the server-computed
   description (showing "liczenie…" until the first autosave answers), "Liczba ciągów", the run
   price, duplicate and delete; underneath, a top-view strip of unit boxes at
   `SCALE_PX_PER_CM = 1.6`, one DOM button per physical unit.
6. Clicking a box opens the right-hand drawer titled "Ciąg {n}" with `ShelfUnitEditor`: a "Ciąg"
   section (Głębokość bazy, Wysokość), a "Regały" section (Szerokość, Liczba regałów, Dodaj regały)
   with a section navigator, a "Półki" section, and "Inne elementy ciągu".
7. Any edit marks the form dirty; 800 ms later the whole offer is PUT, the server re-prices, and the
   header description and price refresh. No price is ever computed in the browser.
8. "Oferta" lists each run with its description and price plus the discounted total; "Rozpiska"
   shows the merged component breakdown.

### What happens if a gondola reaches the form anyway (saved offer, hand-written request)

Not a crash, which is worse for diagnosis. `OfferLayouts` renders `WallLayoutPlan`; `useWatch`
returns the gondola, `if (!layout) return null` passes, `useFieldArray` on
`layouts.${i}.shelfUnits` yields an empty array, and the strip renders as an empty bordered box.
The header still shows the correct server-side description and price, so the run looks priced and
empty at the same time. The drawer can never open, because there is no box to click.

### The journey after the change

Steps 1 to 3 are unchanged. Step 4 gains the type choice. Step 5 draws two rows instead of one,
both from the same configuration. Step 6 opens the same drawer from a box on either row, and edits
one configuration that applies to both sides. Steps 7 and 8 already work and need nothing.

The important consequence of the corrected decision 2 is that no step is added. Phase 1 expected the
gondola journey to be one level deeper than the wall journey (plan box, then side, then editor); it
is not. It is the same journey with a different drawing.

| Dimension | Current | After | Assessment |
| --- | --- | --- | --- |
| Reachability | no path exists | Konfigurator, one click, same depth as a wall run | +1 |
| Discoverability | 1/10 | 8/10 if the add control names both run types in Polish; 5/10 if the type hides inside a select or a modal the user must open first | positive, conditional on decision I1 |
| Flow integration | not integrated | identical to the wall flow, step for step | positive |
| Multi-persona | not applicable, one role reaches the configurator (`requireAuth`, no role split on the offer routes) | unchanged | neutral |

One interaction detail worth deciding while drawing: with two rows rendered from one configuration,
`numberOfShelfUnits` copies are doubled on screen, and every box on both rows opens the same editor
state. That is correct under decision 2, and it should look deliberate rather than like a duplicated
row the user can edit independently.

## Defect Analysis (recorded even though the flag is false)

### Reproduction

```
pnpm vitest run packages/domain/src/orchestrations/calculateGondolaLayoutDemand
```

Input: height 130, `numberOfLayouts: 1`, two `gondolaUnits` entries, the first depth 47 with
`numberOfGondolaUnits: 2` and shelf units 2x80 plus 1x100, the second depth 37 with
`numberOfGondolaUnits: 1` and 1x100.

- Current, asserted by the test: `leg-130-8-3` appears twice, quantity 8 and quantity 2.
- Shared rule, for the first entry: one column of `3 + 1 = 4` uprights instead of two, so 4.
- Feet are unaffected: v1 counted them in full per side, and so does the current code. Back panels,
  base shelves and shelves are likewise per side and unchanged.

### Root cause

`calculateGondolaLayoutDemand` folds `numberOfGondolaUnits` into `numberOfLayouts` and delegates the
entire per-side calculation, uprights included, to `calculateWallLayoutDemand`. There is no place in
the current structure where "shared between the sides" could be expressed, which is why the fix is
structural rather than a coefficient.

### Regression risk areas

- `calculateWallLayoutDemand` and its test, if a leg-free per-side demand is extracted from it. This
  is the only way the wall path can regress.
- `calculateGondolaLayoutDemand.test.ts`: must be rewritten, it encodes the old rule.
- `calculateOfferDemand.test.ts`: contains a gondola with one entry and `numberOfGondolaUnits: 1`
  asserting `leg-130-8-3: 2`. Whether that assertion moves depends on decision C1, which is a good
  reason to settle the rule before writing code.
- Nothing else. `calculateBomPrice`, `breakdownDemandByCategory` and the API tests use wall fixtures
  or fixtures whose leg ids come out of the wall path. `buildLayoutDescription` is untouched.

## Integration Points

Every place the change lands, in dependency order.

### Domain (`packages/domain`)

1. `src/orchestrations/calculateGondolaLayoutDemand/calculateGondolaLayoutDemand.ts` (22 lines):
   the shared-upright rule.
2. `src/orchestrations/calculateGondolaLayoutDemand/calculateGondolaLayoutDemand.test.ts`: rewritten.
3. `src/orchestrations/calculateOfferDemand/calculateOfferDemand.test.ts`: conditional on C1.
4. `src/orchestrations/calculateWallLayoutDemand/calculateWallLayoutDemand.ts` plus its test:
   conditional, only if a leg-free per-side demand is extracted.

### Contract, API, database

Nothing. `LayoutGondolaValue` is complete, `OfferInputSchema` already accepts the union,
`updateOffer.controller.ts` prices whatever validates, `OfferOutput` carries no layout-type field,
and the `Offer` model stores opaque JSON. Verified, no migration.

### Web (`packages/apps/web/src`)

5. `offer/offer.types.ts`: widen to the union, at which point it equals `OfferInput` and may be
   deleted.
6. `offer/components/OfferFormProvider.tsx`: generic at lines 18 and 43, cast removed at line 37.
7. `offer/components/OfferLayouts.tsx`: the run-type choice, the per-layout plan dispatch, the
   second default factory, and the disabled-state copy when only one type can be furnished.
8. `offer/components/plan/WallLayoutPlan.tsx`: generic, narrowing on the watched layout, and either
   the header extracted or the whole component parameterised (decision I2).
9. NEW `offer/components/plan/GondolaLayoutPlan.tsx`, or a parameterisation of the existing plan.
10. NEW `offer/components/plan/LayoutPlanHeader.tsx`, only if 8 and 9 stay separate components.
11. `offer/components/editor/ShelfUnitEditor.tsx` (363 lines): the generic at four call sites, plus
    either a path-prefix parameter or a gondola sibling (decision I2).
12. `offer/components/editor/ExtrasFields.tsx`: generic only, the `layouts.${i}.extras` path is
    valid for both variants.
13. NEW `offer/helpers/createDefaultGondolaLayout.ts`: mirrors the null-means-cannot-furnish contract
    of `createDefaultWallLayout` exactly, emits exactly one `gondolaUnits` entry with
    `numberOfGondolaUnits: 2`, and always emits at least an empty `shelves` array because the schema
    requires it while the domain's `ShelfUnit` model does not.
14. `routes/offer/route.tsx`: generic only. The list at lines 149-168 reads description and price and
    is already variant-agnostic.
15. `offer/hooks/useInventoryDimensions.ts`: read, not changed. Gondola depth is constrained by
    `foot` and height by `leg` exactly as a wall is, and adding gondola constraints would need a new
    `@/domain` import in the browser, which the standards forbid.
16. `routes/config.tsx`: only if the run-type control is hoisted to page level.

The six file-local sub-components inside `ShelfUnitEditor` (`OptionStepper`, `CountStepper`,
`SectionNavigator`, `SectionLabel`, `ValueDisplay`, `ShelvesFields`) were flagged in Phase 1 as
needing extraction to avoid roughly 400 lines of duplication. Under the corrected decision 2 that is
true only if I2 chooses two editors. If one editor is parameterised, the extraction is unnecessary
and should not be done speculatively.

### Documentation

17. `CLAUDE.md` describes `packages/apps/web/src/layout/` as the "Layout builder (wall/gondola)" when
    it holds `AppLayout` and `TopBar`. Pre-existing drift, noticed twice in Phase 1, its own step.

## Issues Requiring Decisions

Only questions the four maintainer decisions, as corrected, do not already answer.

### Critical

**C1. What the upright rule does for gondola shapes this UI cannot create.**

For everything the UI will produce (one entry, `numberOfGondolaUnits: 2`) every candidate rule gives
the same answer, verified arithmetically: one column of `units + 1`, multiplied by `numberOfLayouts`.
There is nothing to decide there. But `calculateGondolaLayoutDemand` is a domain function over
`LayoutGondola`, the schema permits several entries and odd side counts, and two existing tests
contain exactly such shapes, so the rule has to say something about them.

- (A) One shared column per `gondolaUnits` entry per pair of sides:
  `ceil(numberOfGondolaUnits / 2) * (units + 1) * numberOfLayouts`. A lone side keeps a full column,
  which is physically right. Leaves `calculateOfferDemand.test.ts` unchanged at 2 uprights and
  changes only the first entry of the gondola test, from 8 to 4. Never produces a fraction.
- (B) v1 literally: `0.5 * (units + 1)` per side, summed across entries, `Math.ceil` at the end.
  Reproduces the old calculator exactly, including for shapes v1 could not express. Turns the
  gondola test into a single summed assertion of 5 and moves `calculateOfferDemand.test.ts` from 2
  to 1, which says a one-sided run needs half a column.
- (C) Refuse the shape: treat anything other than one entry with an even count as unsupported.
  Honest, but it puts a throw on a path the UI cannot reach and breaks a passing test to do it.

- Recommendation: **A**. It agrees with v1 wherever v1 was actually used, keeps the physically
  sensible answer for a lone side, moves exactly one assertion, and cannot emit a fraction.
- Constraint regardless of choice: no fractional quantity may leave the orchestration.
  `calculateBomPrice` and `breakdownDemandByCategory` take the demand list raw and neither rounds,
  so half an upright would reach Rozpiska as "0.5".
- Also do not carry over v1's own bug: it priced uprights from the unhalved count, so its upright
  price was double its upright quantity.

### Important

**I1. The add-run interaction.**
"Dodaj ciąg" is a single button today and the only entry point into the whole feature, so
discoverability of gondola is entirely a function of this control.
- Options: (A) two buttons, "Dodaj ciąg przyścienny" and "Dodaj ciąg dwustronny". (B) one button
  plus a type picker (`RadioGroup` following `InventoryItem.tsx:132-168`, or `Select`).
- Default: **A**, the smaller change and the higher discoverability. Each option must disable
  independently when its factory returns null, and the single hint "Uzupełnij magazyn komponentów,
  żeby móc dodać ciąg." has to say which type is unavailable.

**I2. Two components or one, for the plan and for the editor.**
The correction shrinks the gondola-versus-wall difference to almost nothing. In the editor it is one
path segment: `layouts.${i}.depth` becomes `layouts.${i}.gondolaUnits.0.depth`, and
`layouts.${i}.shelfUnits.${u}` becomes `layouts.${i}.gondolaUnits.0.shelfUnits.${u}`, while height
and extras stay where they are. In the plan it is the geometry, which is genuinely different.
- Options: (A) parameterise both existing components on a path prefix. (B) two siblings for both,
  which forces the six-sub-component extraction first. (C) parameterise the editor, keep a separate
  plan component, extract only the shared header.
- Default: **C**. The editor's difference is a prefix and nothing else, so a sibling would be a copy;
  the plan's difference is what it draws, which is what a separate component is for.
- Note for whoever plans this: B is what Phase 1 sized the work against, and it is now the most
  expensive option rather than the safe one.

**I3. Gondola plan geometry.**
The only genuinely new visual work, and undesigned. Both sides come from one configuration, so the
two rows are identical in width and unit count and differ from a wall run only by being doubled
about a centre line. Open: whether the two rows are drawn at the side depth each (total height
`2 * depth * SCALE_PX_PER_CM`) or the run is drawn once at combined depth with a centre line; and
how the doubled per-unit boxes signal that they are one configuration rather than two editable rows.
- Default: two rows sharing a centre line, each at `depth * SCALE_PX_PER_CM`, the box captions
  unchanged from the wall plan. This is also v2's prior art geometry.
- Cheap to settle with a mockup before implementation, and worth doing.

**I4. What the form does with a persisted gondola it cannot express.**
A saved `input` containing several `gondolaUnits` entries with different depths or different shelf
units is schema-legal, prices correctly on the server, and cannot be represented by this editor.
None exists today, since gondolas were never creatable, so this is about not corrupting one that
appears later by another route.
- Options: (A) render entry zero, edit entry zero, leave the rest of the array untouched, and show a
  Polish note on the run saying it has a configuration this editor cannot show in full. (B) the same
  without the note, which means a drawing and a price that quietly disagree. (C) normalise on load,
  collapsing the run to entry zero, which silently changes a saved offer's price. (D) refuse to draw
  the run and say so.
- Default: **A**. React Hook Form keeps the whole value, so entries one and up survive an edit and
  an autosave as long as nothing rewrites the array wholesale, which makes A cheap: the note is the
  only new work. Rule out C explicitly, since it destroys quoted data, and decision 7 in
  `docs/decisions.md` exists precisely to prevent that.

## Recommendations

1. Settle C1 before any code. It decides one test assertion and the shape of the rewritten test.
2. Do the domain half first, on its own, with its test rewritten. It is the only part the suite can
   actually verify, and finishing it leaves `pnpm vitest run` green as the gate for everything after.
3. Then widen the form type and run `pnpm typecheck` before writing a single new component. The
   union-over-`useWatch` question resolves there, and it is the one thing that could change the plan.
4. Then the factory and the add control, and stop. At that point a gondola is already priced
   correctly by the server before any plan component exists, which is a genuine checkpoint worth
   exercising in a running app.
5. Then the plan, then the editor. Do the extraction only if I2 chooses siblings.
6. Reuse the domain's own vocabulary: "ciąg regałów dwustronnych" against "ciąg regałów
   przyściennych", "Strona" per decision 4, and the existing configurator strings listed in the
   codebase analysis. Do not coin a second price formatter or a second category label map.
7. Say plainly in the work log which parts were verified statically only. Per the testing standard a
   frontend change is not verified until it has been opened in a browser, and the suite cannot see
   any of the web work.

## Risk Assessment

- **Complexity risk**: Medium at the low end. The correction to decision 2 removed the two deepest
  parts Phase 1 identified: the extra nesting level and the third drawer-selection coordinate. What
  remains deep is the union narrowing at every whole-layout read.
- **Integration risk**: Low below the API boundary, Medium above it. Nothing changes in the schemas,
  the controllers or the database, and no persisted offer needs migrating. The risk is concentrated
  in one type widening that touches six files.
- **Regression risk**: Medium, in two named places. The wall pricing path, if the upright change
  reaches into `calculateWallLayoutDemand`. The wall UI path, through whatever is shared with the
  gondola components, which no test covers.
- **Pricing risk**: Low in practice. Wall runs are unaffected by C1, no gondola has ever been
  persisted, and decision 7 in `docs/decisions.md` means a saved offer keeps the output it was
  quoted at until something makes the form dirty again.
- **Scope risk**: the client's requirement list is explicit that gondolas should also support end
  caps, double backs and covers, and decision 3 defers all of them. The gondola shipped by this task
  is a correct but partial answer to requirement 5, and it is worth saying so to the client rather
  than letting the first demo raise it.

# Specification Audit: Gondola layout support in the offer configurator UI

## TL;DR

**Pass with concerns.** Every checkable number, path, line reference and string in the spec holds
against source: the 8 to 4 upright move is right, nothing else in the suite moves on quantity, no
rounding sits downstream, the six consumers and the eleven `@/domain` imports are exactly six and
exactly eleven, and the mockup copy matches character for character. The one substantive problem is
the domain refactor: R12 contradicts itself, and neither of the two decompositions it permits can
satisfy all of the spec's own constraints at once. 2 high, 2 medium, 3 low.

## Key Decisions

- **High severity for R12, not critical.** It is ambiguous rather than wrong, and the spec's own
  frozen-order rule would catch a bad reading at test time, but it is the one instruction that
  touches working revenue code.
- **The "no component tests" constraint is scored honest, not an excuse.** It is a documented
  project decision with three independent confirmations in config and standards, not a convenience.
- **Citation slips demoted to low.** Off-by-one line refs and `useForm` vs `useFormContext` change
  nothing an implementer would do.

## Open Questions / Risks

- Which function actually loses its `calculateLegDemand` call, and whether a new domain file is
  created for it. The spec forbids new files and requires legs to leave `calculateWallLayoutDemand`;
  these cannot both hold.
- A default gondola is priced with no end cap, while `analysis/client-requirements.md` section 5
  says the client's standard gondola has one. The spec discloses the deferral but not that the
  resulting quote is systematically low for the standard case.
- The E2E phase that `analysis/requirements.md` names as "jedyną realną bramką dla warstwy widoku"
  does not appear anywhere in the spec's Testing Approach.

---

## Verification method

Read the spec, then verified each load-bearing claim against the file it rests on. Domain
arithmetic was checked by hand against the fixtures in the tests themselves. Counts (`@/domain`
imports, `WallOfferInput` consumers, mockup strings) were produced by grep, not read off the spec.
No claim in this report is taken from the spec or from an analysis artifact without a file and line
behind it.

---

## Findings

### H1. R12 is self-contradictory, and the literal reading breaks its own frozen-wall guarantee

**Severity: High. Category: Incorrect / Ambiguous.**

**Spec reference:** R12 - "Leg counting moves out of `calculateWallLayoutDemand` so that each
orchestration counts its own uprights. The wall path's returned demand list stays identical in
content and in order." Also Success Criteria 6 - "the only changed assertion in the suite is the
gondola upright quantity (8 to 4)".

**Evidence:**

- `packages/domain/src/orchestrations/calculateWallLayoutDemand/calculateWallLayoutDemand.ts` is
  itself the wall orchestration. It sits under `orchestrations/`, and lines 48 to 55 compose the
  returned list including `...calculateLegDemand(legContext, inventory)`.
- `packages/domain/src/orchestrations/calculateWallLayoutDemand/calculateWallLayoutDemand.test.ts:43`
  asserts `{ id: "leg-130-8-3", quantity: 12 }` as the tenth element of a twelve-element list
  compared with `toEqual` (lines 32 to 46).
- Therefore, if legs leave that function, the list loses an element, that whole-list `toEqual`
  fails, and Success Criteria 6 is false by construction.
- The contradiction is inherited verbatim from `analysis/technical-clarifications.md`, T2:
  "`calculateWallLayoutDemand` przestaje liczyć nogi. Każda orkiestracja liczy je jawnie:
  `calculateWallLayoutDemand` w swoim wywołaniu z pełnym kompletem." That sentence says the function
  both stops counting legs and counts them.

**Gap:** The spec names a target for the extraction without saying what the wall orchestration ends
up being. An implementer reading R12 literally will delete the leg call from the file whose test
freezes it.

**Recommendation:** Rewrite R12 to name the function that changes and the function that is created
or kept. The reading that is consistent with the rest of the spec is: `calculateWallLayoutDemand`
keeps its `calculateLegDemand` call, and what changes is that `calculateGondolaLayoutDemand` stops
delegating to it. If that is the intent, R12's first sentence should say so.

---

### H2. The extraction is under-determined, and the only two decompositions available each break a different spec rule

**Severity: High. Category: Incomplete.**

**Spec reference:** Technical Approach, "The upright rule and the extraction" - "Leg counting
therefore moves out of that function and each orchestration counts its own"; combined with
Reusable Components - "No other new file is justified."

**Evidence:**

- The wall list order is back panels, base shelves, shelves, **legs**, feet, extras
  (`calculateWallLayoutDemand.ts:48-55`, frozen by the expectation at
  `calculateWallLayoutDemand.test.ts:32-44`). Legs sit in the middle of the list, not at either end.
- A shared leg-less function returning one flat list therefore cannot have legs restored to the
  middle by concatenation. Only two order-preserving shapes exist:
  - **(a)** `calculateGondolaLayoutDemand` stops delegating and composes
    `calculateBackPanelDemand`, `calculateBaseShelfDemand`, `calculateShelfDemand`,
    `calculateFootDemand` and `countShelfUnitsByWidth` itself. That duplicates roughly 25 lines of
    composition, and legs then stay inside `calculateWallLayoutDemand`, contradicting R12.
  - **(b)** A new shared domain function is created for the leg-less core and both orchestrations
    compose around it. Under `.maister/docs/standards/backend/domain.md` that means a new folder,
    name and test, contradicting "No other new file is justified", which is written globally (it
    goes on to rule out new domain and new schema files by name).
- The spec names neither, and defers the choice implicitly to the plan while stating a constraint
  ("a decomposition that cannot preserve the existing order is the wrong decomposition") rather than
  a design.

**Gap:** The most regression-prone change in the task has no specified shape, while the spec
simultaneously forbids the file that one of the two viable shapes requires.

**Recommendation:** Pick (a) or (b) in the spec and say so. If (b), add the new domain function to
the New Components Required table with its folder and its test, and drop the blanket "no other new
file" so the two sections stop disagreeing.

---

### M1. The rejection that closed off the smallest option is falsified by the rule the spec chose

**Severity: Medium. Category: Incorrect (inherited reasoning).**

**Spec reference:** The spec adopts T2's rejection implicitly by treating the extraction as settled.
`analysis/technical-clarifications.md`, T2: "Odrzucono ... przekazywanie mnożnika do kalkulacji
ściennej (wprowadza ułamek do wnętrza funkcji operującej dziś na liczbach całkowitych)."

**Evidence:**

- The chosen rule is `ceil(numberOfGondolaUnits / 2) * (units + 1) * numberOfLayouts`. `ceil(n / 2)`
  is an integer for every integer `n`, so no fraction exists anywhere in the rule.
- `packages/domain/src/calculations/calculateLegDemand/calculateLegDemand.ts:26` returns
  `(numberOfUnits + 1) * numberOfLayouts`. The rule is expressible exactly by the existing signature
  with no new argument and no fraction:
  `calculateLegDemand({ height, numberOfLayouts: Math.ceil(n / 2) * numberOfLayouts, numberOfUnits: units })`.
- The spec's own Reusable Components table already describes this mechanism: "Called from both
  orchestrations with a different scope, which is the whole mechanism of the shared-upright rule."

**Gap:** The stated reason for rejecting the option that requires no touch to
`calculateWallLayoutDemand` at all no longer applies under the rule that was chosen. The spec
carries the rejection forward without re-testing it, and buys a refactor of the single file the
working wall pricing rests on.

**Note:** The rejection may still be right for the reason given in the spec's Key Decisions ("a
coefficient hidden inside a shared calculation"), which is a legitimate design argument. That is not
the argument on record in T2.

**Recommendation:** State the design reason and drop the fraction reason, or reconsider. Either way
the spec should not rest a risky refactor on a rationale its own rule invalidates.

---

### M2. The E2E gate named in the requirements is dropped from the spec

**Severity: Medium. Category: Missing.**

**Spec reference:** Implementation Guidance, Testing Approach - "Do not propose or write component
tests. The view is verified by using the application: adding a gondola, editing it, watching the
description and price arrive from the autosave, reloading the offer and confirming it comes back,
plus `pnpm validate` and `pnpm vitest run`."

**Evidence:**

- `analysis/requirements.md`, Open Questions: "Zerowe pokrycie testami frontendu: poprawność
  interfejsu weryfikuje się wyłącznie użyciem aplikacji, co czyni **fazę E2E jedyną realną bramką
  dla warstwy widoku**."
- The spec never mentions an E2E phase, browser verification, or the evidence such a phase would
  produce. Its Success Criteria 1 to 5 are written as a manual script for a human.

**Gap:** The requirements document identifies exactly one real gate for the half of the work the
unit suite cannot touch, and the spec silently replaces it with unrecorded manual clicking.

**Recommendation:** Name the E2E phase in Testing Approach and map Success Criteria 1 to 5 onto it,
so the view work has a gate that leaves evidence.

---

### L1. R15 attributes „Strona" to the domain

**Severity: Low. Category: Incorrect.**

**Spec reference:** R15 - "plus the domain's own „N x ciąg regałów dwustronnych" and „Strona" for a
side."

**Evidence:** `packages/domain/src/transformations/buildLayoutDescription/buildLayoutDescription.ts:29`
emits `${layout.numberOfLayouts} x ciąg regałów dwustronnych`, confirmed. „Strona" appears nowhere
under `packages/` (grep across src returns only the mockups). It appears three times in
`analysis/design-context/mockups/gondola-na-planie-dwa-warianty.html` as „Strona 1" / „Strona 2".

**Gap:** A new string is presented as existing vocabulary. Harmless to the implementation, but R15
is the requirement whose whole point is that no string is invented.

**Recommendation:** Move „Strona" to the new-strings side of the sentence, sourced to the mockup.

---

### L2. Small citation slips

**Severity: Low. Category: Incorrect (references).**

- Spec: "the extraction target in `WallLayoutPlan.tsx:96-137`" and "Header block (lines 96-137)".
  The `<header>` element opens at line 97 and closes at 137; line 96 is the enclosing `<article>`.
- Spec: `offer.types.ts` "is the `useFormContext` type argument in six other files". Six files is
  correct (`OfferLayouts.tsx`, `OfferFormProvider.tsx`, `ShelfUnitEditor.tsx`, `WallLayoutPlan.tsx`,
  `ExtrasFields.tsx`, `routes/offer/route.tsx`), but in `OfferFormProvider.tsx:18` it is the
  `useForm` argument, not `useFormContext`.

**Recommendation:** Correct in passing. Neither changes a decision.

---

### L3. `useFieldArray` over a union array is not covered by the stated fallback

**Severity: Low. Category: Incomplete.**

**Spec reference:** Open Questions - "React Hook Form path typing over a union array is the one thing
that could turn the type widening from mechanical into awkward. ... Fallback if
`FieldPathByValue<OfferInput, number>` stops resolving the deep paths: type the stepper `name` props
explicitly."

**Evidence:** Three call sites take array paths that exist on only one member of
`LayoutGondola | LayoutWall`:

- `OfferLayouts.tsx:14` - `useFieldArray({ control, name: "layouts" })`
- `WallLayoutPlan.tsx:69` - `useFieldArray({ control, name: \`layouts.${layoutIndex}.shelfUnits\` })`
- `ShelfUnitEditor.tsx:210` - `useFieldArray` on `...shelfUnits.${unitIndex}.shelves`

These resolve through `ArrayPath` / `FieldArray`, not `FieldPathByValue`, so the named fallback
(typing stepper `name` props) does not reach them.

**Assessment:** They should still resolve, by the same distribution mechanism that makes the
`FieldPathByValue` claim work, so this is a completeness gap in the risk register rather than a
predicted failure.

**Recommendation:** Add `useFieldArray` to the open question, with the fallback of an explicitly
typed `name` at those three sites.

---

## Verified as claimed

Recorded because the request was to check them, and each one holds.

### 1. The upright rule and its arithmetic - PASS

`calculateGondolaLayoutDemand.ts` delegates per entry with
`numberOfLayouts: numberOfLayouts * numberOfGondolaUnits`, so uprights today are
`(units + 1) * numberOfLayouts * numberOfGondolaUnits`.

Against `calculateGondolaLayoutDemand.test.ts`:

| Entry | n sides | units | layouts | today | new rule `ceil(n/2)*(units+1)*layouts` | test line |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 2 | 3 | 1 | `4 * 2 = 8` | `1 * 4 * 1 = 4` | :51 asserts 8 |
| 1 | 1 | 1 | 1 | `2 * 1 = 2` | `1 * 2 * 1 = 2` | :55 asserts 2 |

The 8 to 4 move is correct and the second entry is genuinely unaffected. Feet check out too: entry 0
asserts `foot-47: 8 = (3+1) * 1 * 2`, confirming R11's "full per side".

Nothing else in the suite moves on quantity. Every test file was enumerated and checked:

- `calculateOfferDemand.test.ts:46` - `leg-130-8-3: 2`, from a `numberOfGondolaUnits: 1` gondola
  (lines 16 to 26). `ceil(1/2) * (1+1) * 1 = 2`. Unchanged, exactly as the spec says.
- `calculateWallLayoutDemand.test.ts:43` and `calculateLegDemand.test.ts:13` - wall and unit paths,
  must not move (see H1).
- `createOfferPreview.test.ts` - uses a wall-only input, `leg-180-8-3: 2` inside a breakdown object.
- `buildLayoutDescription.test.ts` - descriptions only, no demand.
- `breakdownDemandByCategory`, `calculateBomPrice`, `countShelfUnitsByWidth`,
  `calculateBackPanelDemand`, `calculateBaseShelfDemand`, `calculateFootDemand`,
  `calculateShelfDemand`, `mapLayoutsToOfferOutput` - unaffected.
- `packages/apps/api`: `priceOffer.test.ts` uses `validOfferInput` (wall only, no gondola) and
  asserts `basePrice > 0`; `calculateOffer.test.ts` asserts with `expect.any(...)`;
  `offerRoutesAuth.test.ts` is auth only. None move. Worth noting as a free safety net:
  `priceOffer.test.ts:34` asserts `{ category: "leg", height: 9999 }` propagates, so any
  decomposition that drops the leg lookup entirely fails there too.

### 2. No fraction can leave the orchestration - PASS

- `breakdownDemandByCategory.ts:35-39` pushes `quantity` through verbatim and line 33 sums with
  `existing.quantity += quantity`. No rounding anywhere in the function.
- `calculateBomPrice.ts:24` computes `component.price * quantity` and lines 32 to 33 round only the
  **price** with `toFixed(2)`. The quantity itself is never touched.

So a fractional quantity would reach Rozpiska verbatim, exactly as the spec argues, and would also
silently distort the price. The `ceil` makes the case unreachable. Claim confirmed on both files.

### 3. The order-sensitivity risk - PASS, with one wording nuance

Three tests compare with `toEqual` in an order-sensitive way, and they are the three the spec names:

- `calculateWallLayoutDemand.test.ts:32-46` - a whole twelve-element demand list.
- `calculateOfferDemand.test.ts:41-51` - a whole eight-element demand list.
- `createOfferPreview.test.ts` - a whole `OfferOutput`. Nuance: this one compares a **breakdown
  object**, not a demand list. Order sensitivity still applies, because the arrays inside each
  category bucket are built in insertion order (`breakdownDemandByCategory.ts:37`), so the spec's
  conclusion holds even though its description of the artifact is loose.

`mapLayoutsToOfferOutput.test.ts` uses `expect.arrayContaining` / `expect.objectContaining` and is
not order-sensitive, so the count of three is right.

The propagation mechanism the spec relies on is real and stronger than stated:
`calculateOfferDemand.ts:25-38` aggregates into a `Map` keyed by id, so the offer-level list order is
first-appearance order. A reordering inside the gondola's per-entry list therefore moves
`calculateOfferDemand.test.ts` as well. "Only an ordering change could touch it" is exactly correct.

Whether the proposed extraction preserves order is the open part, and it is H2, not this item.

### 4. The type widening - PASS on the counts, plausible on the typing

Six consumers, confirmed by grep, no more and no fewer: `OfferLayouts.tsx:10,13`,
`OfferFormProvider.tsx:13,18,37,43`, `ShelfUnitEditor.tsx:15,17,76,139,206,297`,
`WallLayoutPlan.tsx:14,57`, `ExtrasFields.tsx:19,22`, `routes/offer/route.tsx:17,28`. The cast is at
`OfferFormProvider.tsx:37` exactly as cited: `reset(offer.input as WallOfferInput)`.

The union-narrowing plan is implementable, not hand-waved:

- `OfferInput["layouts"]` is `(LayoutGondola | LayoutWall)[]`
  (`packages/schemas/src/Offer.schema.ts:9`, `v.array(v.union([...]))`).
- RHF's `PathImpl<K, V, ...>` opens with `V extends Primitive | BrowserNativeObject ? ... : ...`,
  a distributive conditional, so a union `V` yields the paths of **both** members. The gondola deep
  paths therefore enter `Path<OfferInput>`.
- `PathValue<T, P>` opens with `T extends any ?`, also distributive, so
  `layouts.0.gondolaUnits.0.depth` evaluates to `number | never`, which is `number`, and survives the
  `extends TValue` filter in `FieldPathByValue`.
- The guards themselves are sound. `isLayoutWall` (`LayoutWall.schema.ts:31`) safe-parses a schema
  requiring `depth` and `shelfUnits`; a gondola object has neither, so it fails. `isLayoutGondola`
  requires `gondolaUnits`, which a wall lacks. Valibot's `v.object` ignores unknown keys, so
  discrimination is by required-key presence and works in both directions.
- `WallLayoutPlan.tsx:93` already has `if (!layout) return null`, so the narrowing folds in where the
  spec says it does.
- The spec's sequencing (widen, run `pnpm typecheck`, then write components) plus a named fallback is
  proper de-risking. L3 is the one corner the fallback does not cover.

The spec's related trap note also checks out: `Offer.schema.ts:9` lists `LayoutGondolaValue` first in
the union, while `calculateOfferDemand.ts:18` and `mapLayoutsToOfferOutput.ts:20` both switch on
`isLayoutWall` first. The hybrid-object hazard is real and correctly described as dormant.

### 5. The reuse claims - PASS, all three

- **ExtrasFields needs only a generic change.** It touches `layouts.${layoutIndex}.extras` at
  `ExtrasFields.tsx:26` and `:32`. `extras` is a common key of both schemas with an identical type
  (`LayoutWall.schema.ts:18-25`, `LayoutGondola.schema.ts:25-32`), both `v.optional`. Nothing else in
  the file is layout-shaped.
- **useInventoryDimensions needs nothing.** It returns four dimension lists keyed on component
  categories (`useInventoryDimensions.ts:35-40`) and never mentions a layout type. The gondola is
  constrained by the same four, because its demand runs through the same back panel, base shelf,
  shelf and foot calculations.
- **Eleven `@/domain` imports.** `grep -rn 'from "@/domain' packages/apps/web/src` returns exactly
  11 lines across 11 files, matching `.maister/docs/standards/frontend/components.md:51` ("Eleven
  files under `packages/apps/web/src` currently import runtime values from `@/domain/models/*`").
  Success Criteria 8 is therefore a real, mechanical check that passes today.

  The plan to hold at eleven is sound: `createDefaultGondolaLayout` taking its values from
  `createDefaultWallLayout` (which already owns the only `DEFAULT_SHELF_COUNT_BY_HEIGHT` import for
  this path, at `createDefaultWallLayout.ts:1`) needs only `@/schemas/LayoutGondola.schema`.

Two supporting details also check out: `ShelfUnitEditor.tsx` is exactly 363 lines as the spec says,
and the path split the spec proposes matches the file precisely. Today's layout-level paths are
`layouts.{i}.depth` (`:314`), `layouts.{i}.height` (`:207`, `:319`) and
`layouts.{i}.shelfUnits.{u}.*` (`:210`, `:216`, `:303`, `:334`, `:339`). Prefixing only `depth` and
`shelfUnits` while leaving `height` at the layout level is exactly what the two schemas require.

### 6. Coverage of the binding mockups - PASS

Both visual decisions are honoured, and every string matches the mockup source exactly:

| String | Spec | Mockup source |
| --- | --- | --- |
| „Dodaj ciąg przyścienny" / „Dodaj gondolę" | R1, Key Decisions | 2 occurrences each in the mockups |
| „Strona 1" / „Strona 2" | R4 | 3 occurrences each in `gondola-na-planie-dwa-warianty.html` |
| „Zmiany dotyczą obu stron gondoli." | R6 | verbatim, period included |
| „Oferta może mieszać oba rodzaje ciągów. Wycena spływa z serwera po zapisie." | R17 | verbatim |

Variant A wins in both mockups, and `analysis/design-context/INDEX.md` records that these two
mockups exist precisely to resolve decisions I1 and I3 from `analysis/scope-clarifications.md`. The
spec correctly closes both, and correctly drops `core/ui/radio-group.tsx` with variant B.

Polish copy against the running app, all confirmed present at the cited lines:
„Liczba ciągów" (`WallLayoutPlan.tsx:105`), „Powiel ciąg" (`:118`), „Usuń ciąg" (`:127`),
„Głębokość bazy" (`ShelfUnitEditor.tsx:313`), „Wysokość" (`:318`), „Szerokość" (`:333`),
„Liczba regałów" (`:338`), „Dodaj regały" (`:350`), „Półki" (`:236`),
„Inne elementy ciągu" (`ExtrasFields.tsx:44`). The domain string
„N x ciąg regałów dwustronnych" is at `buildLayoutDescription.ts:29`. `SCALE_PX_PER_CM = 1.6` is at
`WallLayoutPlan.tsx:17`, so R4's scale is the existing constant and not a new number.

R16 also checks out: `offer.api.ts:38` is `method: "PUT"` and `offers.routes.ts:25` is
`router.put("/:id", ...)`, with `AUTOSAVE_DEBOUNCE_MS = 800` at `OfferFormProvider.tsx:15`.

---

## Judgement: is "the React layer cannot be unit-tested here" honest?

**Honest.** Three independent confirmations, none of them the spec's own word:

1. `vitest.config.ts` sets `environment: "node"` with no JSDOM, and
   `include: ["packages/**/**/*.test.ts", "tests/**/*.test.ts"]`, which would not even match a
   `.test.tsx` file.
2. `coverage.include` is `["packages/domain/**/*.ts"]`.
3. `find packages/apps/web -name "*.test.*"` returns zero files.

More decisively, it is a recorded project decision rather than a state of affairs:
`.maister/docs/standards/testing/test-writing.md:45-49` - "Coverage Is Domain-Only, and UI Is
Deliberately Untested. Vitest runs in a Node environment with no JSDOM ... UI components have no unit
tests by decision." The spec is repeating a standard, not inventing an excuse. It would be fair to
note that the constraint is roughly three lines of config away from being lifted, but proposing to
lift it inside this task would be the spec overreaching its scope.

**Does it compensate?** Partly. Success Criteria 6, 7 and 8 are mechanically checkable, and 8 in
particular (`grep -rn 'from "@/domain' packages/apps/web/src` still returns eleven) is a genuine
automated guard that passes today. Criteria 1 to 5 are a manual script. What is missing is the E2E
phase the requirements named, which is M2 above.

---

## Clarification requested

1. **Which function loses its `calculateLegDemand` call, and does a new domain file get created?**
   The spec's two answers are mutually exclusive (H1, H2). This needs a decision before planning,
   not during it.
2. **Was the T2 rejection of "pass a multiplier to the wall calculation" re-examined after the
   `ceil` rule was chosen?** Its stated reason no longer applies (M1). If the real reason is the
   design argument in the spec's Key Decisions, say that instead.
3. **Should the client be told before the demo that a default gondola is quoted without an end
   cap?** `analysis/client-requirements.md` section 5 says "standardowo: ze szczytem". The spec
   defers end caps and flags it in Known Limitations, but does not say that the quote for a standard
   gondola is therefore low. With one commercial user, that is a commercial question, not only a
   scoping one.

---

## Extra features

None. Nothing in the spec is outside what `analysis/requirements.md` gathered, and the Out of Scope
list is broader and more specific than the requirements' own scope boundary.

---

## Compliance status

**Pass with concerns.**

The spec is unusually well evidenced. Every count, path, line reference, formula and string it makes
was checked and holds, including the ones easiest to get wrong: the 8 to 4 arithmetic, the absence
of rounding downstream, exactly six type consumers, exactly eleven domain imports, three
order-sensitive tests, and mockup copy to the character. The risk register is candid and names the
right risks in the right order.

The concerns are concentrated in one place, and it is the place that matters: the domain refactor
that touches working wall pricing has no determined shape, and the requirement describing it
contradicts itself. Resolve H1 and H2 before planning, correct M1's inherited rationale, carry M2's
E2E gate into the spec, and this is a clean specification.

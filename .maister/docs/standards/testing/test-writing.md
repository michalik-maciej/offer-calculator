## Test Writing

### Nothing Is Mocked

There is no mocking library in use and none should be introduced: no `vi.mock`, no `vi.fn`, no
`vi.spyOn`. The domain package depends on nothing, so its rules are plain functions over plain data
and need no test double. Where a collaborator is genuinely required, it is injected instead:
`createOfferPreview` takes the inventory as an argument, and the HTTP test builds its app with
`createApp({ getInventory: async () => componentCatalogMock })`.

This follows directly from the dependency-free domain package. A test that reaches for a mock is a
signal that the code under test grew a dependency it should not have.

### Tests Sit Beside Their Subject

A unit's test lives in the same folder, named `{name}.test.ts`. Only the HTTP integration test sits
apart, in `src/tests/`. No `.spec.ts`, no `__tests__` folders.

### Explicit Imports, One describe, `it`

Every file opens with `import { describe, expect, it } from "vitest"`; globals are not enabled.
Everything sits in a single top-level `describe` named after the function or the route, with no
nesting, and cases use `it`, never `test`.

```ts
describe("calculateBomPrice", () => {
  it("correctly sums the total price", () => { ... })
})
```

### Fixtures Come From the Domain Package

Test data is `componentCatalogMock` and `validOfferInput` from `packages/domain/src/fixtures`,
imported relatively inside the domain and through `@/domain/fixtures/*` from the API. Fixtures are
typed against production types, so a schema change breaks them at compile time rather than at run
time.

### Assert on the Whole Result, and on the Failure

Assertions compare the complete expected object with `toEqual`, or `toMatchObject` where only the
shape matters, rather than picking at individual fields. A unit that can fail gets both cases: one
that succeeds and one that throws or returns the error branch. Test names read as sentences about
behaviour, not about implementation.

### Coverage Is Domain-Only, and UI Is Deliberately Untested

Vitest runs in a Node environment with no JSDOM, and coverage is collected from
`packages/domain/**/*.ts` only. UI components have no unit tests by decision: they are thin forms and
lists, and testing them would mostly assert that React renders. The accepted trade is that a UI
regression is caught by using the app, so a frontend change is not verified until it has been opened
in a browser.

### The HTTP Layer Is Tested Through supertest

Endpoint tests build the app with `createApp` and injected fixtures and drive it with supertest,
asserting status and body across every branch the endpoint has. No test process touches Prisma or a
database, and the whole suite runs offline in about a second.

### A Domain Change Is Not Done Without a Test Change

Whenever domain logic changes, tests are added or updated in the same step, and `pnpm vitest run`
passes before the step is reported as finished.

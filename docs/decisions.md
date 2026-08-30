# Decision log

Why this project is built the way it is. Each entry records the decision, the reason behind it and
what it costs, so that a later change is made deliberately rather than by accident.

## 1. A monorepo, because two deployment targets share the same rules

**Decision.** One pnpm workspace with four packages (`domain`, `schemas`, `apps/api`, `apps/web`),
orchestrated by Turborepo.

**Why.** The bill-of-materials rules and the shape of an offer are needed on both sides: the API
computes an offer, the browser builds and validates the form that produces it. Two repositories
would mean either publishing internal packages or copying the rules, and copied rules drift.

**Cost.** Build order has to be declared (`dependsOn: ["^build"]` in `turbo.json`, plus TypeScript
project `references`), and a change in `domain` invalidates the cache for everything downstream.

## 2. The domain package has no dependencies

**Decision.** `packages/domain` imports nothing except `packages/schemas`. No Express, no React, no
Prisma, no HTTP, no date library.

**Why.** This is the part of the system that is genuinely hard and genuinely worth keeping. The same
problem has been rebuilt four times (`projektownia-kalkulator`, `next-calculator`,
`remix-calculator`, and this one), and every rewrite replaced the framework while the rules stayed.
Keeping them in a package that depends on nothing is what let that happen.

The second payoff is testing: every rule is a plain function over plain data, so the tests need no
database, no HTTP server, no mocking and no test harness beyond Vitest.

**Cost.** Anything environmental (reading the inventory, persisting an offer, formatting for a
user) has to be handled by the caller. `createOfferPreview` receives the component inventory as an
argument instead of fetching it, which is exactly why it can be tested in a millisecond.

**Enforced by.** ESLint `no-restricted-imports` blocks reaching across packages with relative
paths. There is no automated check that the dependency list stays empty; keeping
`packages/domain/package.json` free of dependencies is a manual discipline.

## 3. Validation schemas are shared, not duplicated

**Decision.** Valibot schemas in `packages/schemas` are the single definition of an offer, a layout
and an inventory component. The API validates requests against them (`v.safeParse` in every
controller), the React forms validate input against them, and both sides derive their static types
from the same source with `v.InferOutput`.

**Why.** The alternative is a TypeScript interface on the client and a validator on the server,
which are the same statement written twice and free to drift. Here the shape cannot disagree,
because there is only one shape, and a change to it breaks the type check on both sides at once.

**Why Valibot.** The schemas run in two places: in Node during request handling, and inside the
browser bundle for form validation. That rules out anything Node-only and makes bundle weight a real
constraint, which is what Valibot's per-function API is built for.

**Cost.** The validation vocabulary is fixed across the whole system. Anything the schemas cannot
express has to be checked by hand, on both sides.

## 4. Packages are wired by path aliases, not workspace dependencies

**Decision.** No package lists another in its `package.json`. `@/domain/*` and `@/schemas/*` are
resolved by TypeScript `paths` in `tsconfig.base.json`, and separately at each stage:

| Stage          | Mechanism                                                   |
| -------------- | ----------------------------------------------------------- |
| Type checking  | `paths` plus `references` in each `tsconfig.json`           |
| Web bundle     | `vite-tsconfig-paths` in `packages/apps/web/vite.config.ts` |
| API at runtime | `module-alias` in `packages/apps/api/src/bootstrap.ts`      |

**Why.** The shared packages are never published and never versioned; they are compiled as part of
whatever consumes them. Aliases keep imports readable (`@/domain/orchestrations/...`) without a
publish step or a `workspace:*` protocol that would still need path mapping for the type checker.

**Cost.** Three mechanisms have to stay in agreement, and they fail at different times. In
particular the API's compiled output is CommonJS that Node cannot resolve on its own:
`bootstrap.ts` registers the aliases against the compiled `dist` folders and only then dynamically
imports `./server`. Turning that dynamic import into a static one breaks production startup while
leaving `tsx` dev mode working.

## 5. Tests sit in the domain layer

**Decision.** Tests live next to the code in `packages/domain`, with one integration test that
exercises the offer endpoint end to end (`packages/apps/api/src/tests/calculateOffer.test.ts`).
Coverage is collected from `packages/domain` only, as configured in `vitest.config.ts`. UI
components have no unit tests.

**Why.** The domain is where a mistake is both possible and expensive: a wrong upright count or a
mispriced back panel produces a plausible-looking offer that is quietly wrong. The components above
it are thin, mostly forms and lists, and testing them would mostly assert that React renders.

**Cost.** A regression in the UI is caught by using the app, not by the suite. That is an accepted
trade for a tool with one user and a maintainer who runs it.

## 6. Authentication is a stateless JWT in an httpOnly cookie

**Decision.** Login signs a JWT (7-day expiry) and sets it as an `httpOnly`, `secure`,
`sameSite: "none"` cookie. There is no session table and no server-side session state.

**Why.** Stateless auth is what lets the API hold no memory between requests, which is what lets the
Fly machine stop entirely when nobody is using it (`min_machines_running = 0`,
`auto_stop_machines = 'stop'` in `fly.toml`). A session store would need somewhere to live and
would have to survive that. `sameSite: "none"` is required because the front end and the API are on
different sites (Vercel and Fly).

**Cost.** A token cannot be revoked before it expires. For a tool with a handful of known users that
is acceptable; it would not be for a multi-tenant product.

## 7. An offer stores its own output, not just its input

**Decision.** The `Offer` model persists both `input` and `output` as JSON
(`packages/apps/api/prisma/schema.prisma`).

**Why.** Component prices in the inventory change. If an offer were only its input, reopening one
from six months ago would recompute it against today's prices and silently show different numbers.
Storing the output makes an offer a record of what was quoted, not a query that happens to be
re-run.

**Cost.** A fix to the calculation rules does not propagate to offers already saved. That is the
point, but it means an old offer and a new one can legitimately disagree.

## 8. Vercel for the front end, Fly.io for the API

**Decision.** The web build is static output on Vercel. The API runs as a Docker image on Fly.io in
`ams`, 256 MB, scaling to zero, with migrations run as a release command
(`pnpm --filter @senior-calculator/api run migrate:deploy`). PostgreSQL is hosted on Neon.

**Why.** The two halves have different needs: the front end is static files best served from a CDN,
the API needs a real Node process and a database connection. Splitting them lets each scale to zero
and keeps the hosting cost of a single-user internal tool at nothing.

**Cost.** Cross-site cookies (see decision 6), a CORS origin that has to be configured
(`WEBAPP_DOMAIN`), and a cold start on the first request after the machine has stopped.

## 9. Strict TypeScript, including `noUncheckedIndexedAccess`

**Decision.** `strict: true` and `noUncheckedIndexedAccess: true` for every package
(`tsconfig.base.json`).

**Why.** The domain walks over arrays of shelf units and looks components up by index and by id.
`noUncheckedIndexedAccess` is what forces those lookups to admit they can miss, instead of producing
`undefined` typed as a `Component` and a `NaN` several steps later in the price.

**Cost.** More explicit guards in the calculation code. The alternative is discovering the missing
check in an offer sent to a customer.

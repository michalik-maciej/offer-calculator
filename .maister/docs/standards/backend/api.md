## API Design

### One Controller File per Endpoint

Each endpoint lives in `src/controllers/{feature}/{verb}{Resource}.controller.ts` and exports a
single handler named `{verb}{Resource}Controller`, typed `(req: Request, res: Response)`. A handler
that needs a dependency keeps the file name and exports a factory instead, as
`calculateOffer.controller.ts` exports `createCalculateOfferController`. Helpers living in the same
folder drop the suffix: `requireAuth.ts`, `priceOffer.ts`.

### Routers Only Wire

A route file creates a `Router()`, binds paths to imported controllers and exports it. No logic, no
validation, no database access. Middleware is applied per route rather than router-wide. A router
that needs a dependency becomes a `create{X}Router({ dep })` factory instead of a module singleton.

```ts
router.get("/items", requireAuth, getComponentsController)
```

### app.ts Is the Composition Root

`createApp` is the only place that picks real implementations, and it defaults them so tests can
substitute their own. Dependencies are threaded down explicitly, and the dependency's type is
exported next to the factory that consumes it.

```ts
export function createApp({
  getInventory = getAllComponents,
}: Partial<AppDependencies> = {}): Express
```

### Controllers Call Domain, Repositories Touch the Database

A controller validates, calls a domain orchestration, calls a repository, and answers. It never
reaches for the Prisma client itself. See `models.md`.

### Resource Paths

Everything is mounted under `/api/{resource}`, plural, with the identifier as the single path
segment (`/api/offers/:id`). Nesting is avoided; there is no versioning scheme and no need for one
while the API has a single known client.

### bootstrap.ts Keeps Its Dynamic Import

`packages/apps/api/src/bootstrap.ts` is the production entry point. It registers the `@/domain` and
`@/schemas` aliases against the compiled `dist` folders with `module-alias` and only then
dynamically imports `./server`, because the aliases must exist before any module that uses them
loads. Turning that into a static import breaks the built API at runtime while `tsx` dev keeps
working, so it looks harmless in development.

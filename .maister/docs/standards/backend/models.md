## Data Models and Persistence

### Prisma Lives in src/db Only

All database access sits in `src/db/{entity}.repository.ts` as plain exported async functions with
explicit `Promise<T>` return types. No repository classes. The client is instantiated once, in
`src/db/prisma.ts`. Controllers import repository functions and never touch the client.

```ts
export async function getAllComponents(): Promise<Component[]> {
  return prisma.component.findMany()
}
```

Input types for writes are declared beside the functions that take them (`CreateOfferInput`,
`UpdateOfferInput`).

### An Offer Stores Its Own Output

The `Offer` model persists both `input` and `output` as JSON. An offer is a record of what was
quoted, not a query to be re-run: reopening one must never recompute it against today's prices. The
accepted consequence is that a fix to the calculation rules does not reach offers already saved.

### Clear Names, Real Constraints

Singular model names, uniqueness and nullability expressed in the schema rather than in application
code, indexes on the columns that are actually filtered on (`Component.category`,
`Offer.createdAt`), and timestamps where the record's age matters.

### Validation Belongs Above the Database

Database constraints are the last line, not the first. The request is validated against its Valibot
schema in the controller before anything reaches Prisma. See `../global/validation.md`.

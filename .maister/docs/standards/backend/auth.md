## Authentication and Route Protection

### Stateless JWT in an httpOnly Cookie

Login signs a JWT with a 7 day expiry and sets it as an `httpOnly`, `secure`, `sameSite: "none"`
cookie. There is no session table and no server-side session state, which is what allows the Fly
machine to stop entirely when nobody is using the app. `sameSite: "none"` is required because the
front end (Vercel) and the API (Fly) are different sites.

The cost is accepted deliberately: a token cannot be revoked before it expires.

### Every Data Route Requires requireAuth

A route that reads or writes persisted data takes `requireAuth` as per-route middleware. Public by
design are only the health check and the login endpoint.

```ts
router.post("/items", requireAuth, createComponentController)
```

**Known deviation, unresolved.** `packages/apps/api/src/routes/offers.routes.ts` applies `requireAuth`
to none of its six routes, and `app.ts` mounts it without middleware, so listing, reading, creating,
updating and deleting offers is currently unauthenticated. The inventory routes are guarded. Do not
copy the offers router as a pattern.

### CORS Is Not Authorization

`cors({ credentials: true, origin: WEBAPP_DOMAIN })` constrains browsers, and only browsers. It stops
nothing that talks to the API directly, so it is never a reason to leave a route unguarded.

### Never Log or Return Credentials

Passwords are hashed with bcrypt and never logged. Authentication failures answer 401 with a generic
message: which half of the pair was wrong is not the client's business.

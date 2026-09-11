## Authentication and Route Protection

### Stateless JWT in an httpOnly Cookie

Login signs a JWT with a 7 day expiry and sets it as an `httpOnly`, `secure`, `sameSite: "none"`
cookie. There is no session table and no server-side session state, which is what allows the Fly
machine to stop entirely when nobody is using the app. `sameSite: "none"` is required because the
front end (Vercel) and the API (Fly) are different sites.

The cost is accepted deliberately: a token cannot be revoked before it expires.

### Every Data Route Requires requireAuth

A route that reads or writes persisted data is bound through `withAuth`, which wraps a `Router()`
and injects `requireAuth` ahead of the handlers. Public by design are only the health check, login
and registration.

```ts
const guarded = withAuth(router)

guarded.post("/items", createComponentController)
router.post("/login", loginController)
```

The guard is still per route, and that is deliberate: a router where some paths are public (`auth`)
would be wrong to protect wholesale. The wrapper only removes the repetition, so a route bound on
the bare `router` is the visible sign that it is public on purpose. The offers router went unguarded
for months, which is how a whole feature ends up public without anyone deciding it.

The protection is pinned by `packages/apps/api/src/tests/offerRoutesAuth.test.ts`, which walks every
offer route without a cookie and requires 401, and rejects a forged token as well. The inventory and
auth routers have no such test yet.

### requireAuth Validates the Payload, Not Just the Signature

A token that verifies against `JWT_SECRET` is still parsed with `JwtPayloadSchema` before it becomes
`req.user`, so a valid signature over the wrong shape answers 401 instead of putting a half-empty
payload in front of the controllers. Everything downstream can then rely on `sub`, `email` and
`role` being there.

### An Offer Belongs to Its Author

Offer endpoints turn `req.user` into an `OfferScope` (`{ isAdmin, userId }`) with `toOfferScope` and
pass it to the repository, which filters by owner. An offer belonging to somebody else answers 404,
the same as one that does not exist, so an id cannot be used to discover that an offer is there.
A user with the `ADMIN` role is exempt and reaches every offer. See decision 11 in
`docs/decisions.md`.

### CORS Is Not Authorization

`cors({ credentials: true, origin: WEBAPP_DOMAIN })` constrains browsers, and only browsers. It stops
nothing that talks to the API directly, so it is never a reason to leave a route unguarded.

### Never Log or Return Credentials

Passwords are hashed with bcrypt and never logged. Authentication failures answer 401 with a generic
message: which half of the pair was wrong is not the client's business.

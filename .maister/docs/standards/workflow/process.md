## Working Process

### One Concern per Step

A step implements one thing, verifies it, reports and stops for the next instruction. Unrelated
fixes are not batched into the same pass, however tempting the detour looks while the file is
already open.

### Problems Are Reported, Not Quietly Fixed

Anything noticed along the way is listed briefly at the end of the message, without hedging, and left
alone. It becomes its own step, and only after the maintainer agrees to it.

### Verify With pnpm validate and pnpm vitest run

Every step is checked with `pnpm validate` (typecheck, lint, format check) and `pnpm vitest run`, and
the report says plainly what passed and what did not. When something was only checked statically and
never exercised in a running app, say so in those words. A frontend change is not verified until it
has been opened in a browser.

### What Green Means Here

CI runs one job on every push to `main` and every pull request: `pnpm install --frozen-lockfile`,
then `pnpm validate`, then `pnpm vitest run`. Typecheck and lint fan out across all four packages
through Turborepo; the format check is a single `prettier --check .` over the whole repository.

Two gaps are worth knowing about. Tests are not part of `validate`, they are a separate step, so a
local `pnpm validate` alone proves less than CI does. And nothing in CI builds the web bundle, so a
change that typechecks and lints can still break `vite build` and will only fail on Vercel.

### The Toolchain Version Lives in Three Places

Node 24 is pinned in `engines.node`, in the CI `setup-node` step and in the API `Dockerfile`; pnpm
9.0.0 comes from the `packageManager` field and is read by both CI and the Docker build. Changing the
version means changing all of them together.

### CI Has No Database

The workflow sets a deliberately unusable `DATABASE_URL` purely so `prisma generate` can run. There
are no service containers and no secrets, so every test must be pure or take its collaborators by
injection.

### Read the Decision Log Before Touching the Foundations

`docs/decisions.md` records why the architecture is what it is, and what each choice costs. Read it
before changing package wiring, authentication or how offers are persisted, so that a change is made
deliberately rather than by accident.

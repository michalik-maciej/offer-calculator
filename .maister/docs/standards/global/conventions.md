## Development Conventions

### pnpm Only, From the Workspace Root

Every command runs from the repository root and uses pnpm. npm and yarn are not supported. A command
aimed at one package goes through `pnpm --filter <package-name>`; without a filter it runs against
all of them.

### Predictable Structure

Files and directories follow the layout already in place: four packages, feature folders in the web
app, one folder per unit of logic in the domain. A new file goes where its neighbours are.

### Environment Variables

Configuration lives in environment variables and secrets are never committed. The API requires
`DATABASE_URL`, `JWT_SECRET` and `WEBAPP_DOMAIN`; the web build reads `VITE_API_URL` at build time.

### Minimal Dependencies

Dependencies stay lean. The domain package in particular has none, by decision, and that is enforced
by discipline rather than by tooling: check `packages/domain/package.json` before adding anything.

### Build Only What Is Needed

No speculative code, no "just in case" additions. See `minimal-implementation.md`.

### Documentation Follows the Code

`CLAUDE.md`, `docs/decisions.md` and the documents under `.maister/docs/` describe how this project
actually works. When a change makes one of them wrong, the change is not finished until that file is
corrected too.

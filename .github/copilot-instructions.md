# Senior Calculator - AI Agent Instructions

## Project Architecture

This is a **pnpm workspace monorepo** managed by **Turborepo** for a full-stack calculator web application. The project is in early setup phase with foundational structure.

### Tech Stack (from `/docs/decisions.md`)

- **Frontend**: React + Vite + TypeScript → Vercel
- **Backend**: Express + TypeScript → Fly.io
- **Database**: PostgreSQL (Neon) via Prisma ORM
- **Validation**: Valibot
- **Auth**: JWT (stateless)
- **Monorepo**: pnpm + Turborepo

### Monorepo Structure

```
senior-calculator/
├── apps/
│   ├── web/        # React + Vite frontend (not created yet)
│   └── api/        # Express backend (not created yet)
├── packages/
│   ├── config/     # Shared tooling configs (empty)
│   ├── domain/     # Core business logic/types (empty)
│   └── schemas/    # Valibot schemas for data validation
```

**Key principle**: Domain-driven monorepo where:

- `packages/schemas/` contains Valibot schemas shared between frontend/backend
- `packages/domain/` will hold core business logic and TypeScript types
- `packages/config/` houses shared ESLint, TypeScript, Prettier configs
- `apps/*` are deployment targets consuming shared packages

## Development Workflow

### Package Manager

- **Use `pnpm` exclusively** (v9.0.0) - NOT npm or yarn
- All commands run from workspace root
- Node.js >= 20 required

### Common Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # Runs all dev tasks in parallel via Turbo

# Build
pnpm build            # Builds all packages (respects dependencies)

# Quality checks
pnpm lint             # Lints all packages
pnpm format           # Formats code with Prettier (*.ts, *.tsx, *.md)
```

### Turborepo Task Pipeline

Tasks defined in `turbo.json` with dependency orchestration:

- **`build`**: Respects `^build` (builds dependencies first), caches `.next/**` output
- **`dev`**: No caching, runs persistently (for servers/watchers)
- **`lint`, `typecheck`**: Run after dependency checks complete

When adding new tasks, consider:

- Use `dependsOn: ["^taskName"]` for tasks needing upstream completion
- Set `cache: false` for dev servers and persistent processes
- Include `.env*` in `inputs` if tasks read environment variables

## Project-Specific Conventions

### Adding New Packages

1. Create in appropriate directory (`apps/` or `packages/`)
2. Add `package.json` with proper naming: `@senior-calculator/package-name`
3. Register scripts matching root pipeline (`build`, `lint`, `dev`, etc.)
4. Install dependencies using `pnpm add <package> --filter @senior-calculator/package-name`
5. Reference internal packages via workspace protocol: `"@senior-calculator/schemas": "workspace:*"`

### TypeScript Configuration

- Central TypeScript version: 5.9.2
- Share configs from `packages/config/` when created
- Each package should extend workspace configs

### Code Formatting

- Prettier handles all formatting automatically
- Targets: `**/*.{ts,tsx,md}`
- Run `pnpm format` before committing

## Current State

### Existing Packages

- **`packages/schemas/`**: Contains Valibot schemas (`product.ts`, `collection.ts`) for shared validation
  - Uses Valibot v1.2.0 for runtime validation
  - Exports schemas and inferred TypeScript types

### Next Steps for Development

1. **Create `apps/web/`**: React + Vite frontend with TypeScript
2. **Create `apps/api/`**: Express backend with TypeScript
3. **Setup Prisma**: Database schema and migrations in `apps/api/`
4. **Config package**: Shared ESLint, TypeScript, Prettier configurations
5. **Domain package**: Core business logic and domain models

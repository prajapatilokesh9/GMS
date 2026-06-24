# Contributing to FitCore Pro

## Branch Strategy

- `main` — Production-ready, protected. Merges via PR only.
- `develop` — Integration branch. Feature branches merge here first.
- `feature/*` — New features. Branch from `develop`.
- `fix/*` — Bug fixes. Branch from the affected release branch.
- `release/*` — Release preparation.

## PR Requirements

Before requesting review, ensure:

- [ ] `pnpm build` passes (all workspaces)
- [ ] `pnpm test` passes (all tests)
- [ ] `pnpm lint` passes (zero warnings)
- [ ] TypeScript strict mode — zero errors
- [ ] No `console.log` — use structured logging (`logger.info`, etc.)
- [ ] Prisma schema changes include a migration (`prisma migrate dev --name <description>`)
- [ ] New endpoints include Zod validation schemas
- [ ] New endpoints are documented in Swagger (update `swagger.ts` if needed)
- [ ] Integration tests added for new API endpoints

## Code Style

- TypeScript strict mode enforced
- Prettier for formatting (`pnpm format`)
- Imports order: external → internal → relative
- Async handlers use `express-async-errors` (no try/catch in controllers)
- Response format: `{ success: true, data: ... }` on success
- Error format: `{ success: false, error: { code, message, details? } }` on failure

## Testing

- Unit tests: Jest, co-located with source (`*.test.ts`)
- Integration tests: Supertest, in `src/__tests__/`
- E2E tests: Playwright (planned), in `apps/web/e2e/`
- Run full suite: `pnpm test`

## Adding a New Module

1. Create `src/modules/<name>/` with `.controller.ts`, `.service.ts`, `.routes.ts`, `.validation.ts`
2. Export routes and mount in `src/core/router.ts`
3. Add integration tests in `src/__tests__/`
4. Update Swagger docs in `src/core/swagger.ts`

## Database Changes

1. Edit `prisma/schema.prisma`
2. Run `cd apps/backend && npx prisma migrate dev --name <description>`
3. Run `pnpm db:generate` to regenerate client
4. Update seed if needed in `src/database/seed.ts`
5. Ensure migration is idempotent (use upserts)

## Security

- Never commit secrets, API keys, or passwords
- Use `.env` files (gitignored) for local config
- All mutation endpoints must have input validation (Zod)
- Auth endpoints must have rate limiting where applicable
- JWT tokens must have short expiry (access: 15m, refresh: 7d)
- Password reset tokens must expire (1h) and be single-use

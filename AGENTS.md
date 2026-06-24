# FitCore Pro GMS — AI Context

## Tech Stack
- Backend: Express.js, Prisma ORM, PostgreSQL, Redis, JWT
- Frontend: Next.js (App Router), Tailwind, TypeScript
- Monorepo: pnpm + Turborepo
- Infra: Docker, Terraform (AWS), K6, GitHub Actions

## Commands
- `pnpm dev` — Start all apps in dev mode
- `pnpm build` — Build all apps
- `pnpm lint` — Lint all apps
- `cd apps/backend && pnpm test` — Run backend tests
- `cd apps/backend && pnpm prisma:generate` — Generate Prisma client
- `cd apps/backend && pnpm prisma:migrate` — Run migrations

## Key Directories
- `apps/backend/src/modules/` — All feature modules (auth, billing, equipment, etc.)
- `apps/backend/prisma/schema.prisma` — Database schema
- `apps/web/src/app/` — Next.js pages (App Router)
- `docs/` — Architecture docs, sprint plans
- `infrastructure/` — Docker, Terraform, K6

## Database
- PostgreSQL with Prisma ORM
- Multi-tenant via gym_id on records
- Migrations in `apps/backend/prisma/migrations/`

## Auth
- JWT-based authentication
- Role-based access control (super_admin, gym_admin, trainer, receptionist, member)
- Permission-checking middleware

## Note for AI
This AGENTS.md is the primary context file. Read `.opencode/project-context.md` for detailed project summary.

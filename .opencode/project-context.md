# FitCore Pro GMS — Project Context

## Project Overview
Gym Management System monorepo with backend (Express + Prisma), frontend (Next.js), and shared packages.

## Tech Stack
- **Backend:** Express.js, Prisma ORM, PostgreSQL, Redis, JWT auth
- **Frontend:** Next.js (App Router), Tailwind CSS, TypeScript
- **Monorepo:** pnpm workspaces, Turborepo
- **Infra:** Docker, Terraform (AWS ECS/RDS/Redis), K6 load testing
- **CI/CD:** GitHub Actions

## Repository Structure
```
apps/
  backend/        — Express API server
  web/            — Next.js admin frontend
packages/
  shared/         — Shared types and constants
  config-eslint/  — Shared ESLint config
  config-typescript/ — Shared TS config
docs/             — Architecture docs, sprint planning
infrastructure/   — Docker, Terraform, K6 scripts
```

## Backend Modules (apps/backend)
- Auth (JWT, RBAC)
- Users, Roles, Permissions
- Gyms (multi-tenant)
- Equipment Catalogue, Inventory, Maintenance
- Billing (plans, memberships, payments)
- PT Packages & Sessions
- Supplements & Orders
- Commissions & Payouts
- Notifications
- Events (in-memory event bus)
- Audit logging

## Frontend Pages (apps/web)
- Auth: Login, Register, Forgot/Reset password
- Admin: Billing, Commissions, Equipment, Gyms, PT, Supplements, Trainers
- User: Profile, Login history, Gym list

## Current State
- Phase 1 completed (Sprints 1-3) — Auth, Users, Gyms, Equipment
- Phase 2 in progress (Sprints 4-6) — Billing, PT, Supplements, Commissions
- Database migrations up to Sprint 6
- Infrastructure: Docker compose for local, Terraform for AWS deployment

## Git
- GitHub: https://github.com/prajapatilokesh9/GMS
- Branch: master (default)
- Initial commit: a9c4c6d — 313 files
- `.gitignore` configured to exclude node_modules/, dist/, .next/, .turbo/, etc.

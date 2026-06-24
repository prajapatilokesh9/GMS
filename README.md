# FitCore Pro

Multi-sided fitness SaaS platform — Phase 1 Foundation.

**Status:** Phase 1 Sprint 3 (Buffer/Hardening)  
**Stack:** Express.js · Prisma · PostgreSQL 18 · Redis 7 · Next.js 16 · BullMQ · Terraform

---

## Quick Start

### Prerequisites

- Node.js >= 18 (uses 20 in Docker/CI)
- pnpm >= 8 (`corepack enable && corepack prepare pnpm@9 --activate`)
- Docker Desktop (PostgreSQL 18 + Redis 7)
- A `.env` file (see `.env.example`)

### Setup

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Install dependencies
pnpm install

# 3. Generate Prisma client
pnpm db:generate

# 4. Run database migration
cd apps/backend
npx prisma migrate dev
cd ../..

# 5. Seed the database
pnpm db:seed

# 6. Start development
pnpm dev
```

### Verify

```bash
# Backend health check
curl http://localhost:4000/health

# Run tests
pnpm test

# Build all workspaces
pnpm build
```

---

## Project Structure

```
├── apps/
│   ├── backend/           # Express.js API server (port 4000)
│   │   ├── prisma/        # Schema, migrations, seed
│   │   └── src/
│   │       ├── core/      # App setup, router, error handler, swagger
│   │       ├── config/    # Environment config, Redis client
│   │       ├── database/  # Prisma service (singleton)
│   │       ├── modules/   # Feature modules
│   │       │   ├── auth/           # Register, login, JWT, password reset
│   │       │   ├── auth-history/   # Login history tracking
│   │       │   ├── common/         # Middleware, utilities, errors
│   │       │   ├── events/         # DLQ admin routes (Sprint 3)
│   │       │   ├── gym-documents/  # Document upload/status
│   │       │   ├── gyms/           # Gym CRUD, verify, staff
│   │       │   ├── notifications/  # Email/SMS/Push stubs
│   │       │   ├── roles/          # Roles & permissions
│   │       │   └── users/          # Profile & user management
│   │       ├── events/    # BullMQ event bus, producers, consumers
│   │       └── monitoring/ # CloudWatch metrics
│   └── web/               # Next.js 16 frontend (port 3000)
├── packages/
│   └── shared/            # Shared TypeScript types
├── infrastructure/
│   ├── docker/            # Dockerfiles for backend
│   └── terraform/         # AWS staging deployment (Terraform)
└── scripts/               # Security audit, utility scripts
```

---

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all workspaces in dev mode |
| `pnpm build` | Build all workspaces |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all workspaces |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed the database |
| `pnpm db:studio` | Open Prisma Studio |
| `bash scripts/security-audit.sh` | Run security audit |

---

## API Documentation

Swagger UI is available at `http://localhost:4000/api/v1/docs` when the backend is running.

Key endpoints:

| Module | Base Path | Auth |
|--------|-----------|------|
| Auth | `/api/v1/auth` | Mixed (public + JWT) |
| Users | `/api/v1/users` | JWT |
| Gyms | `/api/v1/gyms` | JWT + RBAC |
| Documents | `/api/v1/gyms/:id/documents` | JWT |
| Roles | `/api/v1/roles` | JWT |
| Login History | `/api/v1/auth/login-history` | JWT |
| Events Admin | `/api/v1/admin/events` | JWT |
| Health | `/health` | Public |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `REDIS_HOST` | Yes | localhost | Redis host |
| `REDIS_PORT` | Yes | 6379 | Redis port |
| `JWT_ACCESS_SECRET` | Yes | — | JWT access token signing key |
| `JWT_REFRESH_SECRET` | Yes | — | JWT refresh token signing key |
| `JWT_ACCESS_EXPIRES_IN` | No | 15m | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | No | 7d | Refresh token TTL |
| `CORS_ORIGIN` | No | http://localhost:3000 | CORS allowed origin |
| `API_PREFIX` | No | /api/v1 | API route prefix |
| `PORT` | No | 4000 | Server port |
| `SENTRY_DSN` | No | — | Sentry error tracking DSN |
| `AWS_REGION` | No | — | AWS region (enables CloudWatch) |

---

## Deployment

### Staging (AWS)

The staging environment is defined in `infrastructure/terraform/`. Deployment follows:

1. Terraform provisions: VPC, RDS PostgreSQL, ElastiCache Redis, ECS Fargate, ALB + HTTPS
2. GitHub Actions CD (`cd-staging.yml`) builds Docker image, pushes to ECR, deploys to ECS
3. Smoke test verifies health endpoint after deployment

See `infrastructure/terraform/README.md` for detailed deployment instructions.

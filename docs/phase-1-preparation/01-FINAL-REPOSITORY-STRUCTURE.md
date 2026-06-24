# Phase 1 — Final Repository Structure

**Reference:** FITCORE PRO BLUEPRINT — Project Structure  
**Scope:** Phase 1 only — Foundation, Auth, Multi-tenancy, Gym onboarding, Core API, Event infrastructure  
**All paths relative to:** `D:\Lokesh\codes\GMS\fitcore-pro\`

---

## Phase 1 Directory Tree

```
fitcore-pro/
│
├── README.md
├── package.json                          # Root: npm workspaces (apps/backend, apps/web, apps/mobile, packages/*)
├── turbo.json                            # Turborepo pipeline config
├── .gitignore
├── .env.example
├── docker-compose.yml                    # PostgreSQL 16 + Redis 7 + Elasticsearch (local dev)
├── docker-compose.services.yml           # Optional: ClickHouse, Kafka (Phase 3+)
├── .editorconfig
├── .prettierrc
├── .eslintrc.js
│
├── apps/
│   ├── backend/                          # NestJS — API Gateway + Modular Monolith
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── main.ts                   # Bootstrap, Swagger, ValidationPipe
│   │   │   ├── app.module.ts             # Root module (imports all Phase 1 modules)
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── current-user.decorator.ts
│   │   │   │   │   ├── roles.decorator.ts
│   │   │   │   │   ├── permissions.decorator.ts
│   │   │   │   │   ├── public.decorator.ts
│   │   │   │   │   └── api-version.decorator.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   ├── roles.guard.ts
│   │   │   │   │   └── permissions.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── logging.interceptor.ts
│   │   │   │   │   ├── transform.interceptor.ts
│   │   │   │   │   └── timeout.interceptor.ts
│   │   │   │   ├── filters/
│   │   │   │   │   └── all-exceptions.filter.ts
│   │   │   │   ├── pipes/
│   │   │   │   │   └── validation.pipe.ts
│   │   │   │   ├── middleware/
│   │   │   │   │   ├── tenant.middleware.ts          # Extract tenant_id from JWT, set DB session var
│   │   │   │   │   └── rate-limit.middleware.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── pagination.dto.ts
│   │   │   │   │   ├── api-response.dto.ts
│   │   │   │   │   └── api-error.dto.ts
│   │   │   │   ├── interfaces/
│   │   │   │   │   ├── jwt-payload.interface.ts
│   │   │   │   │   ├── authenticated-request.interface.ts
│   │   │   │   │   └── event.interface.ts
│   │   │   │   ├── constants/
│   │   │   │   │   ├── error-codes.ts
│   │   │   │   │   ├── roles.ts
│   │   │   │   │   └── permissions.ts
│   │   │   │   ├── utils/
│   │   │   │   │   └── password.utils.ts
│   │   │   │   ├── database/
│   │   │   │   │   ├── prisma/
│   │   │   │   │   │   ├── prisma.module.ts
│   │   │   │   │   │   ├── prisma.service.ts
│   │   │   │   │   │   └── prisma-client-extensions.ts
│   │   │   │   │   └── redis/
│   │   │   │   │       ├── redis.module.ts
│   │   │   │   │       └── redis.service.ts
│   │   │   │   └── events/
│   │   │   │       ├── event-bus.module.ts
│   │   │   │       ├── event-bus.service.ts           # BullMQ wrapper
│   │   │   │       └── interfaces/
│   │   │   │           └── base-event.interface.ts
│   │   │   │
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── strategies/
│   │   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   │   ├── jwt-refresh.strategy.ts
│   │   │   │   │   │   ├── google.strategy.ts
│   │   │   │   │   │   └── apple.strategy.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── register.dto.ts
│   │   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   │   ├── refresh-token.dto.ts
│   │   │   │   │   │   └── forgot-password.dto.ts
│   │   │   │   │   └── tests/
│   │   │   │   │       ├── auth.service.spec.ts
│   │   │   │   │       └── auth.controller.spec.ts
│   │   │   │   │
│   │   │   │   ├── users/
│   │   │   │   │   ├── users.module.ts
│   │   │   │   │   ├── users.controller.ts
│   │   │   │   │   ├── users.service.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── create-user.dto.ts
│   │   │   │   │   │   └── update-user.dto.ts
│   │   │   │   │   └── tests/
│   │   │   │   │       ├── users.service.spec.ts
│   │   │   │   │       └── users.controller.spec.ts
│   │   │   │   │
│   │   │   │   ├── gyms/
│   │   │   │   │   ├── gyms.module.ts
│   │   │   │   │   ├── gyms.controller.ts
│   │   │   │   │   ├── gyms.service.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── create-gym.dto.ts
│   │   │   │   │   │   ├── update-gym.dto.ts
│   │   │   │   │   │   └── gym-response.dto.ts
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── roles/                              # RBAC module
│   │   │   │   │   ├── roles.module.ts
│   │   │   │   │   ├── roles.controller.ts
│   │   │   │   │   ├── roles.service.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   └── notifications/                      # Phase 1: Basic notification infrastructure
│   │   │   │       ├── notifications.module.ts
│   │   │   │       ├── notifications.controller.ts
│   │   │   │       ├── notifications.service.ts
│   │   │   │       ├── channels/
│   │   │   │       │   ├── sms-channel.ts              # Twilio (stubbed in Phase 1)
│   │   │   │       │   ├── email-channel.ts            # SendGrid (stubbed in Phase 1)
│   │   │   │       │   └── push-channel.ts             # Firebase (stubbed in Phase 1)
│   │   │   │       └── tests/
│   │   │   │
│   │   │   └── events/
│   │   │       ├── producers/
│   │   │       │   └── auth.events.ts                  # user.registered, user.logged_in
│   │   │       └── consumers/
│   │   │           └── notification.consumer.ts        # Listen for auth events
│   │   │
│   │   ├── prisma/
│   │   │   ├── schema.prisma                           # Master schema (all Phase 1 tables)
│   │   │   ├── migrations/                             # Auto-generated
│   │   │   └── seed.ts                                 # Seeds: tenants, roles, permissions, admin user
│   │   │
│   │   ├── test/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   │
│   │   └── .env.example
│   │
│   └── web/                                            # Phase 1: Basic web app (Next.js)
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.js
│       ├── Dockerfile
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx                                # Landing page
│       │   ├── login/
│       │   │   └── page.tsx
│       │   ├── register/
│       │   │   └── page.tsx
│       │   └── dashboard/
│       │       └── page.tsx                             # Auth-redirected dashboard stub
│       ├── components/
│       │   └── ui/
│       ├── hooks/
│       ├── lib/
│       ├── stores/
│       ├── styles/
│       └── public/
│
├── packages/
│   ├── shared-types/
│   │   ├── package.json
│   │   └── src/
│   │       ├── interfaces/
│   │       │   ├── user.interface.ts
│   │       │   ├── gym.interface.ts
│   │       │   └── auth.interface.ts
│   │       ├── enums/
│   │       │   ├── role.enum.ts
│   │       │   └── status.enum.ts
│   │       └── constants/
│   │           └── error-codes.ts
│   └── config/
│       ├── package.json
│       └── src/
│           ├── eslint-preset.js
│           └── tsconfig.base.json
│
├── infrastructure/
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── modules/
│   │   │   ├── vpc/
│   │   │   ├── rds/
│   │   │   ├── elasticache/
│   │   │   └── ecs/
│   │   └── environments/
│   │       ├── dev/
│   │       └── staging/
│   ├── docker-compose.yml                              # Root-level Docker Compose
│   └── scripts/
│       ├── setup-dev.sh
│       ├── migrate.sh
│       └── seed.sh
│
├── docs/
│   ├── phase-0-foundation/
│   └── phase-1-preparation/
│
├── scripts/
│   └── seed-data/
│       └── demo-data.json
│
└── .github/
    └── workflows/
        ├── ci.yml                                      # PR: lint, typecheck, test, build
        ├── cd-staging.yml                              # Merge to main: deploy to staging
        └── security-scan.yml                           # Weekly Snyk scan
```

## Phase 1 Module Activation Map

| Module | Phase 1 Status | Blueprint Service Ref |
|--------|---------------|----------------------|
| `common/` | ✅ Active — guards, interceptors, pipes, middleware | Cross-cutting |
| `auth/` | ✅ Active — register, login, JWT, OAuth stubs | S01 Auth |
| `users/` | ✅ Active — CRUD, profile, roles assignment | S02 Users |
| `gyms/` | ✅ Active — CRUD, basic dashboard | S03 Gyms |
| `roles/` | ✅ Active — RBAC, permission check | Roles & Permissions |
| `notifications/` | ⏳ Stubbed — channel interfaces, no real delivery | S15 Notifications |
| `memberships/` | ❌ Deferred to Sprint 4+ | S04 Membership |
| `bookings/` | ❌ Deferred to Phase 2 | S05 Booking |
| `trainers/` | ❌ Deferred to Phase 2 | S06 Trainer |
| `supplements/` | ❌ Deferred to Phase 2 | S07 Supplements |
| `equipment/` | ❌ Deferred to Phase 2 | S08 Equipment |
| `maintenance/` | ❌ Deferred to Phase 2 | S09 Maintenance |
| `nutrition/` | ❌ Deferred to Phase 2 | S10 Nutrition |
| `workouts/` | ❌ Deferred to Phase 2 | S11 Workouts |
| `biometrics/` | ❌ Deferred to Phase 2 | S12 Biometrics |
| `payments/` | ❌ Deferred to Sprint 4+ | S13 Payment |
| `revenue/` | ❌ Deferred to Phase 2 | S14 Revenue |
| `search/` | ❌ Deferred to Phase 2 | S16 Search |
| `analytics/` | ❌ Deferred to Phase 2 | S17 Analytics |
| `integrations/` | ❌ Deferred to Phase 2 | S18 Integration |
| `ai/` | ❌ Deferred to Phase 3 | S19/S20/S21 AI |
| `staff/` | ❌ Deferred to Phase 2 | S22 Staff |

---

*End of Phase 1 Repository Structure*

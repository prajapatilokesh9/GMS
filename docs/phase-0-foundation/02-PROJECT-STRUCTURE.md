# Phase 0 Foundation — Project Folder Architecture
## Complete Repository Structure

**Reference:** FITCORE PRO BLUEPRINT — Getting Started / Project Structure
**Version:** 1.0 | **Date:** June 2026

---

```
fitcore-pro/
│
├── README.md
├── package.json                          # Root monorepo (workspaces config)
├── turbo.json                            # Turborepo build orchestration
├── .gitignore
├── .env.example
├── docker-compose.yml                    # Local dev: Postgres 16 + Redis 7 + Elasticsearch
├── .editorconfig
├── .prettierrc
├── .eslintrc.js
├── tsconfig.base.json                    # Shared TypeScript config
│
├── apps/
│   ├── backend/                          # NestJS 10+ API Gateway + Services
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   ├── Dockerfile
│   │   ├── .env.local
│   │   ├── src/
│   │   │   ├── main.ts                   # Entry point, bootstrap
│   │   │   ├── app.module.ts             # Root module
│   │   │   ├── common/
│   │   │   │   ├── decorators/           # @CurrentUser, @Roles, @Public
│   │   │   │   ├── guards/              # JwtAuthGuard, RolesGuard, TenantGuard
│   │   │   │   ├── interceptors/        # Logging, Transform, Timeout
│   │   │   │   ├── filters/             # AllExceptionsFilter, HttpExceptionFilter
│   │   │   │   ├── pipes/               # ValidationPipe, ParseIdPipe
│   │   │   │   ├── middleware/          # TenantMiddleware, RateLimitMiddleware
│   │   │   │   ├── dto/                 # Shared DTOs (PaginationDto, ApiResponseDto)
│   │   │   │   ├── interfaces/          # Shared TypeScript interfaces
│   │   │   │   ├── constants/           # App constants, error codes
│   │   │   │   ├── utils/               # Helper functions
│   │   │   │   └── database/
│   │   │   │       ├── prisma/          # Prisma schema, migrations, seeds
│   │   │   │       ├── redis/           # Redis client config, cache service
│   │   │   │       └── clickhouse/      # ClickHouse client config
│   │   │   │
│   │   │   ├── modules/
│   │   │   │   ├── auth/                # S01 — Auth Service
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── strategies/      # JwtStrategy, GoogleStrategy, AppleStrategy
│   │   │   │   │   ├── dto/            # LoginDto, RegisterDto, RefreshTokenDto
│   │   │   │   │   ├── guards/         # LocalAuthGuard, JwtRefreshGuard
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── users/               # S02 — User Service
│   │   │   │   │   ├── users.module.ts
│   │   │   │   │   ├── users.controller.ts
│   │   │   │   │   ├── users.service.ts
│   │   │   │   │   ├── entities/       # User entity class
│   │   │   │   │   ├── dto/            # CreateUserDto, UpdateUserDto
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── gyms/                # S03 — Gym Service
│   │   │   │   │   ├── gyms.module.ts
│   │   │   │   │   ├── gyms.controller.ts
│   │   │   │   │   ├── gyms.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── memberships/         # S04 — Membership Service
│   │   │   │   │   ├── memberships.module.ts
│   │   │   │   │   ├── memberships.controller.ts
│   │   │   │   │   ├── memberships.service.ts
│   │   │   │   │   ├── entities/       # MembershipPlan, Membership entities
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── bookings/            # S05 — Booking Service
│   │   │   │   │   ├── bookings.module.ts
│   │   │   │   │   ├── bookings.controller.ts
│   │   │   │   │   ├── bookings.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── trainers/            # S06 — Trainer Service
│   │   │   │   │   ├── trainers.module.ts
│   │   │   │   │   ├── trainers.controller.ts
│   │   │   │   │   ├── trainers.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── supplements/         # S07 — Supplement Marketplace Service
│   │   │   │   │   ├── supplements.module.ts
│   │   │   │   │   ├── supplements.controller.ts
│   │   │   │   │   ├── supplements.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── equipment/           # S08 — Equipment Service
│   │   │   │   │   ├── equipment.module.ts
│   │   │   │   │   ├── equipment.controller.ts
│   │   │   │   │   ├── equipment.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── maintenance/         # S09 — Maintenance Service
│   │   │   │   │   ├── maintenance.module.ts
│   │   │   │   │   ├── maintenance.controller.ts
│   │   │   │   │   ├── maintenance.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── nutrition/           # S10 — Nutrition Service
│   │   │   │   │   ├── nutrition.module.ts
│   │   │   │   │   ├── nutrition.controller.ts
│   │   │   │   │   ├── nutrition.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── workouts/            # S11 — Workout Service
│   │   │   │   │   ├── workouts.module.ts
│   │   │   │   │   ├── workouts.controller.ts
│   │   │   │   │   ├── workouts.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── biometrics/          # S12 — Biometrics Service
│   │   │   │   │   ├── biometrics.module.ts
│   │   │   │   │   ├── biometrics.controller.ts
│   │   │   │   │   ├── biometrics.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── payments/            # S13 — Payment Service
│   │   │   │   │   ├── payments.module.ts
│   │   │   │   │   ├── payments.controller.ts
│   │   │   │   │   ├── payments.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── gateways/        # RazorpayGateway, StripeGateway
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── revenue/             # S14 — Revenue Engine Service
│   │   │   │   │   ├── revenue.module.ts
│   │   │   │   │   ├── revenue.controller.ts
│   │   │   │   │   ├── revenue.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── notifications/       # S15 — Notification Service
│   │   │   │   │   ├── notifications.module.ts
│   │   │   │   │   ├── notifications.controller.ts
│   │   │   │   │   ├── notifications.service.ts
│   │   │   │   │   ├── channels/        # SmsChannel, EmailChannel, PushChannel
│   │   │   │   │   ├── templates/       # Notification templates
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── search/              # S16 — Search & Discovery Service
│   │   │   │   │   ├── search.module.ts
│   │   │   │   │   ├── search.controller.ts
│   │   │   │   │   ├── search.service.ts
│   │   │   │   │   ├── indices/         # Elasticsearch index mappings
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── analytics/           # S17 — Analytics Service
│   │   │   │   │   ├── analytics.module.ts
│   │   │   │   │   ├── analytics.controller.ts
│   │   │   │   │   ├── analytics.service.ts
│   │   │   │   │   ├── queries/         # ClickHouse SQL queries
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── integrations/        # S18 — Integration Service
│   │   │   │   │   ├── integrations.module.ts
│   │   │   │   │   ├── integrations.controller.ts
│   │   │   │   │   ├── integrations.service.ts
│   │   │   │   │   ├── adapters/        # GMBAdapter, HealthAdapter, CalendarAdapter
│   │   │   │   │   └── tests/
│   │   │   │   │
│   │   │   │   ├── ai/                  # S19/S20/S21 — AI Service Client (calls Python)
│   │   │   │   │   ├── ai.module.ts
│   │   │   │   │   ├── ai.service.ts    # HTTP client to Python FastAPI
│   │   │   │   │   └── dto/
│   │   │   │   │
│   │   │   │   └── staff/               # S22 — Staff Operations Service
│   │   │   │       ├── staff.module.ts
│   │   │   │       ├── staff.controller.ts
│   │   │   │       ├── staff.service.ts
│   │   │   │       ├── entities/
│   │   │   │       ├── dto/
│   │   │   │       └── tests/
│   │   │   │
│   │   │   └── events/                  # Event definitions & handlers
│   │   │       ├── producers/           # BullMQ/Kafka event producers
│   │   │       ├── consumers/           # BullMQ/Kafka event consumers
│   │   │       └── interfaces/          # Event type definitions
│   │   │
│   │   ├── test/
│   │   │   ├── unit/                    # Unit tests (mirrors src structure)
│   │   │   ├── integration/             # Integration tests
│   │   │   └── e2e/                     # End-to-end API tests
│   │   │
│   │   └── prisma/
│   │       ├── schema.prisma            # Master database schema
│   │       ├── migrations/              # Auto-generated migrations
│   │       └── seed.ts                  # Seeder: demo data for all roles
│   │
│   ├── web/                             # Next.js 14+ Web Application
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── next.config.js
│   │   ├── Dockerfile
│   │   ├── .env.local
│   │   ├── app/                         # App Router (Next.js 14)
│   │   │   ├── layout.tsx               # Root layout
│   │   │   ├── page.tsx                 # Landing page (fitness discovery)
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── forgot-password/
│   │   │   │   └── oauth-callback/
│   │   │   ├── (marketing)/
│   │   │   │   ├── page.tsx             # Public landing
│   │   │   │   ├── features/
│   │   │   │   ├── pricing/
│   │   │   │   └── contact/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout-dashboard.tsx
│   │   │   │   ├── gym-owner/           # Role-specific dashboards
│   │   │   │   ├── trainer/
│   │   │   │   ├── customer/
│   │   │   │   ├── nutritionist/
│   │   │   │   ├── supplement-company/
│   │   │   │   ├── equipment-manufacturer/
│   │   │   │   ├── maintenance-provider/
│   │   │   │   └── company-staff/
│   │   │   ├── gyms/                    # Public gym discovery (SEO)
│   │   │   │   ├── page.tsx             # Search results
│   │   │   │   └── [city]/
│   │   │   │       └── [slug]/          # Gym profile page
│   │   │   ├── trainers/
│   │   │   │   └── [id]/
│   │   │   ├── supplements/
│   │   │   │   └── [id]/
│   │   │   └── api/                     # Next.js API routes (BFF layer)
│   │   │       ├── auth/
│   │   │       └── proxy/
│   │   ├── components/
│   │   │   ├── ui/                      # Shared UI components
│   │   │   │   ├── Button/
│   │   │   │   ├── Card/
│   │   │   │   ├── Modal/
│   │   │   │   ├── DataTable/
│   │   │   │   ├── Chart/
│   │   │   │   ├── Map/
│   │   │   │   └── FileUpload/
│   │   │   ├── layout/
│   │   │   │   ├── Header/
│   │   │   │   ├── Sidebar/
│   │   │   │   └── Footer/
│   │   │   ├── forms/                   # Form components per module
│   │   │   └── widgets/                 # Dashboard widgets
│   │   ├── hooks/                       # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── usePermissions.ts
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useGeolocation.ts
│   │   │   └── ...
│   │   ├── lib/                         # Utilities
│   │   │   ├── api-client.ts            # Axios instance with auth interceptor
│   │   │   ├── auth-utils.ts
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   ├── stores/                      # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── gymStore.ts
│   │   │   └── uiStore.ts
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── public/
│   │   │   ├── images/
│   │   │   └── locales/                 # i18n JSON files
│   │   └── test/
│   │
│   ├── mobile/                          # React Native / Expo App
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── app.json
│   │   ├── babel.config.js
│   │   ├── app/                         # Expo Router (file-based)
│   │   │   ├── _layout.tsx              # Root layout with auth guard
│   │   │   ├── index.tsx                # Splash / redirect
│   │   │   ├── (auth)/
│   │   │   │   ├── login.tsx
│   │   │   │   ├── register.tsx
│   │   │   │   └── forgot-password.tsx
│   │   │   ├── (tabs)/                  # Bottom tab navigation
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── discover/
│   │   │   │   ├── workouts/
│   │   │   │   ├── nutrition/
│   │   │   │   ├── community/
│   │   │   │   └── profile/
│   │   │   ├── gym/
│   │   │   │   ├── [gymId]/
│   │   │   │   ├── scanner.tsx          # QR/NFC entry scanner
│   │   │   │   └── membership.tsx
│   │   │   ├── trainer/
│   │   │   │   ├── [trainerId]/
│   │   │   │   └── booking.tsx
│   │   │   ├── supplements/
│   │   │   │   ├── index.tsx
│   │   │   │   └── [productId].tsx
│   │   │   ├── nutrition/
│   │   │   │   ├── diet-plan.tsx
│   │   │   │   └── food-log.tsx
│   │   │   ├── notifications/
│   │   │   └── settings/
│   │   ├── components/
│   │   │   ├── ui/                      # Mobile-specific UI components
│   │   │   ├── gym/
│   │   │   ├── trainer/
│   │   │   ├── workout/
│   │   │   └── charts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── stores/
│   │   ├── assets/
│   │   ├── native/                      # Native module wrappers
│   │   │   ├── BiometricScanner/
│   │   │   └── HealthSync/
│   │   └── test/
│   │
│   └── admin/                           # React Admin Portal (company staff)
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── pages/
│       │   │   ├── Dashboard/
│       │   │   ├── Gyms/
│       │   │   ├── Trainers/
│       │   │   ├── Payments/
│       │   │   ├── Support/
│       │   │   ├── Users/
│       │   │   ├── Reports/
│       │   │   ├── Settings/
│       │   │   └── Audit/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── lib/
│       │   └── stores/
│       └── Dockerfile
│
├── services/                            # Standalone microservices
│   ├── ai-ml/                           # Python FastAPI AI/ML Service
│   │   ├── main.py                      # FastAPI entry point
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── churn.py             # POST /predict/churn
│   │   │   │   ├── recommendations.py   # POST /recommend/workout, /recommend/diet
│   │   │   │   ├── offers.py            # POST /generate/offer
│   │   │   │   └── health.py
│   │   │   ├── models/
│   │   │   │   ├── churn_model.py       # XGBoost classifier
│   │   │   │   ├── recommender.py       # Collaborative filtering
│   │   │   │   ├── diet_llm.py          # LLM-based diet generation
│   │   │   │   └── offer_optimizer.py   # Bayesian optimization
│   │   │   ├── schemas/
│   │   │   │   └── ...                  # Pydantic models
│   │   │   ├── services/
│   │   │   ├── training/
│   │   │   │   ├── train_churn.py       # Training pipeline
│   │   │   │   └── train_recommender.py
│   │   │   └── config.py
│   │   ├── tests/
│   │   └── models_storage/              # Trained model artifacts (.pkl)
│   │
│   └── biometric/                       # Biometric Device Gateway
│       ├── package.json
│       ├── src/
│       │   ├── main.ts                  # Express/Fastify gateway
│       │   ├── adapters/
│       │   │   ├── suprema.adapter.ts
│       │   │   ├── zkteco.adapter.ts
│       │   ├── hikvision.adapter.ts
│       │   ├── router.ts
│       │   └── types.ts
│       └── Dockerfile
│
├── packages/                            # Shared packages (monorepo)
│   ├── shared-types/                    # Shared TypeScript types/contracts
│   │   ├── package.json
│   │   └── src/
│   │       ├── interfaces/
│   │       ├── enums/
│   │       ├── dto/
│   │       └── constants/
│   ├── ui-kit/                          # Shared React component library
│   │   ├── package.json
│   │   └── src/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── styles/
│   └── config/                          # Shared ESLint, TSConfig, etc.
│
├── infrastructure/
│   ├── k8s/                             # Kubernetes manifests
│   │   ├── namespaces/
│   │   ├── backend/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── hpa.yaml
│   │   ├── postgres/
│   │   │   ├── statefulset.yaml
│   │   │   └── service.yaml
│   │   ├── redis/
│   │   ├── elasticsearch/
│   │   ├── clickhouse/
│   │   ├── ai-ml/
│   │   ├── ingress/
│   │   │   ├── ingress.yaml
│   │   │   └── tls.yaml
│   │   ├── monitoring/
│   │   │   ├── prometheus/
│   │   │   └── grafana/
│   │   └── configmaps/
│   │
│   ├── terraform/                       # Infrastructure as Code (AWS)
│   │   ├── main.tf                      # Root config
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── modules/
│   │   │   ├── vpc/
│   │   │   ├── rds/                     # PostgreSQL RDS
│   │   │   ├── elasticache/             # Redis cluster
│   │   │   ├── eks/                     # EKS cluster
│   │   │   ├── ecr/                     # Container registry
│   │   │   ├── s3/
│   │   │   └── cloudfront/
│   │   └── environments/
│   │       ├── dev/
│   │       ├── staging/
│   │       └── prod/
│   │
│   ├── docker-compose.yml               # Full local stack
│   ├── docker-compose.services.yml       # Additional services (ES, ClickHouse)
│   └── scripts/
│       ├── setup-dev.sh
│       ├── migrate.sh
│       ├── seed.sh
│       └── backup.sh
│
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── CONTRIBUTING.md
│   ├── phase-0-foundation/
│   │   ├── 01-SYSTEM-DECOMPOSITION.md
│   │   ├── 02-PROJECT-STRUCTURE.md
│   │   ├── 03-DATABASE-DESIGN.md
│   │   ├── 04-OPENAPI-SPEC.md
│   │   ├── 05-EVENT-ARCHITECTURE.md
│   │   ├── 06-ROLE-MATRIX.md
│   │   ├── 07-SCREEN-INVENTORY.md
│   │   ├── 08-PHASE1-BACKLOG.md
│   │   ├── 09-INFRASTRUCTURE-DEPS.md
│   │   └── 10-EXECUTION-PLAN.md
│   ├── architecture/
│   ├── database/
│   ├── api/
│   ├── events/
│   ├── roles/
│   ├── screens/
│   ├── backlog/
│   ├── infrastructure/
│   └── execution-plan/
│
├── scripts/
│   ├── seed-data/
│   ├── migration-rollback/
│   └── data-export/
│
└── .github/
    ├── workflows/
    │   ├── ci.yml                        # PR checks: lint, test, build
    │   ├── cd-staging.yml                # Deploy to staging
    │   ├── cd-production.yml             # Deploy to production
    │   └── security-scan.yml             # Snyk/dependency scan (weekly)
    ├── CODEOWNERS
    └── PULL_REQUEST_TEMPLATE.md
```

---

## KEY ARCHITECTURAL DECISIONS

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Monorepo** | Turborepo + npm workspaces | Shared types, single version, unified CI |
| **Backend framework** | NestJS 10+ (modular monolith → microservices) | DI, guards, interceptors; can split later |
| **Database per service** | Shared PostgreSQL with RLS (Phase 1-3); split in Phase 4 | Faster development, RLS provides isolation |
| **API gateway** | Kong / AWS API Gateway (Phase 1: Express Gateway) | Rate limiting, auth, routing, logging |
| **Frontend framework** | Next.js 14+ (App Router) | SSR for SEO, ISR for gym pages, API routes as BFF |
| **Mobile framework** | React Native + Expo | Single codebase, OTA updates, EAS Build |
| **Real-time** | Socket.io (Phase 1: polling → Phase 2: WebSocket) | Ease of implementation, fallback to polling |
| **Message queue** | BullMQ (Redis) → Kafka (Phase 4) | Familiarity, reliability; Kafka for scale |
| **AI/ML** | Python FastAPI microservice | Python ecosystem for ML; FastAPI for async |

---

*End of Document — Project Folder Architecture v1.0*

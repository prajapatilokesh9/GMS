# Phase 1 — Sprint Breakdown with Story Estimates

**Reference:** FITCORE PRO BLUEPRINT — Development Roadmap Phase 1  
**Scope:** 12 scope items as approved (Monorepo → Environment & Deployment)  
**Pacing:** 2-week sprints (2 sprints = 4 weeks total for Phase 1 foundation)  
**Team:** 6 people (1 PM, 1 Designer, 2 Backend, 2 Frontend)  
**Velocity target:** 25-30 points per sprint

---

## Sprint 1: Foundation & Database (Weeks 1-2)

**Blueprint scope items:** 1, 2, 3, 4, 5  
**Theme:** Get the monorepo, infrastructure, database, and core API framework running

| # | Story | Points | Owner | Acceptance Criteria | Blueprint Ref |
|---|-------|--------|-------|-------------------|---------------|
| 1.1 | Initialize monorepo with Turborepo, npm workspaces, shared TypeScript config | 3 | Backend Lead | `npm run build` completes; shared tsconfig works; packages/* importable | Project Structure |
| 1.2 | Docker Compose: PostgreSQL 16 + Redis 7 + health checks | 3 | DevOps | `docker-compose up` starts both services; `pg_isready` and `redis-cli ping` pass | Infra Setup |
| 1.3 | Initialize NestJS backend app with all common modules (guards, interceptors, filters, pipes, middleware) | 5 | Backend 1 | NestJS app boots at :3000; JwtAuthGuard, RolesGuard, TenantMiddleware functional; PrismaModule connects to DB | Core API Framework |
| 1.4 | Create Prisma schema with 8 tables (tenants, users, roles, user_roles, permissions, role_permissions, gyms, audit_logs) | 5 | Backend 2 | `npx prisma generate` succeeds; all 8 tables created; foreign keys valid; indexes present | Database + Prisma |
| 1.5 | Run initial Prisma migration + seed script (roles, permissions, demo tenant, admin user) | 3 | Backend 2 | `prisma migrate dev` succeeds; seeds produce 9 roles, 102 permissions, 1 admin user, 1 demo tenant | DB Core |
| 1.6 | Set up GitHub Actions CI pipeline (lint → typecheck → test → build) | 3 | DevOps | PR triggers CI; all steps pass within 7 min; artifacts available | CI/CD |
| 1.7 | Configure ESLint + Prettier + Husky (pre-commit hooks) | 2 | Backend Lead | `git commit` triggers lint-staged; code formatted on save | Dev Setup |
| 1.8 | Create shared-types package with User, Gym, Auth interfaces and enums | 3 | Backend 1 | Backend and web can import shared types; `npm run build` on packages works | Shared Packages |
| 1.9 | Set up Redis module in backend (Redis service, connection config, health check endpoint) | 3 | Backend 2 | Redis ping succeeds; `GET/SET` works from NestJS service | Event Infrastructure |

**Sprint 1 Total:** 30 points

### Sprint 1 Dependencies
```
1.1 (monorepo) ─► 1.3 (NestJS) ─► 1.4 (Prisma) ─► 1.5 (migrate + seed)
                                                      │
1.2 (Docker) ────────────────────────────────────────┘
1.6 (CI/CD) ─► depends on 1.1, 1.3 (for build)
1.7 (lint) ─► depends on 1.1
1.8 (types) ─► depends on 1.1
1.9 (Redis) ─► depends on 1.2, 1.3
```

### Sprint 1 Exit Criteria
- [ ] `docker-compose up` runs PostgreSQL + Redis locally
- [ ] NestJS app starts on :3000 with all common modules loaded
- [ ] Prisma migration creates all 8 tables with indexes
- [ ] Seed script inserts 9 roles, 102 permissions, 1 tenant, 1 admin user
- [ ] GitHub Actions CI passes (lint → typecheck → test → build) on PR
- [ ] Redis client from NestJS can set/get values
- [ ] All 6 team members can run the full stack locally

---

## Sprint 2: Auth, RBAC, Multi-tenancy, Gym Foundation (Weeks 3-4)

**Blueprint scope items:** 6, 7, 8, 9, 10, 11, 12  
**Theme:** Authentication, user management, tenant isolation, gym onboarding, event infrastructure, deployment

| # | Story | Points | Owner | Acceptance Criteria | Blueprint Ref |
|---|-------|--------|-------|-------------------|---------------|
| 2.1 | Implement auth module: register (email + password), login, JWT issuance, refresh token | 8 | Backend 1 | POST /auth/register creates user; POST /auth/login returns JWT; refresh-token works; password bcrypt hashed | Auth Module |
| 2.2 | Implement JWT strategy + JwtAuthGuard + CurrentUser decorator | 5 | Backend 1 | Protected routes reject unauthenticated; @CurrentUser returns user payload | Auth Guards |
| 2.3 | Implement RolesGuard + Roles decorator + permissions check | 5 | Backend 2 | @Roles('gym_owner') blocks non-gym-owner; RBAC check uses DB permissions | RBAC Foundation |
| 2.4 | Implement TenantMiddleware: extract tenant_id from JWT, set PostgreSQL session variable | 3 | Backend 2 | RLS policies on users/gyms enforce tenant isolation; cross-tenant queries return empty | Multi-tenancy |
| 2.5 | Implement user registration endpoint with role assignment | 5 | Backend 1 | POST /auth/register with role creates user + user_role; validation of unique email/phone | User Registration |
| 2.6 | Implement gym CRUD module: create, read, update, delete, slug generation | 8 | Backend 2 | POST /gyms creates gym; GET /gyms/{id} returns detail; slug auto-generated; owner_id set | Gym Onboarding |
| 2.7 | Set up BullMQ event bus: EventBusModule, BaseEvent interface, producer + consumer pattern | 5 | Backend 1 | Event producer emits to queue; consumer receives and processes; retry policy works | Event Infrastructure |
| 2.8 | Implement auth event producers (user.registered, user.logged_in) + stub consumer | 3 | Backend 1 | `user.registered` event emitted on signup; consumer logs receipt | Event + Auth |
| 2.9 | Set up staging deployment: AWS ECR → ECS Fargate (backend), RDS, Redis, CloudFlare DNS | 5 | DevOps | `cd-staging.yml` deploys backend to staging; health endpoint responds 200 | Environment + Deployment |
| 2.10 | Set up log aggregation (CloudWatch) + error tracking (Sentry) + health check endpoints | 3 | DevOps | `/health` returns DB + Redis status; Sentry captures uncaught exceptions | Environment |
| 2.11 | Implement basic notification channel interfaces (SMS/Email/Push stubs — no real delivery) | 3 | Backend 2 | NotificationService dispatches to channel stubs; logs what would be sent | Notification Infra |
| 2.12 | Create basic web app (Next.js): login page, register page, dashboard stub | 5 | Frontend Web | Pages render; login form calls /auth/login; token stored in cookie/httpOnly; dashboard redirects | Web App |
| 2.13 | Add forgot password + reset password endpoints + email stub | 3 | Backend 1 | POST /auth/forgot-password generates token; POST /auth/reset-password updates hash | Auth |

**Sprint 2 Total:** 61 points

### Sprint 2 Dependencies
```
2.1 (auth) ─► 2.2 (JWT guard) ─► 2.4 (tenant middleware)
                                      │
2.5 (register + role) ─► depends on 2.1, 2.3 (roles)
2.6 (gym CRUD) ─► depends on 2.2, 2.4
2.7 (BullMQ) ─► depends on 1.9 (Redis)
2.8 (auth events) ─► depends on 2.1, 2.7
2.9 (deploy) ─► depends on all Sprint 1 + 2.1, 2.6
2.12 (web) ─► depends on 2.1, 2.2
```

### Sprint 2 Exit Criteria
- [ ] User registration + login returns JWT token
- [ ] Role-based access control blocks unauthorised requests
- [ ] Multi-tenancy RLS prevents cross-tenant data access (verified via test)
- [ ] Gym CRUD endpoints functional with auto-slug and owner assignment
- [ ] BullMQ event bus: producer emits event, consumer receives it
- [ ] Staging environment: backend accessible via `https://api-staging.fitcore.app`
- [ ] Health endpoint checks: DB connected, Redis connected
- [ ] Web app: login/register pages functional
- [ ] Forgot/reset password flow functional (email stubbed)

---

## Sprint 3: Integration, Testing & Pilot Readiness (Weeks 5-6) — If needed

*Note: Sprint 3 is included as a buffer/quality sprint. If Sprint 1-2 velocity exceeds target, this sprint can be used for early Phase 1 business features (memberships, payments). If velocity is lower, it provides catch-up capacity.*

**Blueprint scope items:** Quality, security, documentation, pilot preparation

| # | Story | Points | Owner | Acceptance Criteria | Blueprint Ref |
|---|-------|--------|-------|-------------------|---------------|
| 3.1 | Integration tests for auth, RBAC, multi-tenancy, gym CRUD | 8 | Backend 1+2 | 30+ integration tests covering: register, login, RBAC denial, cross-tenant blocking, gym CRUD | Test Coverage |
| 3.2 | E2E test: register → login → create gym → view gym | 5 | Frontend + Backend | Playwright/Cypress test covers critical path end-to-end | E2E |
| 3.3 | Security audit: OWASP Top 10 scan, dependency vulnerability scan (Snyk) | 3 | DevOps | No critical vulnerabilities; medium/high documented with remediation plan | Security |
| 3.4 | API documentation (Swagger/OpenAPI auto-generated from NestJS decorators) | 3 | Backend Lead | Swagger UI at /docs; all Phase 1 endpoints documented | Documentation |
| 3.5 | Performance baseline: k6 test on auth + gym endpoints (50 concurrent users) | 3 | DevOps | Auth <500ms p95, Gym CRUD <300ms p95; report generated | Performance |
| 3.6 | Developer documentation: README, local setup guide, contributing guide | 3 | All | New developer can set up and run the entire stack in <30 min following docs | Documentation |
| 3.7 | Pilot gym onboarding preparation: seed scripts, admin panel for gym management | 5 | Backend + Frontend | 3 demo gyms seeded; admin can view gym list, create gym, verify tenant isolation | Pilot Ready |

**Sprint 3 Total:** 30 points

---

## Summary: Phase 1 Story Points

| Sprint | Points | Blueprint Scope Items |
|--------|--------|----------------------|
| Sprint 1 | 30 | 1, 2, 3, 4, 5 |
| Sprint 2 | 61 | 6, 7, 8, 9, 10, 11, 12 |
| Sprint 3 | 30 | Quality, Security, Documentation, Pilot |
| **Total** | **121** | **All 12 scope items** |

### Risk Buffer

| Risk | Buffer Action |
|------|--------------|
| Sprint 1 velocity <25 points | Extend Sprint 1 by 1 week; compress Sprint 3 |
| Razorpay/RDIS/other integration complexity | Not in Phase 1 scope — deferred to Sprint 4+ |
| Team member unavailability | Cross-training on Sprint 1 items 1.3, 1.4, 1.6 (shared ownership) |
| AWS account provisioning delays | Start Docker-based dev immediately; Terraform in parallel |

---

*End of Phase 1 Sprint Breakdown*

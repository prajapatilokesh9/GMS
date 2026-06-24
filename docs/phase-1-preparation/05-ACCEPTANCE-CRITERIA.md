# Phase 1 — Acceptance Criteria Mapped to Blueprint Requirements

**Reference:** FITCORE PRO BLUEPRINT — Phase 1 (Months 2-4), System Architecture, Database Design  
**Phase 1 scope:** 12 approved items (Monorepo → Environment & Deployment)  
**Gate:** Approval required before Phase 2 begins

---

## Acceptance Criteria Matrix

Each acceptance criterion maps to:
- **Blueprint Section** — Where the requirement originates
- **Phase 1 Scope Item** — Which of the 12 approved items it belongs to
- **Verification Method** — How compliance is demonstrated
- **Sprint** — Which sprint delivers it

---

### 1. Monorepo Setup

| # | Acceptance Criterion | Blueprint Section | Scope Item | Verification | Sprint |
|---|---------------------|-------------------|------------|--------------|--------|
| AC1 | Turborepo pipeline builds all workspaces with `npm run build` | Getting Started, Project Structure | 1 | CI pipeline passes; `turbo run build` succeeds | 1 |
| AC2 | Shared TypeScript config extends across all packages | Project Structure | 1 | `tsconfig.base.json` imported by apps/backend, apps/web | 1 |
| AC3 | Shared types package exports User, Gym, Auth interfaces | Shared Packages | 1 | Web imports `@fitcore/shared-types` and TypeScript compiles | 1 |
| AC4 | ESLint + Prettier enforce code style on pre-commit | Dev Tools | 1 | `git commit` triggers lint-staged; inconsistent formatting blocked | 1 |

### 2. Docker Environment

| # | Acceptance Criterion | Blueprint Section | Scope Item | Verification | Sprint |
|---|---------------------|-------------------|------------|--------------|--------|
| AC5 | `docker-compose up` starts PostgreSQL 16 + Redis 7 | Getting Started | 2 | Both containers running; ports 5432, 6379 accessible | 1 |
| AC6 | PostgreSQL database `fitcore_dev` created with PostGIS extension | Infra Setup | 2 | `psql -c "\dx"` lists postgis extension | 1 |
| AC7 | Redis health check passes from NestJS | Redis | 2 | `redis.ping()` returns `PONG` | 1 |
| AC8 | Docker volumes persist data across container restarts | Infra Setup | 2 | Data survives `docker-compose down && docker-compose up` | 1 |

### 3. CI/CD Pipeline

| # | Acceptance Criterion | Blueprint Section | Scope Item | Verification | Sprint |
|---|---------------------|-------------------|------------|--------------|--------|
| AC9 | CI pipeline runs on PR: lint → typecheck → test → build | DevOps/GitHub Actions | 3 | GitHub Actions shows green check on PR | 1 |
| AC10 | CI completes within 10 minutes | DevOps | 3 | Workflow runtime <10min (timed) | 1 |
| AC11 | Docker image built and pushed to ECR in CI | Infrastructure | 3 | ECR repository has tagged image after merge | 2 |
| AC12 | CD pipeline deploys to staging on merge to main | DevOps | 3 | Staging URL responds 200 after merge | 2 |
| AC13 | Security scan (Snyk) runs weekly, no critical vulnerabilities | Security & Compliance | 3 | Snyk report in CI artifacts; zero critical findings | 3 |

### 4. Core Database Implementation

| # | Acceptance Criterion | Blueprint Section | Scope Item | Verification | Sprint |
|---|---------------------|-------------------|------------|--------------|--------|
| AC14 | All 8 Phase 1 tables created with correct columns and types | Database Schema | 4 | `\dt` shows: tenants, users, roles, user_roles, permissions, role_permissions, gyms, audit_logs | 1 |
| AC15 | All foreign key constraints enforced | DB Schema | 4 | `\d+ users` shows FK to tenants; `\d+ gyms` shows FK to users, tenants | 1 |
| AC16 | Indexes match Phase 0 design (23 indexes across 8 tables) | DB Design | 4 | `SELECT * FROM pg_indexes` — count >= 23 | 1 |
| AC17 | JSONB columns for operating_hours, amenities | DB Schema | 4 | `\d+ gyms` shows `operating_hours jsonb`, `amenities text[]` | 1 |
| AC18 | Citext extension enabled for email lookups | DB Schema | 4 | Test: `SELECT 'Test@Email.com'::citext = 'test@email.com'` returns true | 1 |

### 5. Prisma Schema and Migrations

| # | Acceptance Criterion | Blueprint Section | Scope Item | Verification | Sprint |
|---|---------------------|-------------------|------------|--------------|--------|
| AC19 | `npx prisma generate` produces valid TypeScript client | ORM (Prisma) | 5 | TypeScript compiles with PrismaClient import | 1 |
| AC20 | Initial migration creates all 8 tables | Migrations | 5 | Migration folder created; `prisma migrate status` shows "Database up to date" | 1 |
| AC21 | Seed script populates: 1 tenant, 9 roles, 102 permissions, role-permission associations, 1 admin user | Seed Data | 5 | `SELECT count(*) FROM roles` = 9; admin user can login | 1 |
| AC22 | Rollback migration works: `prisma migrate reset` + `prisma migrate dev` | Migrations | 5 | Database drops and recreates; seed re-runs successfully | 1 |
| AC23 | Prisma client generated in CI build step | CI/CD | 5 | CI build logs show `prisma generate` execution | 1 |

### 6. Authentication and RBAC Foundation

| # | Acceptance Criterion | Blueprint Section | Scope Item | Verification | Sprint |
|---|---------------------|-------------------|------------|--------------|--------|
| AC24 | JWT strategy configured with RS256 signing (or HMAC fallback) | Auth Service | 6 | JWT verified with public key; token contains sub, tenant_id, roles | 2 |
| AC25 | POST /auth/register creates user with validated email, password hash (bcrypt, 12 rounds) | API Design | 6 | `password_hash` in DB starts with `$2b$12$`; duplicate email returns 409 | 2 |
| AC26 | POST /auth/login returns access_token (24h) + refresh_token (30d) | API Design | 6 | Both tokens present in response; refresh-token endpoint returns new access | 2 |
| AC27 | JwtAuthGuard rejects requests without valid token | API Guards | 6 | Protected endpoint without token returns 401 | 2 |
| AC28 | RolesGuard + @Roles decorator enforces role check | RBAC | 6 | `@Roles('gym_owner')` endpoint returns 403 for customer role | 2 |
| AC29 | Permissions check honours role_permissions mapping | RBAC | 6 | User with `gym:create` permission can create gym; user without gets 403 | 2 |

### 7. Multi-Tenant Architecture

| # | Acceptance Criterion | Blueprint Section | Scope Item | Verification | Sprint |
|---|---------------------|-------------------|------------|--------------|--------|
| AC30 | TenantMiddleware extracts tenant_id from JWT | System Architecture | 7 | `app.current_tenant_id` set in PostgreSQL session variable | 2 |
| AC31 | RLS policy on `users` table restricts to current tenant | Data Layer/RLS | 7 | User from tenant A cannot see users from tenant B | 2 |
| AC32 | RLS policy on `gyms` table restricts to current tenant | Data Layer/RLS | 7 | Gym from tenant A not visible to tenant B API calls | 2 |
| AC33 | Super admin bypass: `current_setting('app.current_user_role') = 'super_admin'` skips RLS | RBAC | 7 | Super admin sees all tenants' data | 2 |
| AC34 | New users are auto-associated with creator's tenant on registration | Tenant Isolation | 7 | Register always sets `tenant_id = current_tenant_id` from JWT context | 2 |
| AC35 | Cross-tenant API call returns empty result (not 500 error) | Security | 7 | Test: Tenant A admin requests `GET /gyms/tenant-b-id` returns empty | 2 |

### 8. User Registration and Login

| # | Acceptance Criterion | Blueprint Section | Scope Item | Verification | Sprint |
|---|---------------------|-------------------|------------|--------------|--------|
| AC36 | Registration accepts: email, password, first_name, last_name, phone, role | API Design | 8 | POST /auth/register with valid payload creates user | 2 |
| AC37 | Google OAuth login flow (redirect → callback → JWT issuance) | Auth (OAuth) | 8 | Google OAuth callback returns JWT; user created if new | 2 |
| AC38 | Apple OAuth login flow (same pattern) | Auth (OAuth) | 8 | Apple OAuth callback returns JWT | 2 |
| AC39 | Forgot password: email with reset link; reset: new password hashed and saved | Auth | 8 | POST /auth/forgot-password creates reset_token; POST /auth/reset/TOKEN updates hash | 2 |
| AC40 | Login validates active status; suspended users get 403 | Auth | 8 | User with `status = 'suspended'` cannot login | 2 |
| AC41 | Rate limiting on login endpoint: 5 attempts/min per IP | Security | 8 | 6th login attempt in 1 minute returns 429 | 2 |

### 9. Gym Onboarding Foundation

| # | Acceptance Criterion | Blueprint Section | Scope Item | Verification | Sprint |
|---|---------------------|-------------------|------------|--------------|--------|
| AC42 | POST /gyms creates gym with: name, owner_id, tenant_id, auto-slug | API Design | 9 | Created gym has unique slug based on name | 2 |
| AC43 | GET /gyms/{id} returns full gym profile (fields per blueprint) | API Design | 9 | Response includes all gym columns (address, hours, branding, amenities) | 2 |
| AC44 | PUT /gyms/{id} updates gym; only owner or super admin can update | RBAC | 9 | Other user gets 403 on update attempt | 2 |
| AC45 | GET /gyms lists gyms for current tenant with pagination | API Design | 9 | `GET /gyms?page=1&limit=10` returns paginated results | 2 |
| AC46 | Operating hours stored as JSONB; validated structure on save | DB Schema | 9 | Save `{"monday":"06:00-22:00"}`; invalid format returns 422 | 2 |
| AC47 | Gym features flags default to false: biometric, supplement, equipment | DB Schema | 9 | New gym has `biometric_enabled = false` | 2 |

### 10. Core API Framework

| # | Acceptance Criterion | Blueprint Section | Scope Item | Verification | Sprint |
|---|---------------------|-------------------|------------|--------------|--------|
| AC48 | Consistent response format: `{ success, data, message, timestamp, request_id }` | API Design Patterns | 10 | All endpoints return this structure | 1 |
| AC49 | Standard error format: `{ success, error: { code, message, details } }` | API Design Patterns | 10 | Validation errors return 422 with field-level `details` | 1 |
| AC50 | Global exception filter catches unhandled errors, returns 500 | Interceptors | 10 | Unhandled error → 500 response with `INTERNAL_ERROR` code | 1 |
| AC51 | ValidationPipe (Zod or class-validator) validates all inputs | Pipes | 10 | Invalid DTO returns 422 with field errors | 1 |
| AC52 | Pagination pattern: `page`, `limit`, `total`, `total_pages`, `has_next`, `has_prev` | Pagination | 10 | GET /gyms?page=2 returns correct pagination metadata | 1 |
| AC53 | Logging interceptor logs: method, url, status, duration | Interceptors | 10 | Console/CloudWatch shows `POST /auth/login 200 45ms` | 1 |
| AC54 | Transform interceptor wraps all `data` in standard response | Interceptors | 10 | Raw `{ id: 1 }` from controller becomes `{ success: true, data: { id: 1 }, ... }` | 1 |

### 11. Event Infrastructure Foundation

| # | Acceptance Criterion | Blueprint Section | Scope Item | Verification | Sprint |
|---|---------------------|-------------------|------------|--------------|--------|
| AC55 | BullMQ queue processor registered and connected to Redis | Event Architecture | 11 | Queue worker starts on app boot; Redis connection verified | 2 |
| AC56 | BaseEvent interface with: event_id, event_name, version, producer, timestamp, tenant_id, correlation_id | Event Schema | 11 | Events conform to BaseEvent interface | 2 |
| AC57 | Event producer emits `user.registered` after registration | Auth Events | 11 | BullMQ queue shows 1 message after new registration | 2 |
| AC58 | Event consumer receives and logs `user.registered` events | Event Consumers | 11 | Consumer logs: "Processing user.registered for user_id X" | 2 |
| AC59 | Failed events retry with exponential backoff (3 retries: 30s, 2min, 5min) | Retry Policy | 11 | Force consumer failure → verify 3 retries → DLQ | 2 |
| AC60 | Dead-letter queue captures events that exhaust retries | DLQ | 11 | Failed event appears in DLQ after 3 retries | 2 |

### 12. Environment and Deployment Setup

| # | Acceptance Criterion | Blueprint Section | Scope Item | Verification | Sprint |
|---|---------------------|-------------------|------------|--------------|--------|
| AC61 | Staging environment: `https://api-staging.fitcore.app` responds 200 | Infrastructure | 12 | DNS resolves; SSL valid; health endpoint returns all services OK | 2 |
| AC62 | RDS PostgreSQL accessible from ECS; connection pool configured (10 connections) | Database | 12 | `prisma db push` works from staging ECS | 2 |
| AC63 | Redis accessible from ECS on port 6379 | Cache | 12 | BullMQ processes jobs; Redis ping succeeds | 2 |
| AC64 | Sentry error tracking: unhandled errors appear in Sentry dashboard | Monitoring | 12 | Throw test error → appears in Sentry within 2 min | 2 |
| AC65 | CloudWatch logs: backend logs stream to `/ecs/backend` | Monitoring | 12 | Log group exists and streams startup logs | 2 |
| AC66 | Secrets stored in AWS Secrets Manager (not in code or env files) | Security | 12 | DATABASE_URL, JWT_PRIVATE_KEY, RAZORPAY_KEY in Secrets Manager | 2 |
| AC67 | Health endpoint `/health` returns: `{ status: "ok", db: "connected", redis: "connected", uptime: X }` | API | 12 | Health endpoint available without auth | 2 |
| AC68 | Rate limiting at API Gateway: 100 req/min per IP for public endpoints | Security | 12 | Exceed 100 requests in 1 min → 429 response | 2 |
| AC69 | CloudFlare CDN configured: static assets cached; WAF enabled | CDN | 12 | `curl -I https://api-staging.fitcore.app` shows `cf-cache-status` header | 2 |

---

## Phase 1 Exit Criteria (Gate to Phase 2)

| # | Criterion | Minimum Threshold | Verified By |
|---|----------|-------------------|-------------|
| G1 | All 69 acceptance criteria met | 100% | Tech Lead + QA |
| G2 | No critical or high-severity security vulnerabilities | 0 | Snyk + OWASP scan |
| G3 | CI/CD pipeline green for 7 consecutive days | 100% passes | GitHub Actions |
| G4 | Multi-tenancy isolation verified via automated test | 0 cross-tenant leaks | Integration test |
| G5 | JWT auth + RBAC verified via automated test suite | 100% coverage | Integration test |
| G6 | API p95 response time <500ms under 50 concurrent users | <500ms | k6 load test |
| G7 | Local dev setup documented; new dev can run stack in <30 min | 100% | Dev onboarding test |
| G8 | Phase 2 backlog prepared and estimated | Approved | PM + Tech Lead |

---

## Blueprint Mapping Summary

| Blueprint Phase 1 Deliverable | Phase 1 Scope Item | Acceptance Criteria |
|------------------------------|-------------------|-------------------|
| Authentication System | 6, 8 | AC24-AC41 |
| Gym Management (basic) | 9 | AC42-AC47 |
| Membership & Billing | Deferred to Sprint 4+ | — |
| Customer App | Deferred to Sprint 4+ | — |
| Notifications (infra only) | 11 | AC55-AC60 |
| Analytics (basic) | Deferred to Sprint 4+ | — |
| Mobile App | Deferred to Sprint 4+ | — |
| **Foundation (this Phase 1)** | **1-12** | **AC1-AC69** |

---

*End of Phase 1 Acceptance Criteria*

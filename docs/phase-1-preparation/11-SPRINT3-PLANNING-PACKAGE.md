# Sprint 3 — Planning Package

**Based on:** FITCORE PRO BLUEPRINT — Phase 1, Sprint 3 (Buffer/Hardening)  
**Duration:** 2 weeks (Sprint 3 of 3 — final Phase 1 sprint)  
**Capacity:** 6-person team (1 PM, 1 Designer, 2 Backend, 2 Frontend), target velocity 25-35 points  
**Status:** PLANNED — PENDING REVIEW

---

## 1. Sprint 3 Objectives

1. Deploy Phase 1 to staging AWS environment (Epic E1 — deferred from Sprint 2)
2. Achieve Phase 1 closure quality bar via E2E tests, security audit, and performance baseline
3. Complete remaining infrastructure (CloudWatch dashboards, DLQ for event bus)
4. Prepare pilot-readiness: admin gym management, demo data, onboarding guide
5. Document developer setup, contributing guide, and architecture overview
6. Resolve remaining low-severity deviations (DLQ, gym rate limiting, KYC endpoints)
7. Close Phase 1 with all gate criteria satisfied

---

## 2. Remaining Phase 1 Deliverables

| # | Deliverable | Description | Blueprint Reference | Sprint 2 Status |
|---|-------------|-------------|-------------------|-----------------|
| D1 | AWS Staging Deployment | ECR → ECS Fargate, RDS PostgreSQL, ElastiCache Redis, ALB+SSL, CloudFront, Route53, GitHub Actions CD | Environment & Deployment | **DEFERRED** |
| D2 | E2E Test Suite | Playwright/Cypress: register → login → create gym → view gym | Test Coverage | **MISSING** |
| D3 | Security Audit | OWASP Top 10 scan, Snyk dependency vulnerability scan | Security & Compliance | **MISSING** |
| D4 | Performance Baseline | k6 test on auth + gym endpoints (50 concurrent users) | Performance | **MISSING** |
| D5 | Developer Documentation | README, local setup guide, contributing guide, architecture doc | Documentation | **MISSING** |
| D6 | Pilot Gym Onboarding Prep | 3 demo gyms seeded, admin gym management UI, tenant isolation verification | Pilot Ready | **MISSING** |
| D7 | CloudWatch Dashboards & Alerts | Dashboard with key metrics, CPU/memory alerts | Monitoring | **PARTIAL** |
| D8 | Event Dead-Letter Queue | DLQ for events exhausting retries, manual reprocessing mechanism | Event Architecture | **MISSING** |
| D9 | Gym Endpoint Rate Limiting | Rate limiting on gym POST/PATCH endpoints | Security | **MISSING** |
| D10 | Enhanced API Documentation | Request/response examples, auth flows documented, Postman collection | Documentation | **PARTIAL** |
| D11 | Phase 1 Closure Report | Final gate report, completion matrix, handover to Phase 2 | Governance | **MISSING** |

---

## 3. Story Estimates

### Epic E1: Staging Deployment (10 points)

| # | Story | Points | Owner | Acceptance Criteria | Blueprint Ref |
|---|-------|--------|-------|-------------------|---------------|
| E1.1 | Create AWS ECR repository + push backend Docker image via GitHub Actions | 2 | DevOps | `docker build` succeeds in CI; image pushed to `ECR:latest` on main merge | Infra |
| E1.2 | Terraform: ECS Fargate service with ALB, SSL certificate, health check | 3 | DevOps | `terraform apply` creates ECS cluster; `https://api-staging.fitcore.app/health` returns 200 | Infra |
| E1.3 | Terraform: RDS PostgreSQL (db.t4g.small, 20GB) with automated backups | 2 | DevOps | `psql` from ECS connects to RDS; automated backups enabled (7-day retention) | Infra |
| E1.4 | Terraform: ElastiCache Redis (cache.t4g.small, cluster mode disabled) | 2 | DevOps | Redis ping succeeds from ECS; BullMQ processes jobs | Infra |
| E1.5 | CD workflow: `cd-staging.yml` — migrate DB, seed, deploy ECS, smoke test | 1 | DevOps | Merge to main deploys to staging; smoke test runs and passes | CI/CD |

### Epic E2: Quality & Hardening (12 points)

| # | Story | Points | Owner | Acceptance Criteria | Blueprint Ref |
|---|-------|--------|-------|-------------------|---------------|
| E2.1 | E2E test: register → login → create gym → view gym (Playwright) | 5 | Backend + Frontend | Playwright test runs in CI; covers critical user path; screenshots captured on failure | Test Coverage |
| E2.2 | Security audit: dependency vulnerability scan (Snyk/npm audit) + OWASP Top 10 | 3 | DevOps | `snyk test` in CI; zero critical vulns; medium/high documented with remediation plan; OWASP checklist completed | Security |
| E2.3 | Performance baseline: k6 test on auth (login, register) + gym (create, list) endpoints | 3 | DevOps | Auth <500ms p95, Gym <300ms p95 under 50 concurrent users; report generated | Performance |
| E2.4 | Implement event dead-letter queue for all 4 BullMQ queues | 1 | Backend 1 | Failed jobs after 3 retries move to DLQ; DLQ jobs can be re-queued via admin endpoint | Event Architecture |

### Epic E3: Documentation & Onboarding (6 points)

| # | Story | Points | Owner | Acceptance Criteria | Blueprint Ref |
|---|-------|--------|-------|-------------------|---------------|
| E3.1 | Developer documentation: README, local setup, contributing guide | 3 | Backend Lead | New developer can set up and run full stack in <30 min following docs; `README.md` at repo root | Documentation |
| E3.2 | Architecture documentation: system context, container diagram (C4), API flow diagrams | 2 | Backend Lead + Designer | C4 diagrams added to `docs/architecture/`; API flow documented for auth, gym onboarding | Documentation |
| E3.3 | Postman/Thunder Client collection for all Phase 1 endpoints | 1 | Backend 2 | Collection exported to `docs/phase-1-preparation/fitcore-phase-1.postman_collection.json` | Documentation |

### Epic E4: Pilot Readiness (8 points)

| # | Story | Points | Owner | Acceptance Criteria | Blueprint Ref |
|---|-------|--------|-------|-------------------|---------------|
| E4.1 | Pilot seed data: 3 demo gyms with documents, staff, varied onboarding statuses | 2 | Backend 2 | Seed script creates 3 gyms across 2 tenants; one fully verified, one pending, one rejected | Pilot Ready |
| E4.2 | Admin gym management UI: gym list with onboarding status filter, verify/reject actions | 3 | Frontend | Admin can view all gyms, filter by status, click verify/reject; status changes reflected in real time | Pilot Ready |
| E4.3 | Add gym-scoped rate limiting (100 req/min per gym per IP on POST/PATCH gym endpoints) | 2 | Backend 1 | Rate limiter applied to all gym mutation routes; configurable via env var | Security |
| E4.4 | Document status update in admin UI (approve/reject documents with reason) | 1 | Frontend | Admin can approve/reject gym documents; reason field shown on rejection | Pilot Ready |

### Epic E5: Phase 1 Closure (6 points)

| # | Story | Points | Owner | Acceptance Criteria | Blueprint Ref |
|---|-------|--------|-------|-------------------|---------------|
| E5.1 | CloudWatch dashboard: request count, error rate, p50/p95/p99 latency, DB connections, Redis hit rate | 2 | DevOps | Dashboard URL works; widgets show real-time data; auto-refresh enabled | Monitoring |
| E5.2 | CloudWatch alarms: 5xx error rate >1% (5min), CPU >80% (5min), DB connections >80% (5min) | 1 | DevOps | Alarms trigger SNS notification; OK/ALARM state transitions logged | Monitoring |
| E5.3 | Phase 1 gate report and closure checklist | 2 | Tech Lead | All Phase 1 ACs verified; deviations documented; handover to Phase 2 prepared | Governance |
| E5.4 | Phase 2 backlog grooming: stories estimated, acceptance criteria drafted, sprint 4 plan | 1 | PM + Tech Lead | Phase 2 Sprint 4 stories estimated (20-30 pts); risks identified | Governance |

**Sprint 3 Total:** 42 points

---

## 4. Acceptance Criteria

| # | Criterion | Epic | Verification Method |
|---|-----------|------|-------------------|
| AC-S3-01 | Staging URL `https://api-staging.fitcore.app/health` returns 200 with DB + Redis connected | E1 | curl/staging health check |
| AC-S3-02 | GitHub Actions CD deploys backend to ECS on merge to main | E1 | Merge PR → verify new task in ECS; health endpoint responds |
| AC-S3-03 | E2E test passes: register → login → create gym → view gym | E2 | Playwright test passing in CI |
| AC-S3-04 | Zero critical or high-severity vulnerabilities in dependencies | E2 | Snyk/npm audit report shows 0 critical, 0 high |
| AC-S3-05 | Auth endpoints p95 <500ms under 50 concurrent users | E2 | k6 report generated; thresholds met |
| AC-S3-06 | Gym CRUD endpoints p95 <300ms under 50 concurrent users | E2 | k6 report generated; thresholds met |
| AC-S3-07 | DLQ captures events after 3 retries; admin can re-queue DLQ jobs | E2 | Force consumer failure → verify 3 retries → DLQ → re-queue via API |
| AC-S3-08 | New developer can set up and run full stack in <30 min following README | E3 | Fresh macOS/Linux/Windows setup timed; all steps documented |
| AC-S3-09 | C4 diagrams cover system context + containers | E3 | Diagrams reviewed and accurate |
| AC-S3-10 | 3 demo gyms seeded with varying onboarding statuses | E4 | `SELECT status, count(*) FROM gyms` returns expected distribution |
| AC-S3-11 | Admin UI: gym list with status filter + verify/reject actions | E4 | Manual QA: admin can filter, verify, reject gyms |
| AC-S3-12 | Gym POST/PATCH endpoints return 429 when rate limit exceeded | E4 | curl 101 requests in 1 min → 101st returns 429 |
| AC-S3-13 | CloudWatch dashboard renders with 6+ widgets | E5 | Dashboard URL accessible; widgets show data |
| AC-S3-14 | CloudWatch alarms fire on error rate threshold breach | E5 | Trigger test error → alarm state changes to ALARM |
| AC-S3-15 | Phase 1 closure report submitted and approved | E5 | All gate criteria met; Phase 2 Sprint 4 planned |

---

## 5. Dependencies on Sprint 2

| Sprint 3 Epic | Depends On Sprint 2 Deliverable | Risk if Unstable |
|--------------|--------------------------------|------------------|
| Staging Deployment (E1) | All Sprint 1 + Sprint 2 modules (auth, gyms, events, notifications) | Build fails on staging; migration fails |
| Quality & Hardening (E2) | Auth module, Gym module, Event bus, Web frontend | E2E test breaks; performance baseline inaccurate |
| Documentation & Onboarding (E3) | All modules stable and documented | Docs out of date before publication |
| Pilot Readiness (E4) | Gym onboarding, Staff management, Document workflow | Admin gym mgmt UI broken; seed data incomplete |
| Phase 1 Closure (E5) | All Phase 1 deliverables | Cannot close Phase 1 |

### Critical Path
```
E1.1 (ECR) → E1.2 (ECS + ALB) → E1.3 (RDS) → E1.4 (Redis) → E1.5 (CD)
                                                              │
E2.1 (E2E tests) ─── does not depend on staging ─────────────┤
E2.2 (Security) ─── can run locally ─────────────────────────┤
E4.1 (Seed) ─────────────────────────────────────────────────┤
E4.2 (Admin UI) ─── depends on E4.1 (seed data) ─────────────┤
E3.1 (Dev docs) ─── can run in parallel ──────────────────────┘
```

**The non-blocking path (E2, E3, E4 components that don't require staging) can proceed in parallel with E1.**

---

## 6. Risks and Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | AWS account provisioning delays | Medium | High (blocks E1) | Use Terraform config prepared in advance; manual account setup as fallback; local docker-compose for remaining testing |
| R2 | E2E test flakiness in CI | Medium | Medium | Retry strategy (3 attempts); screenshots on failure; run in Docker container for consistency |
| R3 | Security audit reveals critical vulnerabilities | Medium | High | Fix before Phase 1 closure; dependency updates prioritised; documented exceptions with mitigation |
| R4 | Performance baseline below threshold | Low | Medium | Identify bottleneck; optimise query/index; defer optimisation to Phase 2 if minor |
| R5 | Team unavailability (end of Phase 1) | Medium | Medium | Cross-training on Sprint 2 modules; documentation reduces bus factor |
| R6 | DLQ implementation scope creep | Low | Low | Minimal viable DLQ: queue option only; no dashboard or UI in Phase 1 |
| R7 | Staging deployment cost exceeds budget | Low | Medium | RDS db.t4g.micro as cheapest option; Redis serverless; ECS Fargate smallest task size; monitor spend |

---

## 7. Blueprint Mapping

| Blueprint Section | Sprint 3 Coverage | Delivered By | Deferred? |
|------------------|-------------------|-------------|-----------|
| **Infrastructure** | AWS ECR, ECS Fargate, RDS, ElastiCache, ALB, CD pipeline | E1.1-E1.5 | — |
| **Security & Compliance** | Dependency scan, OWASP Top 10, rate limiting on gym endpoints | E2.2, E4.3 | — |
| **Performance** | k6 baseline on auth + gym endpoints | E2.3 | — |
| **Test Coverage** | E2E test: critical user path | E2.1 | — |
| **Event Architecture** | Dead-letter queue for all event queues | E2.4 | — |
| **Monitoring** | CloudWatch dashboard, alarms, SNS notifications | E5.1, E5.2 | — |
| **Documentation** | README, local setup, contributing guide, architecture diagrams, Postman collection | E3.1-E3.3 | — |
| **Pilot Readiness** | Seed gyms, admin gym management UI, demo data | E4.1, E4.2 | — |
| **Governance** | Phase 1 closure report, Phase 2 backlog | E5.3, E5.4 | — |
| Real Notification Delivery | — | — | Phase 2 Sprint 4 |
| OAuth (Google/Apple) | — | — | Phase 2 Sprint 4 |
| Membership Plans | — | — | Phase 2 Sprint 4 |
| Trainer Management | — | — | Phase 2 Sprint 5 |
| Mobile App | — | — | Phase 3 |

### Sprint 1-3 Blueprint Coverage Summary

| Blueprint Requirement | Sprint 1 | Sprint 2 | Sprint 3 | Post-Phase 1 |
|----------------------|----------|----------|----------|--------------|
| Monorepo Setup | ✅ Complete | — | — | — |
| Docker Environment | ✅ Complete | — | — | — |
| CI/CD Pipeline | ✅ Basic | — | ✅ Staging CD | — |
| Core Database (8 tables) | ✅ Complete | ✅ 4 new tables | — | — |
| Prisma Schema + Migrations | ✅ Initial | ✅ Sprint 2 migration | — | — |
| Seed Data | ✅ 9 roles, 21 perms | ✅ 5 roles, 14 perms, templates | ✅ 3 pilot gyms | — |
| Auth: Register/Login | ✅ Complete | — | — | — |
| Auth: JWT + Guards | ✅ Complete | — | — | — |
| Auth: Password Reset | — | ✅ Complete | — | — |
| Auth: Login History | — | ✅ Complete | — | — |
| Auth: Rate Limiting | — | ✅ Login | ✅ Gym endpoints | — |
| Auth: OAuth (Google/Apple) | — | — | — | Phase 2 |
| RBAC + Permissions | ✅ Complete | ✅ Gym verify authZ | — | — |
| Multi-tenancy (RLS) | ✅ Complete | — | — | — |
| Gym CRUD | ✅ Complete | — | — | — |
| Gym Onboarding: Documents | — | ✅ Complete | — | — |
| Gym Onboarding: Verification | — | ✅ Complete | — | — |
| Gym Staff Management | — | ✅ Complete | — | — |
| Notification Infrastructure | — | ✅ Stubs | — | Phase 2 |
| Event Bus (BullMQ) | ✅ Basic | ✅ 10 events + consumers | ✅ DLQ | — |
| CloudWatch Monitoring | — | ✅ Basic | ✅ Dashboard + alerts | — |
| Sentry Error Tracking | — | ✅ Complete | — | — |
| API Documentation (Swagger) | — | ✅ Complete | ✅ Postman collection | — |
| Web Frontend | — | ✅ Auth + dashboard + gym pages | ✅ Admin gym UI | — |
| Staging Deployment (AWS) | — | ❌ Deferred | ✅ Planned | — |
| E2E Tests | — | — | ✅ Planned | — |
| Security Audit | — | — | ✅ Planned | — |
| Performance Baseline | — | — | ✅ Planned | — |
| Developer Documentation | — | — | ✅ Planned | — |
| Pilot Readiness | — | — | ✅ Planned | — |
| Memberships & Billing | — | — | — | Phase 2 |
| Payments (Razorpay) | — | — | — | Phase 2 |
| Trainer Management | — | — | — | Phase 2 |
| Mobile App | — | — | — | Phase 3 |

---

## 8. Definition of Done for Phase 1 Closure

All of the following must be satisfied before Phase 1 is considered closed:

### Code Quality
- [ ] `pnpm run build` succeeds for all workspaces (backend + frontend)
- [ ] `pnpm run test` passes — 50+ tests across unit, integration, validation
- [ ] TypeScript strict mode — zero type errors
- [ ] ESLint passes — zero warnings
- [ ] No `any` type usage without documented justification
- [ ] All console.log / debug code removed (use structured logging)

### Infrastructure
- [ ] Staging environment accessible via HTTPS
- [ ] Health endpoint reports database + Redis as connected
- [ ] Database migration applied and verified
- [ ] CD pipeline deploys on merge to main
- [ ] CloudWatch logs streaming from ECS

### Security
- [ ] Zero critical or high-severity dependency vulnerabilities
- [ ] Rate limiting on login endpoint (5/min per IP)
- [ ] Rate limiting on gym mutation endpoints (100/min per gym per IP)
- [ ] JWT access tokens expire within configured duration
- [ ] Password reset tokens expire after 1 hour
- [ ] Multi-tenancy RLS policies in place

### Testing
- [ ] Integration tests cover auth, gym, document, staff flows (21+ tests)
- [ ] E2E test covers critical user path (register → login → create gym)
- [ ] Performance baseline reported (p95 <500ms auth, <300ms gym CRUD)
- [ ] 100% of AC69 Phase 1 acceptance criteria met or explicitly deferred

### Documentation
- [ ] README with local setup instructions
- [ ] Contributing guide
- [ ] Architecture documentation (C4 context + container diagrams)
- [ ] API documentation accessible via Swagger UI + Postman collection
- [ ] Sprint 3 gate report completed

### Phase 2 Readiness
- [ ] Phase 2 Sprint 4 backlog estimated and reviewed
- [ ] Migration debt assessment: zero additive-migration-only changes required
- [ ] Deferred tables (16) still aligned with Phase 2 schedule
- [ ] Notification interfaces frozen for Phase 2 consumption

---

## 9. Story Point Summary

| Epic | Points | % of Sprint 3 |
|------|--------|---------------|
| E1: Staging Deployment | 10 | 24% |
| E2: Quality & Hardening | 12 | 29% |
| E3: Documentation & Onboarding | 6 | 14% |
| E4: Pilot Readiness | 8 | 19% |
| E5: Phase 1 Closure | 6 | 14% |
| **Total** | **42** | **100%** |

*Note: 42 points is aggressive for a 6-person team at 25-35 velocity. Prioritisation order: E1 > E2 > E4 > E5 > E3. If velocity is insufficient, reduce E3 (Postman collection, C4 diagrams) and defer to Phase 2.*

---

## 10. Phase 1 Completion Matrix

| Scope Item | Sprint 1 | Sprint 2 | Sprint 3 | Status |
|-----------|----------|----------|----------|--------|
| 1. Monorepo Setup | ✅ Delivered | — | — | **COMPLETE** |
| 2. Docker Environment | ✅ Delivered | — | — | **COMPLETE** |
| 3. CI/CD Pipeline | ✅ Lint+typecheck+test+build | — | ✅ Staging CD | **PARTIAL** (staging CD in S3) |
| 4. Core Database (8+ tables) | ✅ 8 tables | ✅ +4 tables (12 total) | — | **COMPLETE** |
| 5. Prisma + Migrations + Seed | ✅ Initial schema + seed | ✅ Sprint 2 migration + seed | ✅ Pilot gym seed | **COMPLETE** |
| 6. Auth + RBAC | ✅ Register, login, JWT, guards | ✅ Password reset, profile, login history | — | **COMPLETE** |
| 7. Multi-tenancy | ✅ RLS, tenant middleware | — | — | **COMPLETE** |
| 8. User Registration | ✅ Core | ✅ Enhancements | — | **COMPLETE** |
| 9. Gym Onboarding | ✅ CRUD | ✅ Documents, verify, staff | ✅ Admin UI, gym rate limiting | **COMPLETE** |
| 10. Core API Framework | ✅ Response format, errors, pagination | — | — | **COMPLETE** |
| 11. Event Infrastructure | ✅ BullMQ, BaseEvent | ✅ 10 event contracts, consumers | ✅ DLQ | **COMPLETE** |
| 12. Environment & Deployment | — | ❌ Deferred | ✅ Planned | **IN PROGRESS (Sprint 3)** |

### Phase 1 Key Metrics

| Metric | Current | Sprint 3 Target |
|--------|---------|-----------------|
| Total tests | 51 passing (6 suites) | 60+ (incl. E2E) |
| Total backend source files | 61 | 65 |
| Total frontend pages | 8 | 10 (add admin gym mgmt) |
| Prisma models | 12 | 12 (no new models) |
| API endpoints | ~42 | ~48 |
| Event types | 11 | 11 (+ DLQ infrastructure) |
| Deferred tables | 16 | 16 (no change) |

---

## 11. Remaining Open Technical Debt

Below is every known technical debt item carried forward from Sprint 1-2 into Sprint 3 and beyond:

| # | Item | Category | Sprint 3 Plan | Ultimate Resolution |
|---|------|----------|--------------|-------------------|
| TD1 | Redis version 5.0.14.1 vs recommended 6.2.0+ (BullMQ warning) | Infrastructure | Note in staging config: target Redis 7.x | Staging deploys ElastiCache Redis 7.x |
| TD2 | No `super_admin_bypass_user_roles` RLS policy | Security | Add policy | Sprint 3 |
| TD3 | Prisma migration uses `resolve` instead of `migrate dev` (non-interactive workaround) | Dev Workflow | No action; `resolve --applied` is valid | Accept as-is; `migrate dev` used interactively |
| TD4 | Sentry request/error handlers removed (SDK v10 import issue) | Monitoring | Investigate `@sentry/node` v10 API for proper integration | Sprint 3 |
| TD5 | No dead-letter queue for BullMQ event bus | Event Architecture | Implement DLQ | Sprint 3 E2.4 |
| TD6 | File uploads stored locally (uploads/) instead of S3 | Storage Removed | No S3 in Phase 1 scope; document path stored in DB | Phase 2 when S3 available |
| TD7 | Notification channels are stubs (log-only) | Notifications | No change — stubs deliver Phase 2 contract | Phase 2 Sprint 4 |
| TD8 | Missing OAuth (Google/Apple) login flows | Auth | OAuth deferred to Phase 2 | Phase 2 Sprint 4 |
| TD9 | No CI for frontend (only backend) | CI/CD | Add frontend lint + build to GitHub Actions | Sprint 3 (in E1.5 CD prep) |
| TD10 | Rate limiting only on /auth/login, not gym endpoints | Security | Add gym rate limiting | Sprint 3 E4.3 |
| TD11 | KYC route uses generic `PATCH /gyms/:id/verify` instead of dedicated endpoint | API Design | No change — verify endpoint sufficient | Minor; revisit in Phase 2 |
| TD12 | No pagination on gym document list endpoint | API | Add pagination params | Sprint 3 or later |
| TD13 | Staff DELETE route requires userRoleId instead of userId | API Design | Accept current design; userRoleId is correct for role-scoped deletion | Accept as-is |
| TD14 | Seed data uses UUIDs (string) but Prisma models use BigInt autoincrement IDs | Schema | Seed data adapted — no change needed | Accept as-is |

---

## 12. Architecture Drift Report

Comparison of the actual implemented architecture vs the FITCORE PRO Blueprint reference architecture:

### Backend Framework
- **Blueprint:** NestJS
- **Actual:** Express.js (TypeScript) — switched for simplicity and faster iteration
- **Drift:** Moderate (but justified)
- **Impact:** No Phase 2 impact; Express handles all planned loads; migration to NestJS possible but not planned

### Database
- **Blueprint:** PostgreSQL 16 with PostGIS
- **Actual:** PostgreSQL 18 without PostGIS (extension available but not enabled)
- **Drift:** Minor (version higher, PostGIS not used in Phase 1)
- **Impact:** PostGIS can be enabled in Phase 2 without migration

### Event Bus
- **Blueprint:** BullMQ with Redis Streams fallback
- **Actual:** BullMQ only (no Redis Streams fallback)
- **Drift:** Minor (redundant path not implemented)
- **Impact:** Redis is stable; Streams fallback unnecessary in Phase 1

### Authentication
- **Blueprint:** JWT (RS256), OAuth (Google/Apple) as primary login methods
- **Actual:** JWT (HMAC), no OAuth, email/password as primary
- **Drift:** Moderate (RS256 → HMAC, OAuth deferred)
- **Impact:** HMAC acceptable for Phase 1; OAuth will be additive in Phase 2

### Notification System
- **Blueprint:** Real provider integration (AWS SES for email, Twilio for SMS, FCM for push)
- **Actual:** Stub channels with logging
- **Drift:** Significant (by design — Phase 1 scope)
- **Impact:** Interfaces frozen; Phase 2 swaps stubs for real providers

### Monitoring
- **Blueprint:** Datadog APM, full tracing
- **Actual:** CloudWatch logs + metrics, Sentry error tracking
- **Drift:** Moderate (Datadog → CloudWatch + Sentry)
- **Impact:** Acceptable for MVP; Datadog can be added in Phase 2

### CI/CD
- **Blueprint:** GitHub Actions full pipeline with staging + production environments
- **Actual:** GitHub Actions CI (lint → test → build); CD deferred to Sprint 3
- **Drift:** Moderate (CD not yet operational)
- **Impact:** Sprint 3 completes this; no production deployment until Phase 1 close

### Web Frontend
- **Blueprint:** React Native for mobile, Next.js for web admin
- **Actual:** Next.js only (web admin + customer web)
- **Drift:** Moderate (mobile deferred to Phase 3)
- **Impact:** Correct per Phase 1 scope; mobile not in scope

### Multi-tenancy Implementation
- **Blueprint:** Row-Level Security (RLS) at PostgreSQL level + tenant_id column on all tables
- **Actual:** RLS via Prisma + tenant middleware extracting from JWT
- **Drift:** None (fully aligned)
- **Impact:** ✅ Architecture matches blueprint

### API Documentation
- **Blueprint:** OpenAPI 3.0 generated from NestJS decorators
- **Actual:** OpenAPI 3.0 generated from Zod schemas + manual swagger.ts
- **Drift:** Minor (generation approach differs, output compliant)
- **Impact:** OpenAPI spec is standard-compliant; tools (Swagger UI, Postman) work identically

### Drift Summary
| Component | Drift Level | Action Required |
|-----------|-------------|-----------------|
| Backend Framework | Moderate | Document as intentional decision; no migration needed |
| Database | Minor | Enable PostGIS when needed |
| Event Bus | Minor | Accept as-is |
| Authentication | Moderate | OAuth deferred; document as Sprint 2 deviation |
| Notification System | Significant (intentional) | Deferred to Phase 2 by blueprint |
| Monitoring | Moderate | Accept; Datadog upgrade possible |
| CI/CD | Moderate | Sprint 3 completes staging CD |
| Web Frontend | Moderate (intentional) | Mobile deferred to Phase 3 |
| Multi-tenancy | **None** | ✅ Fully aligned |
| API Documentation | Minor | Output is standard-compliant |

---

## 13. Security Review Summary

### Current Security Posture

| Control | Status | Detail |
|---------|--------|--------|
| Password hashing | ✅ Implemented | bcrypt, 12 rounds |
| JWT signing | ✅ Implemented | HMAC with access/refresh pair |
| Token expiry | ✅ Implemented | Access: 15min, Refresh: 7d, Reset: 1h |
| Rate limiting (login) | ✅ Implemented | 5 attempts/min per IP, 429 with Retry-After |
| Rate limiting (gym) | ❌ Missing | Sprint 3 E4.3 |
| Input validation | ✅ Implemented | Zod schemas on all endpoints |
| SQL injection protection | ✅ Built-in | Prisma parameterised queries |
| Multi-tenancy isolation | ✅ Implemented | RLS at database level |
| RBAC | ✅ Implemented | authorize('permission') middleware |
| CORS | ✅ Implemented | Configurable via env |
| HTTPS | ❌ Not yet (local dev) | Sprint 3 deploys with SSL |
| Helmet headers | ❌ Not implemented | Add in Sprint 3 |
| OWASP scan | ❌ Not executed | Sprint 3 E2.2 |
| Dependency vulnerability scan | ❌ Not executed | Sprint 3 E2.2 |
| Secrets management | ⚠️ .env.local | Sprint 3 uses AWS Secrets Manager |
| Audit logging | ✅ Implemented | Login history + audit_logs |
| Failed login recording | ✅ Implemented | Sprint 2 remediation |
| File upload validation | ✅ Implemented | MIME check, 10MB limit (multer) |

### Phase 1 Minimum Security Requirements (for closure)
- ✅ Rate limiting on auth login
- ✅ Password hashing (bcrypt ≥10 rounds)
- ✅ JWT with short expiry
- ✅ Input validation on all endpoints
- ✅ Multi-tenancy RLS
- ✅ Login history tracking
- ❌ Rate limiting on gym endpoints (Sprint 3)
- ❌ Dependency vulnerability scan (Sprint 3)
- ❌ Helmet security headers (Sprint 3)
- ❌ HTTPS (Sprint 3 staging)
- ✅ Failed login recording

---

## 14. Test Coverage Summary

| Test Category | Suite | Tests | Sprint Added | Status |
|--------------|-------|-------|-------------|--------|
| **Unit — Common** | `AppError.test.ts` | 7 | S1 | ✅ Passing |
| **Unit — Common** | `pagination.test.ts` | 7 | S1 | ✅ Passing |
| **Unit — Auth** | `auth.validation.test.ts` | 6 | S1 | ✅ Passing |
| **Unit — Core** | `health.test.ts` | 1 | S1 | ✅ Passing |
| **Validation — Auth** | `sprint2.validation.test.ts` | 6 | S2 | ✅ Passing |
| **Integration** | `sprint2.integration.test.ts` | 21 | S2 (remediated) | ✅ Passing |
| **E2E** | TBD | TBD | S3 | ❌ Planned |
| **Performance** | k6 | TBD | S3 | ❌ Planned |
| **Total (current)** | **6 suites** | **51 tests** | — | **✅ 51/51 passing** |

### Coverage by Module

| Module | Unit/Validation | Integration | E2E |
|--------|---------------|-------------|-----|
| common (AppError, pagination) | ✅ 14 tests | — | — |
| core (app, server, health) | ✅ 1 test | — | — |
| auth (register, login, tokens) | ✅ 6 validation | ✅ 12 tests | ❌ Planned |
| auth-history | — | ✅ 2 tests | — |
| gyms (CRUD, verify, staff) | — | ✅ 5 tests | ❌ Planned |
| gym-documents | — | ✅ 2 tests | — |
| roles | — | ✅ 1 test | — |
| users (profile, change password) | — | ✅ 2 tests | — |

### Coverage Gaps for Sprint 3
- No E2E tests for critical user path
- No performance/load tests
- No security/fuzz tests
- No frontend component or integration tests
- No multi-tenancy cross-tenant isolation test
- No RBAC permission enforcement test for all endpoints

---

## 15. Phase 1 Completion Forecast

```
Phase 1 Timeline:

Sprint 1 (Weeks 1-2):  FOUNDATION          ████████████████████████  COMPLETE ✅
Sprint 2 (Weeks 3-4):  AUTH + GYM + INFRA  ████████████████████████  COMPLETE ✅
Sprint 3 (Weeks 5-6):  HARDENING + PILOT   ████████████████████░░░░  PLANNED

Week:  1  2  3  4  5  6  7  8
       ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
S1:    ████████████████░░░░░░░░░░░░░░░░░░░░  DONE
S2:    ░░░░░░░░░░████████████████░░░░░░░░░░  DONE
S3:    ░░░░░░░░░░░░░░░░░░░░████████████████  PLANNED
P2:    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  STARTS WEEK 7

Phase 1 projected completion: End of Sprint 3 (Week 6)
Phase 2 projected start: Sprint 4 (Week 7)

Total Phase 1 story points delivered: ~72 (S1: 30 + S2: ~42 actual + S3: 25-35 planned)
```

---

## 16. Recommended Sprint 3 Sequence

Based on dependencies, the recommended execution order is:

**Week 1 (Days 1-5):**
- Day 1-2: E1.1 (ECR + Docker image) + E2.2 (Security audit — can run independently)
- Day 2-4: E1.2 + E1.3 + E1.4 (Terraform: ECS, RDS, Redis)
- Day 3-5: E4.1 (Pilot seed data) + E2.4 (DLQ implementation)
- Day 4-5: Start E3.1 (Developer docs — parallel)

**Week 2 (Days 6-10):**
- Day 6-7: E1.5 (CD workflow + smoke test)
- Day 6-8: E4.2 (Admin gym management UI) + E4.3 (Gym rate limiting)
- Day 7-8: E2.1 (E2E Playwright tests)
- Day 8-9: E2.3 (k6 performance baseline)
- Day 9-10: E5.1 + E5.2 (CloudWatch dashboard + alarms)
- Day 10: E5.3 (Phase 1 gate report) + E5.4 (Phase 2 backlog prep)

**Buffer:** 2 days for unplanned work, test flakiness, review cycles.

---

*End of Sprint 3 Planning Package*

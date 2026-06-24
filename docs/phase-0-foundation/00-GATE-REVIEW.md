# Phase 0 Gate Review — Complete Deliverable Assessment

**Project:** FitCore Pro  
**Phase:** 0 — Foundation  
**Gate Review Date:** June 19, 2026  
**Reviewer:** [To be completed by stakeholder]  
**Status:** PENDING APPROVAL

---

## Instructions

Each of the 10 Phase 0 deliverables is reviewed below against six dimensions:

1. **Completion Status** — What was produced, what is missing
2. **Assumptions Made** — Design-time assumptions that may affect later phases
3. **Open Questions** — Items requiring stakeholder decision before Phase 1
4. **Risks Identified** — Technical, business, or process risks specific to this deliverable
5. **Dependencies** — What this deliverable depends on or feeds into
6. **Blueprint Fidelity** — Any deviations from the FITCORE PRO Blueprint

Please review each section and mark your disposition (Approve / Changes Required / Reject) in the sign-off table at the end.

---

## Deliverable 1: System Decomposition into Services/Modules

**File:** `01-SYSTEM-DECOMPOSITION.md` (14KB)

### Completion Status

| Item | Status | Notes |
|------|--------|-------|
| All 22 microservices identified | ✅ Complete | S01-S22 named with responsibilities and owners |
| Service dependency graph | ✅ Complete | Directed graph with inter-service communication lines |
| Module boundaries & communication patterns | ✅ Complete | REST, Pub-Sub, gRPC, WebSocket, Webhook, Batch defined |
| API gateway routing table | ✅ Complete | 22 route patterns mapped to services |
| Service ownership & team alignment | ✅ Complete | Phase 1 headcount mapped (6 people across 5 teams) |
| Database-per-service strategy | ✅ Complete | Shared PostgreSQL with RLS isolation |
| External system integration points | ✅ Complete | 18 external systems mapped with protocol and direction |

### Assumptions Made

| # | Assumption | Impact if Wrong |
|---|-----------|-----------------|
| A1.1 | Shared PostgreSQL with RLS is sufficient for Phase 1-3; splitting into per-service databases can wait until Phase 4 | Cross-service coupling may slow down independent deployments; migration effort to split databases later is significant |
| A1.2 | NestJS modular monolith can be decomposed into standalone microservices later without rewriting | If module boundaries are not cleanly separated at NestJS module level, extraction becomes a rewrite rather than a refactor |
| A1.3 | BullMQ (Redis-based) is adequate as the message broker until Kafka-scale volumes are needed (Phase 4) | If biometric scan events or IoT telemetry volumes exceed Redis throughput, mid-phase migration to Kafka may be required |
| A1.4 | 22 services can be owned by a team of 6 in Phase 1 by using a modular monolith approach rather than deploying 22 separate containers | May create deployment contention if multiple services require simultaneous changes |

### Open Questions

| # | Question | Needs Input From |
|---|----------|-----------------|
| Q1.1 | Should the AI/ML services (S19, S20, S21) be built as a single Python FastAPI app or three separate services in Phase 3? | ML Engineer (to be hired) |
| Q1.2 | Should the Biometric Device Gateway be a separate service or live inside the backend? Current plan: standalone Express/Fastify gateway. | Tech Lead + DevOps |
| Q1.3 | Should we use Kong API Gateway from Phase 1 or start with Express Gateway/NestJS built-in gateway and migrate later? | Tech Lead |
| Q1.4 | What is the SLA expectation for each service tier (Starter/Growth/Pro/Enterprise)? This affects deployment topology and redundancy decisions. | Product / Business |

### Risks Identified

| # | Risk | L | I | Mitigation |
|---|------|---|---|------------|
| R1.1 | Service boundary violations — teams may put logic in wrong service causing future extraction pain | M | H | Rigorous code review; mandatory architecture review for any cross-module dependency; enforce NestJS module boundary rules |
| R1.2 | Redis/BullMQ may become bottleneck before Phase 4 if early traffic exceeds expectations | L | H | Monitor queue depth and latency from Sprint 1; have Kafka plan ready |
| R1.3 | Integration Service (S18) becomes a god service if all external integrations route through it | M | M | Design S18 as a thin router with adapter pattern; each integration adapter is a separate deployable unit |

### Dependencies

| ID | Depends On | Deliverable |
|----|-----------|-------------|
| D1.1 | Blueprint system architecture section | This document |
| D1.2 | Tech stack decisions (NestJS, PostgreSQL, Redis, BullMQ) | This document |
| D1.3 | Feeds into: Project Structure (D2), Infrastructure (D9), Execution Plan (D10) | D2, D9, D10 |

### Blueprint Fidelity

| Aspect | Blueprint | Delivered | Difference |
|--------|-----------|-----------|------------|
| Service count | 22 services implied | 22 services explicitly named and numbered | None |
| AI/ML service structure | "Python FastAPI" | Single service (S19/S20/S21 combined) with separate route modules | Minor — combined for team efficiency; split if scale demands |
| Biometric gateway | Not explicitly listed as separate service | Defined as standalone `services/biometric/` | Enhancement — explicit separation avoids device SDK coupling in main backend |
| Communication patterns | REST, WebSocket, Webhook, Queue | Added gRPC (internal) and Batch (scheduled) | Enhancement — gRPC for high-frequency inter-service lookups; Batch for nightly jobs |

---

## Deliverable 2: Project Folder/Repository Architecture

**File:** `02-PROJECT-STRUCTURE.md` (26KB)

### Completion Status

| Item | Status | Notes |
|------|--------|-------|
| Full monorepo directory tree | ✅ Complete | `apps/`, `services/`, `packages/`, `infrastructure/`, `docs/`, `.github/`, `scripts/` |
| Backend (NestJS) module structure | ✅ Complete | 22 service modules under `src/modules/` each with controller, service, entities, dto, tests |
| Frontend (Next.js) app router structure | ✅ Complete | App router with `(auth)`, `(marketing)`, `(dashboard)` route groups, per-role dashboards |
| Mobile (React Native/Expo) structure | ✅ Complete | Expo Router with `(auth)`, `(tabs)`, detail routes |
| Admin portal structure | ✅ Complete | Vite + React with 11 page directories |
| AI/ML service structure | ✅ Complete | FastAPI with `api/`, `models/`, `schemas/`, `training/` |
| Shared packages | ✅ Complete | `shared-types`, `ui-kit`, `config` |
| Infrastructure directory | ✅ Complete | `k8s/`, `terraform/`, `docker-compose.yml` |
| GitHub workflows | ✅ Complete | CI, CD-staging, CD-production, security-scan |
| List of key architectural decisions (table) | ✅ Complete | 9 decisions with rationale |

### Assumptions Made

| # | Assumption | Impact if Wrong |
|---|-----------|-----------------|
| A2.1 | Monorepo with Turborepo is the right orchestration tool; alternative is Nx | Turborepo is simpler but Nx has better caching; migration possible but overhead |
| A2.2 | Backend modules will not be extracted into separate repositories in Phase 1 | If extraction is needed, the module boundaries and shared types in `packages/` make it feasible |
| A2.3 | Expo managed workflow is sufficient for Phase 1; no native modules beyond what Expo provides | If biometric SDK requires native module (e.g., fingerprint scanner on device), we may need Expo dev client or bare workflow |
| A2.4 | Vercel for Next.js frontend is optional; ECS alternative exists | If Vercel is used, CI/CD and env management differ from ECS; document both paths |

### Open Questions

| # | Question | Needs Input From |
|---|----------|-----------------|
| Q2.1 | Should the admin portal be a separate Vite app or a route within the Next.js app (under `/admin`)? Blueprint says separate, but merging simplifies auth sharing. | Frontend Lead |
| Q2.2 | Should we use `next-intl` or `react-i18next` for i18n? | Frontend Lead |
| Q2.3 | Should the Storybook component library live as a separate app or within the UI kit package? | Designer + Frontend |
| Q2.4 | What is the preferred mobile CI solution — EAS Build (Expo) or GitHub Actions with Fastlane? | DevOps |

### Risks Identified

| # | Risk | L | I | Mitigation |
|---|------|---|---|------------|
| R2.1 | Monorepo build times grow as the codebase expands | M | M | Turborepo caching; potentially migrate to Nx if build >5min |
| R2.2 | Shared types package creates coupling between frontend and backend | M | M | Strict versioning of `shared-types`; breaking changes require coordinated releases |
| R2.3 | Expo managed workflow limitations surface when biometric or health SDKs require native code | M | H | Prototype biometric SDK integration in Phase 1 Sprint 1 to validate; have bare-workflow migration path documented |

### Dependencies

| ID | Depends On | Deliverable |
|----|-----------|-------------|
| D2.1 | System decomposition (D1) — service list | D1 |
| D2.2 | Tech stack decisions from Blueprint | Blueprint |
| D2.3 | Feeds into: Screen inventory (D7), Backlog (D8), Infrastructure (D9) | D7, D8, D9 |

### Blueprint Fidelity

| Aspect | Blueprint | Delivered | Difference |
|--------|-----------|-----------|------------|
| Monorepo tool | Turborepo | Turborepo | None |
| Backend framework | NestJS 10+ | NestJS 10+ | None |
| Project structure | Matches blueprint's "Project Structure" section | Expanded with `services/biometric/`, `packages/ui-kit`, detailed per-module subdirectories | Enhancement — more granular structure than blueprint |
| Mobile | React Native + Expo | React Native + Expo with Expo Router | None — Expo Router is the standard for Expo SDK 50+ |
| Admin portal | Mentioned as secondary | Separate `apps/admin/` with Vite + React | Explicit separation rather than subdirectory |
| Terraform | Mentioned | Terraform modules for VPC, RDS, ElastiCache, EKS, ECR, S3, CloudFront | Enhanced with full environment split (`dev/staging/prod`) |

---

## Deliverable 3: Complete Database Design

**File:** `03-DATABASE-DESIGN.md` (41KB — largest deliverable)

### Completion Status

| Item | Status | Notes |
|------|--------|-------|
| All 21 blueprint tables defined with SQL DDL | ✅ Complete | `tenants`, `users`, `roles`, `user_roles`, `permissions`, `role_permissions`, `gyms`, `membership_plans`, `memberships`, `trainers`, `pt_sessions`, `workouts`, `body_metrics`, `diet_plans`, `food_logs`, `supplements`, `supplement_orders`, `equipment`, `maintenance_jobs`, `payments`, `notifications` |
| Additional tables (beyond blueprint 21) | ✅ Added | `audit_logs`, `ai_recommendations`, `loyalty_points` (3 extra = 24 total) |
| Column-level definitions | ✅ Complete | All columns with data types, constraints, defaults, nullable |
| Index definitions | ✅ Complete | 60+ indexes across all tables (B-tree, GIN, composite, unique, partial) |
| Foreign key relationships | ✅ Complete | All FK constraints with CASCADE rules |
| Multi-tenancy RLS implementation | ✅ Complete | All 19 tenant-scoped tables have RLS policy template |
| RBAC permission matrix | ✅ Complete | 102 permissions × 9 roles table |
| Data scoping rules per role | ✅ Complete | Read/write/delete scope table |
| Entity-relationship diagram (text) | ✅ Complete | ASCII ERD showing parent-child relationships |
| Seed data strategy | ✅ Complete | 9 initial roles, permission seeding approach |
| Compliance schema extensions | ✅ Complete | Data retention, deletion requests |

### Assumptions Made

| # | Assumption | Impact if Wrong |
|---|-----------|-----------------|
| A3.1 | PostgreSQL 16 is the primary database for all transactional data through Phase 4 | If write throughput exceeds PostgreSQL capacity (unlikely at Phase 1 scale), sharding or Citus extension needed |
| A3.2 | JSONB columns for flexible data (features, exercises, macros, etc.) are acceptable — no need for separate tables | Querying nested JSONB at scale may become slow; may need to normalise in Phase 3+ |
| A3.3 | Row-Level Security (RLS) with `app.current_tenant_id` session variable provides adequate tenant isolation | If RLS performance degrades (>100K tenants), consider schema-per-tenant or database-per-tenant |
| A3.4 | BigInt serial primary keys are sufficient for all tables through Phase 5 | At 1B+ rows, some tables may need BigInt → UUID migration; monitor row counts |
| A3.5 | Polymorphic `entity_type`/`entity_id` pattern in `payments` table is acceptable | Reporting queries become complex; may need separate payment tables per entity in Phase 4 |

### Open Questions

| # | Question | Needs Input From |
|---|----------|-----------------|
| Q3.1 | Should we use UUID v7 (time-ordered) instead of BIGSERIAL for primary keys from day 1? UUIDs are better for distributed systems but 2x storage. | Tech Lead |
| Q3.2 | Should we add `soft_delete` column pattern (deleted_at timestamp) to all tables, or rely on `status = deleted` columns? | Tech Lead |
| Q3.3 | Should `audit_logs` capture full old/new values for GDPR compliance, or just action summaries? Full capture increases storage 10x. | Legal / Compliance |
| Q3.4 | Do we need a separate `gym_branches` table, or is a gym self-referential (parent_gym_id) sufficient for franchise management? | Product |
| Q3.5 | Should `loyalty_points` include a running_balance column (denormalised) or always compute from transaction sum? | Backend Lead |

### Risks Identified

| # | Risk | L | I | Mitigation |
|---|------|---|---|------------|
| R3.1 | JSONB query performance degrades as tables grow (workouts.exercises, diet_plans.meals could be large) | M | M | Add GIN indexes; consider normalising exercises and meals into separate tables by Phase 3; monitor query planner |
| R3.2 | Polymorphic `entity_type`/`entity_id` in `payments` table makes referential integrity harder (no FK constraint) | M | M | Application-level validation; consider separate payment tables (membership_payments, order_payments) in Phase 4 |
| R3.3 | The 24-table schema may be over-normalised for Phase 1, slowing initial development | M | L | Acceptable — Prisma migrations make iterative schema changes easy; over-normalised is better than under |
| R3.4 | RLS policy on every query adds query overhead | L | M | Benchmark with and without RLS in Sprint 1; ensure indexes cover RLS-filtered columns (tenant_id) |

### Dependencies

| ID | Depends On | Deliverable |
|----|-----------|-------------|
| D3.1 | Blueprint database schema section (21 tables) | Blueprint |
| D3.2 | Multi-tenancy requirements from Blueprint | Blueprint |
| D3.3 | Feeds into: API spec (D4), Event architecture (D5), Role matrix (D6), Backlog (D8) | D4, D5, D6, D8 |

### Blueprint Fidelity

| Aspect | Blueprint | Delivered | Difference |
|--------|-----------|-----------|------------|
| Core tables | 21 tables | 24 tables | **Added 3 tables:** `audit_logs` (audit trail), `ai_recommendations` (recommendation tracking), `loyalty_points` (gamification). These are mentioned in Blueprint features but not in the schema section. |
| `gyms` table amenities | Not specified | `amenities TEXT[]` column added | Enhancement — needed for gym discovery filtering |
| `supplements` variants | Not specified | `variants JSONB` column added | Enhancement — flavour/size/price variants per product |
| `maintenance_jobs` commission split | Not specified | `commission_technician_percent`, `commission_company_percent`, `commission_platform_percent` | Enhancement — explicit commission split per job |
| `body_metrics` unique constraint | Not specified | `UNIQUE(user_id, recorded_at)` | Enhancement — prevents duplicate entries for same day |
| Index coverage | Minimal examples | 60+ indexes covering all query patterns | Enhancement — production-ready indexing |
| RLS implementation | Mentioned as pattern | Full RLS DDL for all 19 tenant-scoped tables | Enhancement — ready-to-execute |

---

## Deliverable 4: OpenAPI Specification

**File:** `04-OPENAPI-SPEC.md` (25KB)

### Completion Status

| Item | Status | Notes |
|------|--------|-------|
| API overview (base URLs, protocol, auth) | ✅ Complete | Dev/staging/prod endpoints, HTTPS, JWT Bearer |
| Standard headers | ✅ Complete | Request + response headers with rate limit info |
| Standard response formats | ✅ Complete | Success, error, paginated formats with examples |
| Auth service endpoints | ✅ Complete | 9 endpoints (register, login, logout, refresh, OAuth, password reset, me) |
| User service endpoints | ✅ Complete | 11 endpoints |
| Gym service endpoints | ✅ Complete | 19 endpoints |
| Membership service endpoints | ✅ Complete | 13 endpoints |
| Booking/PT session endpoints | ✅ Complete | 13 endpoints |
| Trainer service endpoints | ✅ Complete | 12 endpoints |
| Supplement marketplace endpoints | ✅ Complete | 17 endpoints |
| Equipment service endpoints | ✅ Complete | 13 endpoints |
| Maintenance service endpoints | ✅ Complete | 10 endpoints |
| Nutrition service endpoints | ✅ Complete | 13 endpoints |
| Workout service endpoints | ✅ Complete | 13 endpoints |
| Biometrics service endpoints | ✅ Complete | 10 endpoints |
| Payment service endpoints | ✅ Complete | 11 endpoints |
| Revenue engine endpoints | ✅ Complete | 6 endpoints |
| Notification endpoints | ✅ Complete | 7 endpoints |
| Search & discovery endpoints | ✅ Complete | 6 endpoints |
| Analytics endpoints | ✅ Complete | 10 endpoints |
| Integration service endpoints | ✅ Complete | 11 endpoints |
| AI service endpoints | ✅ Complete | 10 endpoints |
| Staff operations endpoints | ✅ Complete | 12 endpoints |
| Admin endpoints | ✅ Complete | 7 endpoints |
| Webhook receivers | ✅ Complete | 4 inbound webhook paths |
| Error codes catalog | ✅ Complete | 18 standard error codes with HTTP mappings |
| API versioning strategy | ✅ Complete | URL-based versioning, 6-month sunset |

### Assumptions Made

| # | Assumption | Impact if Wrong |
|---|-----------|-----------------|
| A4.1 | All endpoints use JSON request/response bodies — no file upload endpoints are explicitly designed yet | File upload (images, lab reports) will use multipart/form-data; needs endpoint documentation update |
| A4.2 | Pagination uses page/limit model (offset-based) rather than cursor-based | Cursor-based is better for real-time feeds (notifications, activity); may need both |
| A4.3 | Rate limiting at 100 req/min per API key is sufficient for Phase 1 | If a gym syncs thousands of members, may need higher limit; implement configurable per-plan rate limits |
| A4.4 | BFF (Backend-for-Frontend) pattern via Next.js API routes is used for web; mobile calls NestJS directly | If mobile needs BFF as well, need a separate BFF layer |

### Open Questions

| # | Question | Needs Input From |
|---|----------|-----------------|
| Q4.1 | Should API documentation be auto-generated from NestJS Swagger decorators (OpenAPI 3.1) or maintained as a separate spec file? | Tech Lead |
| Q4.2 | Should we version the API in the URL (`/v1/`) or via Accept header (`Accept: application/vnd.fitcore.v1+json`)? | Tech Lead |
| Q4.3 | Should we expose GraphQL for complex queries (dashboard analytics) alongside REST? | Tech Lead + Frontend |
| Q4.4 | Are there any endpoints missing for the Phase 1 MVP? Sprint 1-3 covers auth + gyms + memberships. | PM + Tech Lead |

### Risks Identified

| # | Risk | L | I | Mitigation |
|---|------|---|---|------------|
| R4.1 | 150+ endpoints = significant maintenance burden as API evolves | M | M | Auto-generate spec from NestJS decorators; enforce spec validation in CI |
| R4.2 | No explicit WebSocket event channel documentation (real-time dashboard updates, notifications) | L | M | Socket.io events follow similar pattern but need separate event catalog; add in Phase 1 Sprint 2 |
| R4.3 | Rate limiting may block legitimate batch operations (gym bulk-importing members) | M | M | Implement rate limit tiers; admin/gym_owner roles get higher limits |

### Dependencies

| ID | Depends On | Deliverable |
|----|-----------|-------------|
| D4.1 | Database schema (D3) — entity definitions | D3 |
| D4.2 | Blueprint API Design Patterns section | Blueprint |
| D4.3 | Feeds into: Frontend development, Mobile development, Backend implementation | Phase 1 execution |

### Blueprint Fidelity

| Aspect | Blueprint | Delivered | Difference |
|--------|-----------|-----------|------------|
| Endpoint structure | 20 prefix groups | 22 prefix groups | Added `/v1/admin/*` and `/v1/revenue/*` groups |
| Auth flow | JWT with refresh | Same with explicit refresh-token endpoint | None |
| Error format | Simple example | 18-code catalog with HTTP mappings | Enhancement |
| Pagination | Page/limit example | Same with `has_next`/`has_prev` | None |
| Webhook receivers | Not explicitly listed | 4 webhook paths defined | Enhancement — critical for Razorpay/Stripe integration |
| Rate limiting | Mentioned | 100 req/min public, 1000 internal | Explicit tiers |

---

## Deliverable 5: Event-Driven Architecture Mapping

**File:** `05-EVENT-ARCHITECTURE.md` (19KB)

### Completion Status

| Item | Status | Notes |
|------|--------|-------|
| Event bus architecture diagram | ✅ Complete | ASCII diagram showing producers, consumers, topics |
| Auth & user events | ✅ Complete | 6 events |
| Gym events | ✅ Complete | 5 events |
| Membership events | ✅ Complete | 8 events |
| Booking & PT session events | ✅ Complete | 8 events |
| Payment events | ✅ Complete | 5 events |
| Supplement order events | ✅ Complete | 6 events |
| Equipment & maintenance events | ✅ Complete | 6 events |
| Workout & nutrition events | ✅ Complete | 5 events |
| AI & intelligence events | ✅ Complete | 4 events |
| Notification events | ✅ Complete | 3 events |
| System & analytics events | ✅ Complete | 3 events |
| Scheduled cron jobs | ✅ Complete | 15 cron jobs with schedules |
| Blueprint data flow scenario 1 (join gym) | ✅ Complete | 11-step flow with event annotations |
| Blueprint data flow scenario 2 (supplement recommendation) | ✅ Complete | 12-step flow with event annotations |
| Blueprint data flow scenario 3 (churn prevention) | ✅ Complete | 10-step flow with event annotations |
| Event retry & dead-letter policy | ✅ Complete | 5 scenarios with backoff strategies |
| Event schema standard | ✅ Complete | BaseEvent interface definition |

### Assumptions Made

| # | Assumption | Impact if Wrong |
|---|-----------|-----------------|
| A5.1 | BullMQ (Redis-based) is sufficient for Phase 1-3 event volumes | If events exceed ~10K/sec, Redis may become bottleneck; Kafka migration plan exists for Phase 4 |
| A5.2 | Event schema stays stable once defined for Phase 1; backward-compatible changes only | Breaking event changes require coordinated producer/consumer updates; event versioning in schema mitigates |
| A5.3 | Cron jobs run on a single scheduler instance (BullMQ repeatable jobs); no distributed scheduler needed yet | If cron jobs become critical-path and need high availability, use distributed scheduler (e.g., K8s CronJob) |
| A5.4 | 60 events across 11 categories cover all Phase 1-2 scenarios | Missing events will be added as new features are developed; event catalog is living document |

### Open Questions

| # | Question | Needs Input From |
|---|----------|-----------------|
| Q5.1 | Should events be strongly-typed schemas (Avro/Protobuf) or simple JSON? Strong typing adds complexity but enables schema registry. | Tech Lead |
| Q5.2 | Should we implement Saga pattern for distributed transactions (e.g., payment → membership → notification rollback)? | Tech Lead |
| Q5.3 | What is the retention policy for consumed events? Debugging requires replay capability. | DevOps |
| Q5.4 | Who owns the event schema registry and enforces backward compatibility? | Tech Lead |

### Risks Identified

| # | Risk | L | I | Mitigation |
|---|------|---|---|------------|
| R5.1 | Event-driven flow debugging is harder than synchronous flow (especially churn prevention — 10 steps) | M | M | Implement OpenTelemetry tracing with correlation IDs across all events; ensure all events carry `correlation_id` |
| R5.2 | Cron job schedule conflicts or overlaps (e.g., churn-prediction-batch at 02:00 and offer-generation-batch at 03:00 may overlap if first runs long) | L | M | Separate cron jobs by at least 1 hour; monitor execution time; use BullMQ job deduplication |
| R5.3 | Eventually consistent flows may cause UX issues (user pays but membership not active for 2-3 seconds) | M | M | Optimistic UI update on frontend; payment callback waits for membership confirmation via WebSocket |

### Dependencies

| ID | Depends On | Deliverable |
|----|-----------|-------------|
| D5.1 | System decomposition (D1) — service boundaries | D1 |
| D5.2 | Database schema (D3) — entity references in payloads | D3 |
| D5.3 | Blueprint data flow examples (3 scenarios) | Blueprint |
| D5.4 | Feeds into: Backend implementation — event producers/consumers code | Phase 1 Sprints 3-6 |

### Blueprint Fidelity

| Aspect | Blueprint | Delivered | Difference |
|--------|-----------|-----------|------------|
| Data flows | 3 scenarios described in text | 3 scenarios with explicit event names, producer, consumer, step-by-step | Enhanced — full traceability |
| Events | Referenced but not enumerated | 60 events across 11 categories with full payload | Enhancement — complete event catalog |
| Cron jobs | Referenced (renewal reminders, churn) | 15 cron jobs with schedules, descriptions | Enhancement — complete scheduler |
| Retry policy | Not specified | 5 scenarios with backoff tables | Enhancement — production-ready |
| Event schema | Not specified | BaseEvent interface with correlation_id, causation_id | Enhancement — distributed tracing ready |

---

## Deliverable 6: User Role Matrix

**File:** `06-ROLE-MATRIX.md` (21KB)

### Completion Status

| Item | Status | Notes |
|------|--------|-------|
| Role hierarchy diagram | ✅ Complete | 9-role hierarchy with reporting lines |
| All 9 role definitions | ✅ Complete | Name, description, scope, permissions, features |
| Gym owner definition | ✅ Complete | Dashboard, permissions, blueprint feature mapping |
| Trainer definition | ✅ Complete | 12 blueprint features mapped |
| Customer definition | ✅ Complete | 14 blueprint features mapped |
| Nutritionist definition | ✅ Complete | 8 blueprint features mapped |
| Supplement company definition | ✅ Complete | 7 blueprint features mapped |
| Equipment manufacturer definition | ✅ Complete | 7 blueprint features mapped |
| Maintenance provider definition | ✅ Complete | 6 blueprint features mapped |
| Company staff definition | ✅ Complete | 8 blueprint features + 5 sub-roles |
| Super admin definition | ✅ Complete | Full access, tenant management |
| 102-permission × 9-role access matrix | ✅ Complete | All cells with ✓ or ✗ |
| Data scoping rules table | ✅ Complete | Read/write/delete scope per role |
| Authentication flow sequence diagram | ✅ Complete | User → Frontend → Gateway → Auth → DB → JWT |
| Sub-roles for company staff | ✅ Complete | 5 sub-roles: area_manager, field_officer, support_agent, account_manager, compliance_officer |
| NestJS guard implementation example | ✅ Complete | Code example with decorators |

### Assumptions Made

| # | Assumption | Impact if Wrong |
|---|-----------|-----------------|
| A6.1 | 9 roles (102 permissions) cover all user types for the entire platform lifecycle | Missing roles (e.g., "group class instructor" vs "personal trainer") would require additional roles or role attributes |
| A6.2 | Permission granularity is at the "resource:scope:action" level (e.g., `gym:own:write`) | If finer-grained control needed (e.g., "can edit gym hours but not gym pricing"), permission system may need attribute-based access control (ABAC) |
| A6.3 | Company staff sub-roles can be implemented as role attributes rather than separate roles | If sub-roles need completely different permission sets, may need separate role entries |
| A6.4 | The 102 permissions listed are complete through Phase 5 | New features in Phase 2-5 will require additional permissions; matrix is extensible |

### Open Questions

| # | Question | Needs Input From |
|---|----------|-----------------|
| Q6.1 | Should there be a "gym receptionist" or "gym staff" sub-role under gym_owner with limited member management access? | Product |
| Q6.2 | Should "group class instructor" be a separate role from "personal trainer"? They have overlapping but different needs. | Product |
| Q6.3 | Should super_admin have the ability to impersonate other roles for debugging purposes? | Legal / Compliance |
| Q6.4 | Should we support custom roles (tenant-defined roles with selectable permissions) in the Pro/Enterprise plan? | Product |
| Q6.5 | What is the audit requirement for permission changes? (Who changed what role for whom, when) | Legal / Compliance |

### Risks Identified

| # | Risk | L | I | Mitigation |
|---|------|---|---|------------|
| R6.1 | Permission matrix grows unmanageably large (102 already for Phase 1; could exceed 200 by Phase 5) | M | M | Group permissions into logical categories; implement role templates; allow role inheritance |
| R6.2 | Users with multiple roles (e.g., gym_owner + trainer) need union of permissions — RBAC may get complex | M | M | User_roles table supports multiple roles; permission check aggregates all role permissions; document priority rules |
| R6.3 | Overly restrictive permissions may block legitimate workflows, causing support tickets | M | M | Regular permission audits with stakeholder input; "fail open" for non-sensitive operations initially |

### Dependencies

| ID | Depends On | Deliverable |
|----|-----------|-------------|
| D6.1 | Database schema (D3) — roles, user_roles, permissions, role_permissions tables | D3 |
| D6.2 | Blueprint roles & accounts section | Blueprint |
| D6.3 | Feeds into: Backend auth module (Sprint 1-2), Frontend permission gating, API endpoint guards | Phase 1 Sprints 1-2 |

### Blueprint Fidelity

| Aspect | Blueprint | Delivered | Difference |
|--------|-----------|-----------|------------|
| Roles listed | 8 roles (gym, trainer, customer, nutritionist, supplement, equipment, maintenance, company staff) | 9 roles (added super_admin) | Enhancement — needed for platform administration |
| Sub-roles | "Area managers, officers, field persons" mentioned | 5 sub-roles with explicit permissions | Enhancement — detailed breakdown |
| Permissions | Referenced in RBAC description | 102 permissions × 9 roles explicit matrix | Enhancement — complete mapping |
| Data scoping | Not explicitly defined | Read/write/delete scope per role table | Enhancement — essential for RLS enforcement |

---

## Deliverable 7: Screen/Page Inventory

**File:** `07-SCREEN-INVENTORY.md` (22KB)

### Completion Status

| Item | Status | Notes |
|------|--------|-------|
| Application matrix | ✅ Complete | 4 apps: Web (Next.js), Mobile (RN), Admin (React), Public (SSG) |
| Public/landing pages | ✅ Complete | 10 pages (home, features, pricing, about, gym search/detail, trainer search/profile, supplement, blog) |
| Auth pages | ✅ Complete | 5 pages (login, register, forgot password, reset password, OAuth callback) |
| Gym owner screens | ✅ Complete | 27 screens (dashboard, members, plans, trainers, supplements, equipment, maintenance, staff, biometric, attendance, offers, analytics, reports, settings, subscription, reviews, AI insights) |
| Trainer screens | ✅ Complete | 13 screens (overview, schedule, clients, workout builder, PT sessions, earnings, commissions, progress charts, profile, settings) |
| Nutritionist screens | ✅ Complete | 11 screens (overview, clients, diet plans, food logs, consultations, video, lab reports, profile, supplements) |
| Supplement company screens | ✅ Complete | 11 screens (overview, products, orders, analytics, campaigns, affiliates, inventory, profile) |
| Equipment manufacturer screens | ✅ Complete | 10 screens (overview, products, leads, AMC, service jobs, IoT telemetry, analytics) |
| Maintenance provider screens | ✅ Complete | 8 screens (overview, job board, active job, history, earnings, profile, settings) |
| Company staff screens (admin) | ✅ Complete | 16 screens (dashboard, gyms, onboarding, trainers, users, support, field visits, revenue, payouts, commissions, reports, audit, fraud, system health) |
| Super admin screens | ✅ Complete | 6 screens (dashboard, tenants, feature flags, config, audit, global) |
| Customer mobile screens | ✅ Complete | 32 screens (home, discovery, gym detail, plans, membership card, scanner, workout tracker, progress, nutrition, supplement shop, trainer discovery, bookings, notifications, profile, settings, rewards, health integrations, injury logger) |
| Trainer mobile screens | ✅ Complete | 10 screens |
| Nutritionist mobile screens | ✅ Complete | 8 screens |
| Screen count summary | ✅ Complete | 171 total (116 web + 55 mobile) |
| Route conventions | ✅ Complete | URL pattern conventions |
| Responsive breakpoints | ✅ Complete | 6 breakpoints from 320px to 2560px |

### Assumptions Made

| # | Assumption | Impact if Wrong |
|---|-----------|-----------------|
| A7.1 | All 171 screens are needed for the complete platform; Phase 1 builds ~30 screens | If scope needs cutting, screen inventory provides prioritisation reference |
| A7.2 | Each role has exactly one dashboard screen (no role has multiple sub-dashboards) | Roles like company_staff have tabs but one primary landing screen |
| A7.3 | Mobile screens are listed for customer + trainer + nutritionist only | Supplement companies, equipment manufacturers, maintenance providers use the web app (responsive) |
| A7.4 | 32 screens for customer mobile is sufficient for Phase 1-5 | Additional screens (e.g., "find gym buddies", "challenges") may be added as features expand |

### Open Questions

| # | Question | Needs Input From |
|---|----------|-----------------|
| Q7.1 | Should the gym owner web dashboard and the company staff admin portal share a component library or be completely separate? | Designer + Frontend |
| Q7.2 | Should we build the admin portal with the same Next.js app (under `/admin`) or a separate Vite app? Separate allows different auth but duplicates code. | Tech Lead + Frontend |
| Q7.3 | Are there screens missing for the "injury/health flags" feature that trainers need? | Product |
| Q7.4 | Should we build a separate "Equipment IoT Monitor" screen for equipment manufacturers, or is the service jobs list sufficient? | Product |

### Risks Identified

| # | Risk | L | I | Mitigation |
|---|------|---|---|------------|
| R7.1 | 171 screens is a large surface area; may overwhelm frontend team in Phase 1 | M | H | Phase 1 builds only ~30 screens; screen inventory provides complete map for Phases 2-5 |
| R7.2 | Mobile app with 32 screens may be under-scoped if customers expect more social/community features | M | M | Screen inventory is extensible; social features (buddy finder, challenges) can be added in Phase 3 |
| R7.3 | Admin portal and web dashboard may diverge in design if built by different frontend engineers | M | M | Shared UI kit package (`packages/ui-kit`) enforces consistency |

### Dependencies

| ID | Depends On | Deliverable |
|----|-----------|-------------|
| D7.1 | Blueprint feature list by role (8 roles) | Blueprint |
| D7.2 | Project structure (D2) — app directory layout | D2 |
| D7.3 | Feeds into: Design system (Figma), Frontend implementation, Phase 1 backlog (D8) | Phase 1 execution |

### Blueprint Fidelity

| Aspect | Blueprint | Delivered | Difference |
|--------|-----------|-----------|------------|
| Screen coverage | Referenced in features but not enumerated | 171 screens with routes, descriptions, role mapping | Enhancement — complete inventory |
| Route conventions | Not specified | `/{resource}/{param}` pattern standardised | Enhancement |
| Mobile screens | Not enumerated | 55 mobile screens across 3 roles | Enhancement |
| Responsive breakpoints | Not specified | 6 breakpoints defined | Enhancement |

---

## Deliverable 8: Phase 1 MVP Development Backlog

**File:** `08-PHASE1-BACKLOG.md` (15KB)

### Completion Status

| Item | Status | Notes |
|------|--------|-------|
| Phase 1 scope definition | ✅ Complete | 3-month duration, 3 pilot gyms, 100+ members, P0 features |
| Epic & story hierarchy | ✅ Complete | 10 epics, 50+ stories |
| Sprint 1 plan | ✅ Complete | 25 points: monorepo, Docker, Prisma, CI/CD, registration, RLS |
| Sprint 2 plan | ✅ Complete | 25 points: JWT, OAuth, RBAC, gym CRUD |
| Sprint 3 plan | ✅ Complete | 28 points: plans, Razorpay, dashboard API, purchase flow |
| Sprint 4 plan | ✅ Complete | 23 points: membership management, landing page, auth pages |
| Sprint 5 plan | ✅ Complete | 34 points: gym owner dashboard, member management, SMS/email |
| Sprint 6 plan | ✅ Complete | 23 points: push notifications, BullMQ, mobile auth, onboarding |
| Sprint 7 plan | ✅ Complete | 23 points: GPS discovery, gym detail, dashboard analytics |
| Sprint 8 plan | ✅ Complete | 24 points: mobile purchase, membership screen, home screen |
| Sprint 9 plan | ✅ Complete | 23 points: analytics, public SEO pages, staff portal |
| Sprint 10 plan | ✅ Complete | 20 points: staff detail, support tickets, notification wiring |
| Sprint 11 plan | ✅ Complete | 27 points: tests, security audit, performance baseline |
| Sprint 12 plan | ✅ Complete | 27 points: bug fixes, pilot onboarding, monitoring, documentation |
| MVP functional checklist | ✅ Complete | 15-item checklist |
| MVP non-functional checklist | ✅ Complete | 9-item checklist |
| Phase 1 explicit exclusions | ✅ Complete | 13 items deferred to Phase 2+ |
| Story point estimation guide | ✅ Complete | XS-XL sizing with examples |
| Dependency mapping (critical path) | ✅ Complete | ASCII dependency chain |
| Risk items for Phase 1 | ✅ Complete | 6 risks with mitigations |

### Assumptions Made

| # | Assumption | Impact if Wrong |
|---|-----------|-----------------|
| A8.1 | Team velocity of 25-30 story points per sprint is achievable with 6 people | If velocity is lower (e.g., 20), Phase 1 extends by 2-4 weeks; buffer built into Sprint 12 |
| A8.2 | 3 pilot gyms can be onboarded in Sprint 12 with minimal handholding | If pilots need more support, PM may need to delay full rollout |
| A8.3 | Razorpay integration (Sprint 3, 8 points) is the highest-risk story and should start early | Correct — it's the critical path for all purchase flows |
| A8.4 | Mobile app development (Epic 5) starts Sprint 6 after web dashboard | If mobile is higher priority, mobile engineer starts Sprint 1 with auth screens |

### Open Questions

| # | Question | Needs Input From |
|---|----------|-----------------|
| Q8.1 | Should PAYG and Flex membership types be included in Phase 1, or strictly fixed plans only? Blueprint says fixed only for MVP. | Product |
| Q8.2 | Should the 3 pilot gyms be charged (even at reduced rate) or be free during Phase 1 testing? | Business |
| Q8.3 | What is the target date for Phase 1 completion? Should we fix a calendar date or use sprint-based (12 sprints = 12 weeks)? | PM + Stakeholders |
| Q8.4 | Should we include basic trainer profile (no PT scheduling) in Phase 1 to have trainers ready for Phase 2? | Product |

### Risks Identified

| # | Risk | L | I | Mitigation |
|---|------|---|---|------------|
| R8.1 | 336 story points in 12 sprints may be aggressive for a new team | M | H | Track velocity after Sprint 1-2; reassess scope if below 25/sprint |
| R8.2 | Razorpay integration hits unexpected complexity (webhook verification, refund flow, GST) | M | M | Start Sprint 3; have Stripe as fallback; engage Razorpay support early |
| R8.3 | Mobile app store review delays (Apple TestFlight, Google Play) | L | M | Submit for review by Sprint 10; use TestFlight for beta testing with pilot gyms |
| R8.4 | Pilot gyms may have low engagement if dashboard lacks expected features | M | H | Weekly check-ins with pilot gyms; prioritise top 3 requested features |

### Dependencies

| ID | Depends On | Deliverable |
|----|-----------|-------------|
| D8.1 | Blueprint Phase 1 roadmap (Months 2-4) | Blueprint |
| D8.2 | System decomposition (D1) — service boundaries | D1 |
| D8.3 | Database schema (D3) — entity definitions for sprints 1-3 | D3 |
| D8.4 | Infrastructure plan (D9) — AWS setup before Sprint 1 | D9 |
| D8.5 | Feeds into: Phase 1 execution beginning after approval | Phase 1 |

### Blueprint Fidelity

| Aspect | Blueprint | Delivered | Difference |
|--------|-----------|-----------|------------|
| Phase 1 duration | Months 2-4 (3 months) | 12 weeks × 1 week sprints = 12 weeks | Minor — aligned with 3 months |
| Team size | 6 people | 6 people (PM, Designer, 2 Backend, 2 Frontend) | None |
| MVP scope | Auth, gym, memberships, payments, notifications, basic analytics, mobile app | Same + RBAC, multi-tenancy, CI/CD, admin portal basics | Enhancement — added foundational items not explicitly listed |
| Test coverage | 60% unit, 20% integration | Same | None |
| Pilot gyms | 3 | 3 | None |
| Sprint structure | Not specified | 12 weekly sprints with story points | Enhancement — detailed breakdown |

---

## Deliverable 9: Technical Dependencies & Infrastructure Requirements

**File:** `09-INFRASTRUCTURE-DEPS.md` (20KB)

### Completion Status

| Item | Status | Notes |
|------|--------|-------|
| External service dependencies | ✅ Complete | 25+ services across 11 categories with pricing |
| Payments section | ✅ Complete | Razorpay, Stripe, Avalara (future) |
| Communications section | ✅ Complete | Twilio, SendGrid, FCM, Gupshup |
| Auth section | ✅ Complete | Google OAuth, Apple Sign In |
| Maps section | ✅ Complete | Google Maps, OSM fallback |
| Video section | ✅ Complete | Agora, Jitsi |
| Health section | ✅ Complete | Apple HealthKit, Google Fit |
| Biometric devices section | ✅ Complete | Suprema, ZKTeco, HikVision |
| SEO/marketing section | ✅ Complete | GMB API, GA4, Search Console, Schema.org |
| Monitoring section | ✅ Complete | Sentry, Prometheus/Grafana, Datadog (future) |
| CI/CD section | ✅ Complete | GitHub, GitHub Actions, Snyk, Docker |
| Cloud infrastructure section | ✅ Complete | AWS EKS, RDS, ElastiCache, S3, CloudFlare, Vercel |
| Phase 1 infrastructure architecture diagram | ✅ Complete | ASCII diagram showing ALB → ECS → RDS/Redis/S3 |
| Phase 1 cost estimate | ✅ Complete | ~$186/mo |
| Phase 4 target cost estimate | ✅ Complete | ~$1,490/mo |
| Backend npm dependencies | ✅ Complete | 30+ key packages |
| AI/ML Python dependencies | ✅ Complete | 16 key packages |
| Web frontend npm dependencies | ✅ Complete | 20+ key packages |
| Mobile npm dependencies | ✅ Complete | 20+ key packages |
| Development tool requirements | ✅ Complete | 11 tools with versions and install URLs |
| VSCode extensions | ✅ Complete | 9 recommended extensions |
| Secrets management | ✅ Complete | 11 secrets listed |
| Environment access levels | ✅ Complete | Dev/Staging/Production with access control |
| Network/security configuration | ✅ Complete | Firewall rules, SSL/TLS cert strategy |
| Backup & disaster recovery | ✅ Complete | PostgreSQL, S3, Redis, AI models, GitHub |
| Compliance & data residency | ✅ Complete | DPDP, GDPR, PCI-DSS, SOC 2, data residency |
| Monitoring & alerting rules | ✅ Complete | 9 alert conditions with channels and responders |
| CI/CD pipeline design | ✅ Complete | 5-stage pipeline diagram with timings |

### Assumptions Made

| # | Assumption | Impact if Wrong |
|---|-----------|-----------------|
| A9.1 | AWS ap-south-1 (Mumbai) is the primary region for Phase 1-3 | If data residency laws change or latency to other regions matters, need multi-region plan |
| A9.2 | ECS Fargate (serverless containers) is sufficient for Phase 1; no need for full EKS yet | If we need more complex orchestration (cron jobs, service mesh), migrate to EKS in Phase 2 |
| A9.3 | Twilio SMS at ₹0.35/SMS is acceptable for Phase 1 volumes (est. 2000/mo) | If SMS volumes grow to 50K+/mo, negotiate better rate or use alternative (AWS Pinpoint, MSG91) |
| A9.4 | CloudFlare Pro ($20/mo) is the right CDN/WAF tier | If DDoS or bot attacks escalate, upgrade to Business ($200/mo) |
| A9.5 | Snyk dependency scanning weekly is sufficient | If vulnerabilities spike, increase to PR-level scanning |

### Open Questions

| # | Question | Needs Input From |
|---|----------|-----------------|
| Q9.1 | Should we commit to Vercel for Next.js hosting from Phase 1, or use ECS for everything? Vercel simplifies frontend deployment but adds cost. | DevOps + Tech Lead |
| Q9.2 | Should we use AWS Secrets Manager or HashiCorp Vault for secrets management? | DevOps |
| Q9.3 | Should we use managed Elasticsearch (AWS OpenSearch) or self-hosted for Phase 2? Managed is simpler but more expensive. | DevOps + Tech Lead |
| Q9.4 | What is the backup retention policy for customer data (GDPR/DPDP requires minimum)? | Legal / Compliance |

### Risks Identified

| # | Risk | L | I | Mitigation |
|---|------|---|---|------------|
| R9.1 | AWS costs may exceed estimates if Phase 1 traffic is higher than expected | L | M | Set up billing alerts at $200, $300, $500; use reserved instances if stable |
| R9.2 | Twilio SMS deliverability issues in India (some carriers block bulk SMS) | M | M | Have Gupshup (WhatsApp) as fallback; register SMS templates with TRAI DLT |
| R9.3 | Razorpay requires business verification (GST, PAN, bank account) — may delay Phase 1 start | M | H | Start Razorpay onboarding in Sprint 1; have Stripe India as backup |
| R9.4 | Apple Developer Program ($99/yr) and Google Play ($25 one-time) accounts needed for mobile app distribution | L | L | Procure in Week 1 of Phase 1 |

### Dependencies

| ID | Depends On | Deliverable |
|----|-----------|-------------|
| D9.1 | Blueprint technology stack section | Blueprint |
| D9.2 | System decomposition (D1) — service count and requirements | D1 |
| D9.3 | Feeds into: DevOps Sprint 1 (AWS setup, CI/CD), Backend environment config | Phase 1 execution |

### Blueprint Fidelity

| Aspect | Blueprint | Delivered | Difference |
|--------|-----------|-----------|------------|
| AWS services listed | EKS, RDS, ElastiCache, S3, CloudFlare | Same + ECS Fargate, CloudFront, ACM, ALB | Enhancement — Phase 1 uses ECS (simpler than EKS) |
| Cost estimates | Not provided | ~$186/mo Phase 1; ~$1,490/mo Phase 4 | Enhancement — critical for budgeting |
| Dependency packages | Not listed | 80+ npm/pip packages with version ranges | Enhancement — actionable for dev setup |
| CI/CD pipeline | Mentioned | 5-stage pipeline with timing estimates | Enhancement — implementable |
| Monitoring rules | Not specified | 9 alert conditions | Enhancement — operations-ready |

---

## Deliverable 10: Implementation Execution Plan

**File:** `10-EXECUTION-PLAN.md` (19KB)

### Completion Status

| Item | Status | Notes |
|------|--------|-------|
| Phase execution overview diagram | ✅ Complete | Gantt-style timeline for Phases 1-5 |
| Phase 0 completion tracker | ✅ Complete | 16 tasks across 4 weeks with owners and criteria |
| Phase 0 exit criteria (gate check) | ✅ Complete | 10 criteria with verification methods |
| Milestone M1 (MVP Core) acceptance criteria | ✅ Complete | 11 criteria with targets and measurements |
| Milestone M2 (Marketplace) acceptance criteria | ✅ Complete | Not explicit here; referenced from Phase 2 plan |
| Milestone M3 (AI & Intelligence) acceptance criteria | ✅ Complete | 9 criteria |
| Milestone M4 (Scale Ready) acceptance criteria | ✅ Complete | 10 criteria |
| Milestone M5 (Expansion) acceptance criteria | ✅ Complete | 5 criteria |
| Team structure table | ✅ Complete | 7 roles with Phase 1 headcount and reporting |
| Ceremonies calendar | ✅ Complete | 7 ceremony types with frequency, duration, attendees |
| Communication channels | ✅ Complete | 7 channels with tools and purposes |
| Risk management review cadence | ✅ Complete | Weekly, monthly, per-phase reviews |
| Phase 1 resource plan (people) | ✅ Complete | 6 roles, 3 months, ₹31.2L total |
| Phase 1 infrastructure cost | ✅ Complete | ₹59,700 for 3 months |
| Phase 1 total budget | ✅ Complete | ₹35.25L (~$42K) |
| Phase transition checklists | ✅ Complete | 5 gates (P0→P1, P1→P2, P2→P3, P3→P4, P4→P5) |
| Weekly status report template | ✅ Complete | Template with metrics |
| Burn-down chart example | ✅ Complete | ASCII chart |
| Risk register (live) | ✅ Complete | 7 risks with L/I/RPN scores |

### Assumptions Made

| # | Assumption | Impact if Wrong |
|---|-----------|-----------------|
| A10.1 | Phase 1 budget of ₹35.25L (~$42K) is approved | If budget is reduced, scope must be cut — likely mobile app or analytics postponed |
| A10.2 | 6-person team is available for Phase 1 full-time | If hiring delays occur, Phase 1 start date slips |
| A10.3 | Weekly sprints (12 total) are feasible for a new team | If team needs more time, extend to 2-week sprints (6 sprints, 24 weeks) |
| A10.4 | Pilot gyms are identified and willing to participate at ₹0/mo during Phase 1 | If pilot recruitment takes longer, Phase 1 extension needed |
| A10.5 | Phase 0 exit criteria will be fully satisfied before Phase 1 begins | If some criteria are waived, track as Phase 1 debt and schedule early sprints |

### Open Questions

| # | Question | Needs Input From |
|---|----------|-----------------|
| Q10.1 | Should Phase 1 be 12 weekly sprints (12 weeks) or 6 bi-weekly sprints (12 weeks)? | PM + Tech Lead — weekly is more overhead but faster feedback |
| Q10.2 | Should pilot gyms be charged a reduced rate or free during Phase 1? | Business |
| Q10.3 | Who has authority to approve phase transitions? | Stakeholders |
| Q10.4 | What is the escalation path for Phase 1 budget overruns? | PM + Finance |
| Q10.5 | Should the Phase 1 team be co-located or remote? | Company policy |

### Risks Identified

| # | Risk | L | I | Mitigation |
|---|------|---|---|------------|
| R10.1 | Budget of ₹35.25L may be under-estimated if Razorpay transaction costs, SMS costs, or AWS usage exceed projections | M | M | 10% contingency built in; track spending bi-weekly; reduce non-essential AWS resources |
| R10.2 | Pilot gym churn if they don't see value in MVP (limited features) | M | H | Weekly check-ins; provide dedicated support during Phase 1; gather feature requests for Phase 2 |
| R10.3 | Hiring delays for frontend engineers (mobile especially) | M | H | Start recruitment in Phase 0 Week 1; consider contractors if perm hiring slow |
| R10.4 | Phase 0 exit criteria not fully satisfied → delayed Phase 1 start | M | M | Prioritise Phase 0 completion items; parallelise where possible |

### Dependencies

| ID | Depends On | Deliverable |
|----|-----------|-------------|
| D10.1 | All D1-D9 deliverables — execution plan synthesises them | D1-D9 |
| D10.2 | Blueprint development roadmap (Phases 1-5) | Blueprint |
| D10.3 | Feeds into: Phase 1 governance and execution tracking | Phase 1 |

### Blueprint Fidelity

| Aspect | Blueprint | Delivered | Difference |
|--------|-----------|-----------|------------|
| Phase 1-5 roadmap | Text description | 5 milestones with quantitative acceptance criteria | Enhancement — measurable gates |
| Budget | Mentioned as MRR targets | Detailed ₹35.25L Phase 1 budget with breakdown | Enhancement — actionable |
| Team structure | Not detailed | 7 roles with reporting lines and responsibilities | Enhancement |
| Ceremonies | Not specified | 7 ceremony types with frequency and duration | Enhancement |
| Phase transition criteria | Not specified | 5 gate checklists with verification methods | Enhancement — essential for governance |

---

## Gate Review Sign-Off

### Phase 0 Deliverable Sign-Off

| # | Deliverable | Document | Reviewer | Decision | Comments |
|---|------------|----------|----------|----------|----------|
| 1 | System Decomposition | `01-SYSTEM-DECOMPOSITION.md` | | ⬜ Approve / ⬜ Changes / ⬜ Reject | |
| 2 | Project Folder Architecture | `02-PROJECT-STRUCTURE.md` | | ⬜ Approve / ⬜ Changes / ⬜ Reject | |
| 3 | Database Design | `03-DATABASE-DESIGN.md` | | ⬜ Approve / ⬜ Changes / ⬜ Reject | |
| 4 | OpenAPI Specification | `04-OPENAPI-SPEC.md` | | ⬜ Approve / ⬜ Changes / ⬜ Reject | |
| 5 | Event Architecture | `05-EVENT-ARCHITECTURE.md` | | ⬜ Approve / ⬜ Changes / ⬜ Reject | |
| 6 | User Role Matrix | `06-ROLE-MATRIX.md` | | ⬜ Approve / ⬜ Changes / ⬜ Reject | |
| 7 | Screen Inventory | `07-SCREEN-INVENTORY.md` | | ⬜ Approve / ⬜ Changes / ⬜ Reject | |
| 8 | Phase 1 Backlog | `08-PHASE1-BACKLOG.md` | | ⬜ Approve / ⬜ Changes / ⬜ Reject | |
| 9 | Infrastructure Dependencies | `09-INFRASTRUCTURE-DEPS.md` | | ⬜ Approve / ⬜ Changes / ⬜ Reject | |
| 10 | Execution Plan | `10-EXECUTION-PLAN.md` | | ⬜ Approve / ⬜ Changes / ⬜ Reject | |

### Phase 0 Gate Decision

| Criteria | Status |
|----------|--------|
| All 10 deliverables submitted for review | ✅ |
| Open questions resolved | ⬜ Pending stakeholder input |
| Assumptions validated | ⬜ Pending stakeholder input |
| Risks accepted or mitigated | ⬜ Pending stakeholder input |
| Blueprint deviations approved | ⬜ Pending stakeholder input |
| Phase 1 budget approved | ⬜ Pending stakeholder input |

**Final Decision:** ⬜ **Approve Phase 0 — Proceed to Phase 1** | ⬜ **Changes Required — See Comments** | ⬜ **Reject — Foundation Insufficient**

---

**Sign-Off:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Manager | | | |
| Tech Lead | | | |
| Stakeholder | | | |

---

*End of Document — Phase 0 Gate Review v1.0*

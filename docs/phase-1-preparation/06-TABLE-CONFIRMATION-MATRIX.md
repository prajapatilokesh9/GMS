# Phase 1 — Table Confirmation Matrix

**Conditions:**
1. FITCORE PRO Blueprint remains authoritative
2. No deferred table is required by auth, RBAC, multi-tenancy, gym onboarding, audit logging, event architecture, or future schema relationships
3. No shortcuts creating migration debt for Phase 2

---

## Active Tables (Phase 1 Sprint 1)

| # | Table | Blueprint Table # | Sprint 1 Need | Future FK Dependencies |
|---|-------|------------------|---------------|----------------------|
| T1 | `tenants` | 21 | Multi-tenancy root. All tenant-scoped tables FK to it | Referenced by every future table via `tenant_id` |
| T2 | `users` | 1 | User registration, auth, OAuth, password reset, profile | FK target for: memberships.customer_id, trainers.user_id, pt_sessions.customer_id, diet_plans.*_id, food_logs.user_id, supplement_orders.customer_id, equipment.manufacturer_id, maintenance_jobs.technician_id, notifications.user_id, ai_recommendations.user_id, loyalty_points.user_id |
| T3 | `roles` | 2 | RBAC role definitions | Referenced by user_roles, role_permissions |
| T4 | `user_roles` | 3 | User-to-role assignment (multi-role support) | FK → users, roles, tenants |
| T5 | `permissions` | 4 | Granular permission definitions | Referenced by role_permissions |
| T6 | `role_permissions` | 5 | Role-to-permission mapping | FK → roles, permissions |
| T7 | `gyms` | 6 | Gym profile, onboarding, dashboard | FK target for: membership_plans.gym_id, memberships.gym_id, trainers.gym_id, pt_sessions.gym_id, workouts.gym_id, supplement_orders.gym_id, equipment.gym_id, maintenance_jobs.gym_id, loyalty_points.gym_id |
| T8 | `audit_logs` | Additional (blueprint-compatible) | Audit trail for auth, gym events, compliance | FK → users (optional), tenants |

### Total Active: 8 tables

---

## Deferred Tables (Phase 2+)

| # | Table | Blueprint Table # | Reason for Deferral | Future Dependencies | Anticipated Phase | Migration Strategy |
|---|-------|------------------|---------------------|--------------------|-------------------|--------------------|
| D1 | `membership_plans` | 7 | Not required for auth, RBAC, multi-tenancy, or gym onboarding. Gym profiles exist without plans. | FK → gyms (active T7). gyms.subscription_plan_id is nullable — no constraint required at schema level | Phase 2 Sprint 4 | `prisma migrate dev --name add_membership_plans` — additive migration, no data loss |
| D2 | `memberships` | 8 | Payment gateway (Razorpay) integration not in Sprint 1 scope. No subscription logic needed. | FK → gyms (T7), users (T2), membership_plans (D1), payments (D10) | Phase 2 Sprint 4 | Additive migration; FK constraints reference already-existing parents |
| D3 | `trainers` | 9 | Trainer module deferred to Phase 2 per blueprint. Not needed for gym onboarding foundation. | FK → users (T2), gyms (T7) | Phase 2 Sprint 5 | Additive migration; FKs reference active tables |
| D4 | `pt_sessions` | 10 | PT booking requires trainer module first. | FK → trainers (D3), users (T2), gyms (T7), payments (D10) | Phase 2 Sprint 5 | Additive migration |
| D5 | `workouts` | 11 | Workout tracking is a Phase 2 customer feature. | FK → users (T2), trainers (D3), gyms (T7) | Phase 2 Sprint 6 | Additive migration |
| D6 | `body_metrics` | 12 | Biometric tracking is Phase 2. | FK → users (T2) | Phase 2 Sprint 6 | Additive migration |
| D7 | `diet_plans` | 13 | Nutritionist module is Phase 2. | FK → users (T2 — both nutritionist_id and customer_id) | Phase 2 Sprint 6 | Additive migration |
| D8 | `food_logs` | 14 | Nutrition tracking is Phase 2. | FK → users (T2) | Phase 2 Sprint 6 | Additive migration |
| D9 | `supplements` | 15 | Supplement marketplace is Phase 2. | FK → users (T2 — company_id) | Phase 2 Sprint 5 | Additive migration |
| D10 | `supplement_orders` | 16 | Orders require supplements + payments. | FK → users (T2), gyms (T7), payments (D12), trainers (D3) | Phase 2 Sprint 5 | Additive migration |
| D11 | `equipment` | 17 | Equipment module is Phase 2. | FK → users (T2 — manufacturer_id), gyms (T7) | Phase 2 Sprint 5 | Additive migration |
| D12 | `maintenance_jobs` | 18 | Maintenance module is Phase 2. | FK → equipment (D11), gyms (T7), users (T2 — technician_id) | Phase 2 Sprint 5 | Additive migration |
| D13 | `payments` | 19 | Razorpay/Stripe integration not in Sprint 1 scope. Polymorphic entity FK design. | FK → polymorphic (entity_type + entity_id). Referenced by: memberships, pt_sessions, supplement_orders | Phase 2 Sprint 4 | Additive migration; `entity_type` enum must match Phase 2 service schemas |
| D14 | `notifications` | 20 | Notification providers stubbed in Phase 1. Full table needed when real delivery begins. | FK → users (T2) | Phase 2 Sprint 4 | Additive migration |
| D15 | `ai_recommendations` | Additional (blueprint) | AI/ML features deferred to Phase 3 per blueprint roadmap. | FK → users (T2) | Phase 3 | Additive migration |
| D16 | `loyalty_points` | Additional (blueprint) | Gamification deferred to Phase 2. | FK → users (T2), gyms (T7) | Phase 2 Sprint 6 | Additive migration |

### Total Deferred: 16 tables

---

## Sprint 1 Table Requirement Check

For each Sprint 1 scope item, I confirm which tables are required and that no deferred table is needed:

| Sprint 1 Scope Item | Tables Required | Deferred Table Needed? | Confirmation |
|--------------------|----------------|----------------------|--------------|
| Monorepo setup | None | None | ✅ No tables needed |
| Docker environment | None | None | ✅ No tables needed |
| CI/CD foundation | None | None | ✅ No tables needed |
| PostgreSQL setup | None (infrastructure) | None | ✅ No tables needed |
| Prisma schema | T1-T8 (all 8 active) | None | ✅ All needed tables are active |
| Multi-tenant architecture | T1 (tenants), T2 (users), T7 (gyms) + RLS on all | None | ✅ RLS requires only tenant_id column, present on all active tables |
| RBAC foundation | T3 (roles), T4 (user_roles), T5 (permissions), T6 (role_permissions) | None | ✅ Complete RBAC graph within 4 active tables |
| Core API framework | None | None | ✅ No tables needed |
| Redis foundation | None | None | ✅ No tables needed |
| BullMQ foundation | None | None | ✅ No tables needed |
| Audit logging foundation | T8 (audit_logs) | None | ✅ Active table |
| User registration & auth | T1, T2, T3, T4 | None | ✅ users + roles/user_roles fully sufficient for auth |
| Gym onboarding foundation | T1, T2, T7 | None | ✅ gyms table references tenants and users, both active |
| **Notification stubs** | None (interface-only in Phase 1) | D14 (notifications) | ✅ Stubbed — interface + event contracts only; table deferred to Phase 2 |

**Result: Zero deferred tables are required for Sprint 1 scope.**

---

## Migration Debt Prevention

| Concern | Mitigation | Status |
|---------|-----------|--------|
| Phase 2 tables need FKs to active tables | All deferred tables' FK targets (tenants, users, gyms, roles, permissions) are active in Phase 1. FKs can be added in Phase 2 migration without schema changes to active tables. | ✅ No debt |
| `gyms.subscription_plan_id` is null | Column defined as nullable; FK to membership_plans will be added in Phase 2 when that table exists. No need to alter the column. | ✅ No debt |
| Polymorphic payments.entity_type needs forward-compatible enum | `entity_type` is VARCHAR(50) in payments table; Phase 2 values (membership, pt_session, supplement_order) will be valid without schema change. | ✅ No debt |
| Event contracts need to match future notification table | `BaseEvent` interface includes `tenant_id`, `correlation_id` — both columns present in deferred notifications table design. Event payloads define all fields needed for future table. | ✅ No debt |
| Prisma seed must be extensible for Phase 2 entities | Seed script idempotent (`upsert`); Phase 2 seeds will add Phase 2 data without removing Phase 1 data. | ✅ No debt |
| Phased tables need to be added without breaking changes | All Phase 2 additions use `prisma migrate dev` (additive); no existing columns or tables modified. | ✅ No debt |

---

## Blueprint Requirement Coverage

| Blueprint Section | Phase 1 Covers | Future Phase |
|------------------|---------------|--------------|
| System Architecture (4-layer) | ✅ API Gateway, Core Service Layer (auth, users, gyms), Data Layer (PostgreSQL, Redis), Infrastructure (Docker, AWS) | Phase 2: Search, Analytics; Phase 3: AI |
| Auth Service | ✅ JWT, register, login, OAuth stubs, password reset, RBAC | — |
| Users Table | ✅ Full implementation | — |
| Roles & Permissions Tables | ✅ Full implementation | — |
| Gyms Table | ✅ Full implementation | Phase 2: membership_plans FK |
| Multi-tenancy (RLS) | ✅ Full implementation | Phase 2: RLS on new tables |
| Audit Logging | ✅ Full implementation | — |
| Event Architecture | ✅ BaseEvent, BullMQ, producers/consumers, retry/DLQ | Phase 2: business events |
| Notification Architecture | ✅ Interfaces, event contracts, stubs | Phase 2: real delivery + notifications table |
| All other blueprint tables | ❌ Deferred per roadmap | Phase 2-3 |

**No Blueprint requirement is being removed.** Every table, service, and module defined in the FITCORE PRO Blueprint remains in the architecture. Deferral follows the Phase 1 scope defined in the Blueprint's Development Roadmap (Months 2-4).

---

## Final Confirmation

| Condition | Status |
|-----------|--------|
| Blueprint remains authoritative source | ✅ Confirmed |
| No deferred table required by Sprint 1 scope | ✅ Confirmed (zero dependencies) |
| No migration debt created for Phase 2 | ✅ Confirmed (additive migrations only; FK targets active) |
| No Blueprint requirement removed | ✅ Confirmed (all requirements mapped to future phases) |
| All 8 active tables fully implement blueprint column definitions | ✅ Confirmed |
| RLS covers all active tenant-scoped tables | ✅ Confirmed |
| Notification stubs use blueprint-compatible interfaces and events | ✅ Confirmed |

**Proceeding to Sprint 1 implementation.**

---

*End of Table Confirmation Matrix*

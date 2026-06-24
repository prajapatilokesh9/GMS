# Phase 2 Database Activation Plan

## Deferred Table Activation Plan

| # | Table | Blueprint | Phase 1 Status | Activation Phase | Migration Type |
|---|-------|-----------|----------------|------------------|----------------|
| 1 | membership_plans | ✅ | ❌ Deferred | Sprint 4 | Additive |
| 2 | memberships | ✅ | ❌ Deferred | Sprint 4 | Additive |
| 3 | trainers | ✅ | ❌ Deferred | Sprint 5 | Additive |
| 4 | pt_sessions | ✅ | ❌ Deferred | Sprint 5 | Additive |
| 5 | workouts | ✅ | ❌ Deferred | Sprint 6 | Additive |
| 6 | body_metrics | ✅ | ❌ Deferred | Sprint 6 | Additive |
| 7 | diet_plans | ✅ | ❌ Deferred | Sprint 7 | Additive |
| 8 | food_logs | ✅ | ❌ Deferred | Sprint 7 | Additive |
| 9 | supplements | ✅ | ❌ Deferred | Sprint 4 | Additive |
| 10 | supplement_orders | ✅ | ❌ Deferred | Sprint 5 | Additive |
| 11 | equipment | ✅ | ❌ Deferred | Sprint 5 | Additive |
| 12 | maintenance_jobs | ✅ | ❌ Deferred | Sprint 5 | Additive |
| 13 | payments | ✅ | ❌ Deferred | Sprint 4 | Additive |
| 14 | notifications | ⚠️ Stub | ❌ Deferred | Sprint 6 | Additive |
| 15 | ai_recommendations | ✅ | ❌ Deferred | Sprint 7 | Additive |
| 16 | loyalty_points | ✅ | ❌ Deferred | Sprint 6 | Additive |
| 17 | commission_splits | ✅ (Revenue) | ❌ Deferred | Sprint 5 | Additive |
| 18 | supplement_companies | ✅ | ❌ Deferred | Sprint 4 | Additive |
| 19 | gym_branches | ✅ | ❌ Deferred | Sprint 5 | Additive |

**Total Deferred: 19 tables** (all additive migrations, zero schema-breaking)

## Table Relationships

```
Core (Phase 1) → Phase 2 Extensions
─────────────────────────────────────────────────────────────────
gyms
  ├── membership_plans (1:N) ────── memberships (1:N) ← users
  ├── trainers (1:N) ───────────── pt_sessions (1:N) ← memberships, users
  ├── equipment (1:N) ──────────── maintenance_jobs (1:N) ← users (technician)
  └── gym_branches (1:N)

users
  ├── memberships (1:N) ────────── payments (1:N)
  ├── pt_sessions (1:N) ────────── workouts (1:N)
  ├── workouts (1:N) ───────────── body_metrics (1:N)
  ├── diet_plans (1:N) ─────────── food_logs (1:N)
  ├── supplement_orders (1:N) ─── payments (1:N)
  ├── notifications (1:N)
  ├── loyalty_points (1:N)
  ├── ai_recommendations (1:N)
  └── commission_splits (1:N)

gyms ←→ supplement_companies (N:M via supplement_orders)
supplement_companies
  └── supplements (1:N) ───────── supplement_orders (1:N) ← users, gyms
    └── supplement_orders ─────── payments (1:N)

trainers
  └── commission_splits (1:N) ← pt_sessions, supplement_orders

equipment
  └── maintenance_jobs (1:N) ← users (technician)
```

## Migration Strategy

### Sprint 4 (Billing Foundation)
```bash
# Order: Foundation → Payments → Orders
1. payments.sql              # Central payment entity for all revenue
2. membership_plans.sql      # Plan definitions per gym
3. memberships.sql           # Customer subscriptions
3. supplements.sql           # Product catalogue
4. supplement_companies.sql  # Supplier accounts
5. supplement_orders.sql     # Customer purchases
```

### Sprint 5 (Training & Equipment)
```bash
6. trainers.sql              # Trainer profiles
7. pt_sessions.sql           # Personal training bookings
8. commission_splits.sql     # Revenue sharing
9. equipment.sql             # Machine inventory
10. maintenance_jobs.sql     # Job dispatch
```

### Sprint 6 (Engagement & Wellness)
```bash
11. workouts.sql             # Workout logging
12. body_metrics.sql         # Progress tracking
13. notifications.sql        # Multi-channel delivery
14. loyalty_points.sql       # Gamification
```

### Sprint 7 (Nutrition & AI)
```bash
15. diet_plans.sql           # Nutritionist plans
16. food_logs.sql            # Macro tracking
16. ai_recommendations.sql   # ML output storage
```

### Migration Commands
```bash
# Per sprint: validate → migrate → seed → test
npx prisma migrate dev --name sprint4_billing
npx prisma db seed -- --sprint=4
npm run test:integration -- --tag=sprint4
```

## Dependency Mapping

| Migration | Depends On | Blocks | Can Run Parallel |
|-----------|------------|--------|------------------|
| payments | Phase 1: users, gyms | memberships, pt_sessions, supplement_orders, maintenance_jobs | ✅ First |
| membership_plans | gyms | memberships | ✅ With payments |
| memberships | payments, membership_plans, users | pt_sessions | After payments |
| supplements | supplement_companies | supplement_orders | ✅ With membership_plans |
| supplement_orders | payments, supplements, users, gyms | commission_splits | After supplements |
| trainers | gyms, users | pt_sessions, commission_splits | Independent |
| pt_sessions | trainers, users, gyms, memberships, payments | commission_splits, workouts | After trainers |
| commission_splits | pt_sessions, supplement_orders, trainers | payouts | After pt_sessions |
| equipment | gyms | maintenance_jobs | Independent |
| maintenance_jobs | equipment, gyms, users | — | After equipment |
| notifications | users | all engagement flows | Independent |
| workouts | users, gyms, trainers | body_metrics | After pt_sessions |
| diet_plans | users (nutritionist), users (customer) | food_logs | Independent |
| food_logs | users, diet_plans | ai_recommendations | After diet_plans |
| ai_recommendations | users, workouts, body_metrics, food_logs | — | Last |
| loyalty_points | users, gyms | — | After notifications |

## Phase 1 → Phase 2 Data Continuity

| Phase 1 Table | Phase 2 Extension | Migration Note |
|---------------|-------------------|----------------|
| gyms | membership_plans, equipment, branches | Add FK columns, no data migration |
| users | trainers, memberships, loyalty | Role expansion via user_roles |
| gym_documents | equipment specs, AMC docs | Reuse upload infrastructure |
| audit_logs | All Phase 2 entities | Extend entity_type enum |

## Rollback Strategy
- All migrations additive only (no DROP/ALTER on Phase 1 columns)
- Feature flags gate Phase 2 functionality
- `prisma migrate resolve --rolled-back` if needed
- Blue/green deploy via Terraform for zero-downtime
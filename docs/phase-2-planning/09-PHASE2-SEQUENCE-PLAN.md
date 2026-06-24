# Phase 2 Sprint Sequence Plan

## Sprint Breakdown

| Sprint | Theme | Epics | Story Points | Tables Activated | API Endpoints |
|--------|-------|-------|--------------|-----------------|--------------|
| **Sprint 4** | Billing & Marketplace Foundation | E1 (21), E2 (18) | 39 | 6 (payments, membership_plans, memberships, supplements, supplement_companies, supplement_orders) | ~14 |
| **Sprint 5** | Training & Equipment Revenue | E3 (15), E4 (13) | 28 | 5 (trainers, pt_sessions, commission_splits, equipment, maintenance_jobs) | ~14 |
| **Sprint 6** | Wellness & Engagement | E5 (13), E6 (8), E9 (13) | 34 | 4 (workouts, body_metrics, notifications, loyalty_points) | ~14 |
| **Sprint 7** | AI, Biometric & Staff Tools | E7 (21), E8 (15), E10 (8) | 44 | 2 (diet_plans, food_logs, ai_recommendations) | ~16 |

**Total: 4 sprints, 145 story points, 19 tables, ~58 endpoints**

## Epic Ordering

```
Sprint 4         Sprint 5         Sprint 6         Sprint 7
─────────────────────────────────────────────────────────────
E1: Billing ───→ E3: Training ──→ E5: Nutrition ─→ E7: AI/ML
    │                │                │                │
E2: Marketplace ───→ E4: Equipment ─→ E6: Maintenance → E8: Biometric
                     │                               │
                     └── E9: Loyalty ────────────────→ E10: Staff
```

## Dependency Graph

```
Phase 1 Foundation
    ├── Auth, RBAC, Gym, Events, Notifications, Analytics
    │
    ├── Sprint 4
    │   ├── E1 (Billing) ← Phase 1 Auth + Gym + RBAC
    │   └── E2 (Marketplace) ← E1 (payments)
    │
    ├── Sprint 5
    │   ├── E3 (Training) ← E1 + Phase 1 Trainer
    │   ├── E4 (Equipment) ← Phase 1 Gym + Events
    │   └── E9.1 (Loyalty: points engine) ← E1 (payments)
    │
    ├── Sprint 6
    │   ├── E5 (Nutrition) ← E1 + Phase 1 User
    │   ├── E6 (Maintenance) ← E4 (equipment) + Events
    │   └── E9.2 (Loyalty: badges, leaderboard) ← E3 (sessions)
    │
    └── Sprint 7
        ├── E7 (AI/ML) ← Sprint 4-6 event data
        ├── E8 (Biometric) ← Phase 1 Gym + Notifications
        └── E10 (Staff) ← Phase 1 Auth + RBAC
```

## Critical Path

```
Phase 1 Auth → E1 Payments → E2 Marketplace → E3/Events → E7 AI/ML
     ↓            ↓              ↓                ↓            ↓
   Sprint 4     Sprint 4       Sprint 5         Sprint 6    Sprint 7
                                                        (launch gate)
```

**Longest chain:** 4 sprints (12 weeks). No blockers on critical path.

## Parallel Workstreams

| Workstream | Sprint 4 | Sprint 5 | Sprint 6 | Sprint 7 |
|-----------|----------|----------|----------|----------|
| **Backend (Node.js)** | E1, E2 APIs | E3, E4 APIs | E5, E6, E9 APIs | E7, E8, E10 APIs |
| **Frontend (Web)** | Billing admin, supplement admin | PT & equipment admin | Diet, maintenance, loyalty UI | AI dashboards, staff tools |
| **Mobile (React Native)** | Membership purchase, supplement browse | PT booking, equipment view | Food log, job board, loyalty | AI recs, biometric entry |
| **Data/ML (Python)** | — | — | Event pipeline setup | Churn model, rec engine |
| **DevOps** | Payment integration, terraform updates | Read replica setup | Monitoring expansion | Model deployment pipeline |

## Milestone Schedule

| Milestone | Sprint | Delivery | Verification |
|-----------|--------|----------|-------------|
| M1: Payments Go-Live | Sprint 4 | Week 2 | Payment success rate >95% |
| M2: First Marketplace Order | Sprint 4 | Week 4 | Supplement order completed end-to-end |
| M3: First PT Booking | Sprint 5 | Week 6 | Trainer booked, session completed, commission split |
| M4: Equipment AMC Active | Sprint 5 | Week 8 | Equipment added, AMC tracked, service requested |
| M5: Nutrition Plan Published | Sprint 6 | Week 10 | Diet plan created, food logged, adherence tracked |
| M6: AI Churn Model Live | Sprint 7 | Week 12 | Churn predictions running at >80% precision |
| M7: Biometric Entry Live | Sprint 7 | Week 13 | Face/QR entry operational at pilot gym |
| M8: Phase 2 Complete | Sprint 7 | Week 14 | All exit criteria met |

## Resource Allocation

| Role | Sprint 4 | Sprint 5 | Sprint 6 | Sprint 7 |
|------|----------|----------|----------|----------|
| Backend (Node.js) | 2 FT | 2 FT | 2 FT | 2 FT |
| Frontend (Web) | 1 FT | 1 FT | 1 FT | 1 FT |
| Mobile (React Native) | 1 FT | 1 FT | 1 FT | 1 FT |
| ML Engineer | — | — | 0.5 FT | 1 FT |
| QA | 1 FT | 1 FT | 1 FT | 1 FT |
| DevOps | 0.5 FT | 0.5 FT | 0.5 FT | 0.5 FT |

## Delivery Timeline

```
Week 1-2:   Sprint 4 Start → Payment integration → Plan CRUD
Week 3-4:   Sprint 4 End → Supplement order flow → Gate Review
Week 5-6:   Sprint 5 Start → PT booking → Equipment inventory
Week 7-8:   Sprint 5 End → AMC lifecycle → Commission splits → Gate Review
Week 9-10:  Sprint 6 Start → Diet plans → Food logs → Job board
Week 11-12: Sprint 6 End → Loyalty system → Gate Review
Week 13-14: Sprint 7 Start → AI models → Biometric SDK → Staff tools
Week 15-16: Sprint 7 End → System integration test → Phase 2 Gate Review
```

## Phase 2 Exit Criteria

| # | Criterion | Target | Method |
|---|-----------|--------|--------|
| 1 | All 10 epics implemented | 100% stories accepted | Sprint gate reviews |
| 2 | 19 deferred tables activated | Migrations applied | Prisma migrate status |
| 3 | ~58 new API endpoints live | All passing integration tests | Automated test suite |
| 4 | Razorpay + Stripe payment flow | End-to-end purchase success | E2E test + manual |
| 5 | Supplement marketplace order | Order → payment → fulfilment | E2E test |
| 6 | PT booking + commission split | Book → complete → payout calculated | E2E test |
| 7 | AI churn prediction >80% precision | Against holdout test set | ML evaluation |
| 8 | Biometric entry at 1+ pilot gym | Face/QR entry <2s | Manual verification |
| 9 | All security checks pass | 0 critical, 0 high vulns | Security audit |
| 10 | Performance targets met | p95 <300ms, p99 <500ms | k6 load test |

## Recommended Go-Live Sequence

| Phase | Scope | Week | Risk |
|-------|-------|------|------|
| **Soft Launch** | E1 billing only, 1 pilot gym | Week 6 | Low (payments tested) |
| **Marketplace Launch** | E2 + E3, 3 pilot gyms | Week 10 | Medium (multi-party settlement) |
| **Wellness Launch** | E5 + E6 + E9, 5 gyms | Week 14 | Medium (new user flows) |
| **Full Launch** | ALL epics, 10 gyms | Week 16 | Medium (AI accuracy ramp) |

*Each gate requires previous sprint's exit criteria met before proceeding.*
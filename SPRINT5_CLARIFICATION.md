# Sprint 5 Planning — Clarification Response

**Status**: REVIEW IN PROGRESS

---

## 1. Story Point Reconciliation

### Original Estimate vs Revised Estimate

| Item | Original Phase 2 Roadmap | Revised Detailed Estimate | Delta |
|---|---|---|---|
| E3 — Personal Training Revenue | 13 SP | 21 SP | +8 |
| E4 — Equipment & AMC Lifecycle | 13 SP | 21 SP | +8 |
| Sprint 4 Backlog Carryover | 2 SP | 5 SP | +3 |
| **Sprint 5 Total** | **28 SP** | **47 SP** | **+19** |

### Detailed Story Breakdown

```
E3 (21 SP):
  E3.1  Trainer Profiles       3 SP  — model, CRUD, admin UI
  E3.2  PT Packages             5 SP  — model, CRUD, pricing, validity
  E3.3  PT Sessions             5 SP  — model, booking, check-in/out, package deduction
  E3.4  Commissions & Payouts   5 SP  — rules engine, payout tracking, ledger
  E3.5  PT Events               2 SP  — 6 event types, consumers
  E3.6  PT Integration Tests    1 SP  — 40+ tests

E4 (21 SP):
  E4.1  Equipment Catalogue     3 SP  — model, CRUD, admin UI
  E4.2  Equipment Instances     5 SP  — lifecycle states, serial tracking
  E4.3  Maintenance Jobs        5 SP  — scheduling, cost tracking, vendor
  E4.4  AMC Contracts           5 SP  — contract lifecycle, expiry monitoring
  E4.5  Equipment Events        2 SP  — 7 event types, consumers
  E4.6  Equipment Tests         1 SP  — 40+ tests

Carryover (5 SP):
  BC-01  Billing RBAC           2 SP
  BC-02  Audit Logging           1 SP
  BC-03  DLQ Authorization      1 SP
  BC-04  Pagination (TD12)      1 SP
```

### Justification for Increase

Three factors drive the +19 SP delta vs the original roadmap estimate:

1. **Scope discovery**: The original Phase 2 roadmap was a high-level sizing. Detailed analysis revealed:
   - Commissions require a separate rate engine + payout lifecycle (was not scoped)
   - PT sessions need check-in/check-out + package allowance deduction (was not scoped)
   - AMC contracts require expiry monitoring + auto-renewal (was not scoped)
   - Equipment lifecycle has 6 states vs the originally assumed 3

2. **Architecture baseline**: Sprint 4 established the per-domain pattern (validation → service → controller → routes → events → admin UI → tests). Each new domain follows the same pattern at the same level of rigor. This was not fully accounted for in the original sizing.

3. **Carryover addition**: The original plan assumed Sprint 4 conditions would be resolved within Sprint 4. Since they carry over, they consume Sprint 5 capacity.

### Velocity Impact Assessment

| Metric | Sprint 4 (Actual) | Sprint 5 (Plan A: 47 SP) | Sprint 5 (Proposed) |
|---|---|---|---|
| Delivered SP | 34 | 47 | **26** |
| Velocity utilization | 100% | 138% | **76%** |
| Risk level | — | High | Low |

**Demonstrated velocity**: 34 SP (Sprint 4 — E1 at 13 SP + E2 at 21 SP).

**Recommendation**: Load Sprint 5 at **26 SP** (E3 full + carryover). Defer E4 to Sprint 6. This keeps load within demonstrated capacity (76% utilization) with buffer for unknowns.

---

## 2. Database Activation Review

### Table-by-Table Breakdown

| # | Table | Schema | Purpose | Dependencies | Migration |
|---|---|---|---|---|---|
| 1 | `trainers` | `personal_training` | Staff with trainer role; links gym users to PT privileges | `public.users`, `gym.gyms` | `20260621_sprint5_pt` |
| 2 | `pt_packages` | `personal_training` | Prepaid session bundles (e.g., "10 sessions for ₹5000") | `gym.gyms` | `20260621_sprint5_pt` |
| 3 | `pt_sessions` | `personal_training` | Individual training appointments; tracks check-in/out, references package | `personal_training.trainers`, `public.users`, `personal_training.pt_packages` | `20260621_sprint5_pt` |
| 4 | `commission_rules` | `personal_training` | Per-trainer or per-gym commission rate configuration | `personal_training.trainers`, `gym.gyms` | `20260621_sprint5_pt` |
| 5 | `commission_payouts` | `personal_training` | Individual earned commissions linked to completed sessions | `personal_training.trainers`, `personal_training.pt_sessions` | `20260621_sprint5_pt` |
| 6 | `equipment_catalogue` | `equipment` | Master list of equipment types/brands/models a gym can own | none (tenant only) | `20260621_sprint5_equipment` |
| 7 | `equipment_instances` | `equipment` | Serial-number-tracked individual equipment items with lifecycle state | `equipment.equipment_catalogue`, `gym.gyms` | `20260621_sprint5_equipment` |
| 8 | `maintenance_jobs` | `equipment` | Scheduled and unscheduled maintenance records with costs | `equipment.equipment_instances`, `gym.gyms` | `20260621_sprint5_equipment` |
| 9 | `amc_contracts` | `equipment` | Annual Maintenance Contracts with vendor, coverage, expiry | `gym.gyms` | `20260621_sprint5_equipment` |

### Migration Order

```
Migration 1: 20260621_sprint5_pt
  Order: 1 (independent of equipment)
  Tables: trainers, pt_packages, pt_sessions, commission_rules, commission_payouts

Migration 2: 20260621_sprint5_equipment
  Order: 2 (independent of PT)
  Tables: equipment_catalogue, equipment_instances, maintenance_jobs, amc_contracts
```

Both migrations are **fully independent** of each other and of all existing Sprint 4 tables. They can be applied in either order or in parallel.

### Alignment with Phase 2 Database Plan

The Phase 2 Database Plan specified:
- New schemas per domain ✓ (both `personal_training` and `equipment` are new schemas)
- `billing` schema extension via `entityType` on `payments` ✓
- Additive migrations only ✓
- No changes to existing Sprint 4 tables ✓

The only deviation from the original plan is the addition of `commission_rules` and `commission_payouts` tables (not explicitly called out in Phase 2, but required for E3 revenue activation).

---

## 3. Event Architecture Review

### Why All Events Route Through the `billing` Queue

1. **Event volume is low**: PT sessions and equipment maintenance generate at most hundreds of events per day per tenant. The single `billing` queue handles this comfortably.

2. **Shared ordering guarantee**: All billing-domain events (memberships, supplements, PT, equipment) benefit from the same FIFO ordering within the queue. This matters when a PT session completion triggers both a `payment.completed` and a `commission.earned` event — ordering is preserved.

3. **Operational simplicity**: One consumer (`billingConsumers`) to maintain. One DLQ to monitor. One dead-letter reprocessing workflow. This matches the current operational maturity level.

4. **Existing infrastructure**: All event producers (`publishBillingEvent`, `publishPaymentEvent`) already target the `billing` queue. Adding new queues would require new producers, new consumers, new DLQ setups, and new monitoring.

### When Dedicated Queues Would Be Needed

| Trigger | Recommendation |
|---|---|
| Event volume exceeds 10,000/day | Then split to dedicated queues |
| Events need different processing SLAs | e.g., if maintenance alerts need <1s vs billing can tolerate 5s |
| Team grows to 3+ backend engineers | Domain-aligned queues improve autonomy |

None of these triggers are met for Sprint 5.

### Updated Event Topology

```
                          ┌─────────────────────────────────────────────┐
                          │              BullMQ: billing                │
                          │                                             │
  Producers:              │  Consumers:  billingConsumers               │
                          │                                             │
  publishBillingEvent ────│  • plan.created        (Sprint 4)          │
    (Sprint 4)            │  • plan.updated         (Sprint 4)          │
                          │  • membership.created   (Sprint 4)          │
  publishPaymentEvent ────│  • membership.renewed   (Sprint 4)          │
    (Sprint 4)            │  • membership.updated   (Sprint 4)          │
                          │  • payment.completed    (Sprint 4)          │
  publishBillingEvent ────│  • payment.failed       (Sprint 4)          │
    (Sprint 4 — supp.)    │  • wallet.topup         (Sprint 4)          │
                          │  • supplement.* (6)     (Sprint 4)          │
  publishBillingEvent ────│  • pt.session.* (4)     (Sprint 5 — E3)    │
    (Sprint 5 — E3)       │  • pt.commission.* (2)  (Sprint 5 — E3)    │
                          │  • equipment.* (7)      (Sprint 5 — E4)    │
  publishBillingEvent ────│                                             │
    (Sprint 5 — E4)       │  DLQ: admin read/replay (Sprint 4)         │
                          │  DLQ: + authorize guard (Sprint 4 backlog)  │
                          └─────────────────────────────────────────────┘
                                       │
                          Dead Letter Queue
                          (auto-routed on failure)
```

### Expected Throughput Impact

| Metric | Current (Sprint 4) | Sprint 5 (Projected) |
|---|---|---|
| Distinct event types | 10 | 23 |
| Estimated daily volume | ~500 | ~2,000 |
| Peak per second | ~5 | ~20 |
| Consumer processing time per event | <10ms | <10ms |
| Total daily consumer time | ~5s | ~20s |

The `billing` queue will operate at <1% capacity. No split required.

---

## 4. Revenue Dependency Review

### Revenue Activation Milestones

| Milestone | Epic | Minimum Viable | Depends On |
|---|---|---|---|
| **M1**: PT packages purchasable | E3 | E3.1 + E3.2 | Existing `billing.payments` |
| **M2**: PT sessions trackable | E3 | + E3.3 | M1 + trainers + gym |
| **M3**: Trainer commissions payable | E3 | + E3.4 | M2 |
| **M4**: AMC contracts billable | E4 | E4.1 + E4.2 + E4.4 | Existing `billing.payments` |
| **M5**: Maintenance cost trackable | E4 | + E4.3 | M4 |

### Dependency Map

```
Sprint 4 (Done)               Sprint 5 (Proposed: E3 + Carryover)
┌──────────────────┐          ┌──────────────────────────────────┐
│ billing.payments  │◄────────│ E3.4 Commissions → write payment │
│ (entityType)      │          │                                  │
└──────────────────┘          │ E3.3 PT Sessions → consume       │
                              │    package allowance              │
│ billing event queue │◄───────│ E3.5 PT Events → publish         │
└──────────────────┘          └──────────────────────────────────┘

No dependency on:                                          │
┌──────────────────┐                                       │
│ Supplement Mktpl  │  E3 does not depend on E2 at all      │
│ (E2 — Sprint 4)   │  E4 does not depend on E2 at all      │
└──────────────────┘                                       │

Carryover items are independent track:                     │
┌──────────────────┐                                       │
│ BC-01 RBAC        │  Can be done in parallel with E3      │
│ BC-02 Audit       │  Can be done in parallel with E3      │
│ BC-03 DLQ Auth    │  Can be done in parallel with E3      │
│ BC-04 Pagination  │  Can be done in parallel with E3      │
└──────────────────┘                                       │
```

### Key Finding

**E3 and E4 are independent of each other.** They share no tables, no API endpoints, and no business logic. The only shared infrastructure is the `billing` event queue (and `billing.payments` for revenue recording).

**E3 and E4 do NOT depend on the Supplement Marketplace (E2).**

**Carryover items do NOT block E3 or E4.** They can be parallelized.

---

## 5. Sprint 5 Risk Assessment

### Velocity Comparison

| Sprint | Planned SP | Delivered SP | Velocity |
|---|---|---|---|
| Sprint 4 | ~34 | 34 | 100% |
| Sprint 5 (Plan A) | 47 | ? | Would require 138% |
| Sprint 5 (Proposed) | **26** | ? | **76% — within capacity** |

### Scope Deferral Strategy

If velocity drops mid-Sprint, the following items can be deferred **without breaking the revenue activation milestone**:

| Deferral Priority | Item | Impact if Deferred |
|---|---|---|
| 1 (defer first) | E3.6 — PT Integration Tests | Tests can follow in same Sprint; defer until E3.1–E3.5 are stable |
| 2 | E3.4 — Commissions & Payouts | PT packages + sessions work; commissions is a payment feature |
| 3 | BC-04 — Pagination | Existing list endpoints work without pagination (just not scalable) |
| 4 | BC-03 — DLQ Auth | Existing DLQ works; just not hardened |
| 5 (last resort) | E3.5 — PT Events | Console.log events until queue setup is ready |

### Recommended Minimum Viable Sprint 5 Scope

```
Must Have (18 SP — Sprint 5 Gate Minimum):
  E3.1  Trainer Profiles           3 SP
  E3.2  PT Packages                 5 SP
  E3.3  PT Sessions                 5 SP
  BC-01 Billing RBAC Hardening      2 SP
  BC-02 Audit Logging Completeness  1 SP
  BC-03 DLQ Authorization           1 SP
  BC-04 Pagination                  1 SP

Nice to Have (8 SP — if velocity allows):
  E3.4  Commissions & Payouts      5 SP
  E3.5  PT Events                  2 SP
  E3.6  PT Integration Tests       1 SP
```

This ensures the Sprint 5 Gate can still pass with the backlog conditions resolved, even if commissions and events are deferred.

---

## Updated Sprint 5 Executive Summary

| Metric | Proposed Value |
|---|---|
| **Total SP** | **26 SP** (E3: 21 + Carryover: 5) |
| **Velocity utilization** | 76% (vs 34 SP demonstrated) |
| **E4** | Deferred to Sprint 6 |
| **Risk level** | Low |
| **Gate pass minimum** | 18 SP (E3.1–E3.3 + all carryover items) |

### Revised Scope

| Epic | SP | Deliverables |
|---|---|---|
| **E3 — Personal Training Revenue** | **21** | Trainers, PT packages, PT sessions, commissions, events, tests |
| **Sprint 4 Backlog** | **5** | RBAC hardening, audit logging, DLQ auth, pagination |
| **Sprint 5 Total** | **26** | — |
| **Deferred to Sprint 6** | **21** | E4 — Equipment & AMC Lifecycle |

### Go / No-Go Recommendation

**Decision: GO ✅** (at 26 SP)

**Rationale**:
- 26 SP is within demonstrated Sprint 4 velocity (34 SP) at 76% utilization
- E3 and backlog items have no hard dependencies on each other
- E4 is cleanly deferred to Sprint 6 without architectural impact
- Minimum viable Sprint 5 scope (18 SP) provides a safe fallback
- Sprint 4 conditions (RBAC, audit, DLQ, pagination) will be resolved

**Revised Roadmap**:

```
Sprint 5 (26 SP):  E3 Personal Training + Backlog Carryover
Sprint 6 (21+ SP): E4 Equipment & AMC Lifecycle
Sprint 7:          TBD (next phase)
```

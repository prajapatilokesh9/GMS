# Sprint 5 Planning Review

**Project**: FitCore Pro — Gym Management System
**Sprint**: 5 — Personal Training Revenue & Equipment Lifecycle
**Epic Keys**: E3, E4
**Status**: **For Review** ⏳

---

## 1. Sprint 5 Objectives

Activate two new revenue domains:

| Epic | Objective | Revenue Model |
|---|---|---|
| **E3** — Personal Training Revenue | Enable gyms to sell PT session packages, track trainer-led sessions, and manage trainer commissions | Session packs + per-session billing |
| **E4** — Equipment & AMC Lifecycle | Track gym equipment inventory, maintenance schedules, AMC contracts, and equipment depreciation | AMC contracts + maintenance billing |

Both epics integrate with the existing `billing` schema (`payments` ledger, `billing` event queue) and share the multi-tenancy, RBAC, and audit logging infrastructure built in Sprints 2–4.

---

## 2. Story Breakdown

### E3 — Personal Training Revenue (Estimated: 21 SP)

| Story | ID | SP | Description |
|---|---|---|---|
| E3.1 — Trainer Profiles | E3-01 | 3 | `trainers` table: profile, specializations, certifications, status. CRUD + admin UI |
| E3.2 — PT Package Management | E3-02 | 5 | `pt_packages` table: session counts, price, validity, auto-expiry. CRUD + admin UI |
| E3.3 — PT Session Scheduling | E3-03 | 5 | `pt_sessions` table: trainer→member, package linkage, check-in/check-out. Booking flow + calendar |
| E3.4 — PT Revenue & Commission | E3-04 | 5 | Commission rules per trainer, session→payment ledger integration, payout tracking |
| E3.5 — PT Events & Consumers | E3-05 | 2 | New `personal-training` queue or extend `billing` queue. Events: session.booked, session.completed, commission.earned |
| E3.6 — PT Integration Tests | E3-06 | 1 | 40+ tests across packages, sessions, commissions, RBAC, multi-tenancy, audit |

### E4 — Equipment & AMC Lifecycle (Estimated: 21 SP)

| Story | ID | SP | Description |
|---|---|---|---|
| E4.1 — Equipment Catalogue | E4-01 | 3 | `equipment_catalogue` table: brand, model, category, specs. CRUD + admin UI |
| E4.2 — Equipment Inventory | E4-02 | 5 | `equipment_instances` table: serial number, purchase info, warranty, lifecycle state. CRUD + admin UI |
| E4.3 — Maintenance Tracking | E4-03 | 5 | `maintenance_jobs` table: scheduled/unscheduled, parts, costs, vendor. CRUD + admin UI |
| E4.4 — AMC Contract Management | E4-04 | 5 | `amc_contracts` table: vendor, equipment scope, start/end, renewal. CRUD + admin UI |
| E4.5 — Equipment Events & Consumers | E4-05 | 2 | Events: equipment.deployed, maintenance.due, amc.expiring. Consumers + DLQ coverage |
| E4.6 — Equipment Integration Tests | E4-06 | 1 | 40+ tests across catalogue, inventory, maintenance, AMC, RBAC, multi-tenancy, audit |

### Sprint 4 Backlog Carryover (Estimated: 5 SP)

| Story | ID | SP | Description |
|---|---|---|---|
| S4-B1 — Billing RBAC Hardening | BC-01 | 2 | Review all billing routes for consistent `authorize()` guards |
| S4-B2 — Billing Audit Logging | BC-02 | 1 | Spot-check all billing mutations for audit entries |
| S4-B3 — DLQ Authorization Hardening | BC-03 | 1 | Add `authorize('admin:events')` to DLQ endpoints |
| S4-B4 — Pagination (TD12) | BC-04 | 1 | Add pagination to list endpoints where missing |

**Total Estimated Sprint Capacity: 47 SP** (42 new + 5 carryover)

---

## 3. Database Activation Plan

Both E3 and E4 follow the Sprint 4 pattern: additive migrations only, no destructive changes.

### Schema Strategy

- **E3**: New `personal_training` schema (dedicated domain schema)
- **E4**: New `equipment` schema (dedicated domain schema)
- Both: Extend existing `billing.supplement_orders` if applicable for PT session billing

### E3 — New Tables (`personal_training` schema)

```prisma
model Trainer {
  id               String   @id @default(uuid()) @db.Uuid
  tenantId         String   @map("tenant_id") @db.Uuid
  userId           String   @unique @map("user_id") @db.Uuid  // FK to users
  gymId            String   @map("gym_id") @db.Uuid
  specialization   String?  @db.VarChar(200)
  certifications   Json?    @default("[]")
  bio              String?  @db.Text
  isActive         Boolean  @default(true) @map("is_active")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  tenant Tenant @relation(...)
  user   User   @relation(...)
  gym    Gym    @relation(...)

  @@unique([tenantId, userId])
  @@index([tenantId, gymId, isActive])
  @@map("trainers")
  @@schema("personal_training")
}

model PtPackage {
  id              String   @id @default(uuid()) @db.Uuid
  tenantId        String   @map("tenant_id") @db.Uuid
  gymId           String   @map("gym_id") @db.Uuid
  name            String   @db.VarChar(200)
  slug            String   @db.VarChar(200)
  sessionCount    Int      @map("session_count")
  price           Decimal  @db.Decimal(10, 2)
  validityDays    Int?     @map("validity_days")
  isActive        Boolean  @default(true) @map("is_active")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  tenant Tenant @relation(...)
  gym    Gym    @relation(...)

  @@unique([tenantId, slug])
  @@index([tenantId, gymId, isActive])
  @@map("pt_packages")
  @@schema("personal_training")
}

model PtSession {
  id             String    @id @default(uuid()) @db.Uuid
  tenantId       String    @map("tenant_id") @db.Uuid
  gymId          String    @map("gym_id") @db.Uuid
  trainerId      String    @map("trainer_id") @db.Uuid
  memberId       String    @map("member_id") @db.Uuid
  packageId      String?   @map("package_id") @db.Uuid
  scheduledAt    DateTime  @map("scheduled_at")
  checkedInAt    DateTime? @map("checked_in_at")
  checkedOutAt   DateTime? @map("checked_out_at")
  status         String    @default("scheduled") @db.VarChar(20) // scheduled, completed, cancelled, no_show
  notes          String?   @db.Text
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  tenant  Tenant     @relation(...)
  gym     Gym        @relation(...)
  trainer Trainer    @relation(...)
  member  User       @relation(...)
  package PtPackage? @relation(...)

  @@index([tenantId, gymId, trainerId, scheduledAt])
  @@index([tenantId, memberId, status])
  @@map("pt_sessions")
  @@schema("personal_training")
}

model CommissionRule {
  id            String   @id @default(uuid()) @db.Uuid
  tenantId      String   @map("tenant_id") @db.Uuid
  trainerId     String?  @map("trainer_id") @db.Uuid  // null = default rule for gym
  gymId         String   @map("gym_id") @db.Uuid
  rateType      String   @map("rate_type") @db.VarChar(20) // percentage, fixed
  rateValue     Decimal  @map("rate_value") @db.Decimal(10, 2)
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  tenant  Tenant   @relation(...)
  trainer Trainer? @relation(...)
  gym     Gym      @relation(...)

  @@index([tenantId, gymId, trainerId])
  @@map("commission_rules")
  @@schema("personal_training")
}

model CommissionPayout {
  id              String   @id @default(uuid()) @db.Uuid
  tenantId        String   @map("tenant_id") @db.Uuid
  trainerId       String   @map("trainer_id") @db.Uuid
  sessionId       String   @map("session_id") @db.Uuid
  amount          Decimal  @db.Decimal(10, 2)
  status          String   @default("pending") @db.VarChar(20) // pending, paid
  paidAt          DateTime? @map("paid_at")
  createdAt       DateTime @default(now()) @map("created_at")

  tenant  Tenant   @relation(...)
  trainer Trainer  @relation(...)
  session PtSession @relation(...)

  @@index([tenantId, trainerId, status])
  @@map("commission_payouts")
  @@schema("personal_training")
}
```

### E4 — New Tables (`equipment` schema)

```prisma
model EquipmentCatalogue {
  id          String   @id @default(uuid()) @db.Uuid
  tenantId    String   @map("tenant_id") @db.Uuid
  name        String   @db.VarChar(200)
  category    String   @db.VarChar(100) // cardio, strength, functional, recovery, etc.
  brand       String?  @db.VarChar(100)
  model       String?  @db.VarChar(100)
  specs       Json?    @default("{}")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  tenant Tenant @relation(...)

  @@index([tenantId, category])
  @@map("equipment_catalogue")
  @@schema("equipment")
}

model EquipmentInstance {
  id              String    @id @default(uuid()) @db.Uuid
  tenantId        String    @map("tenant_id") @db.Uuid
  gymId           String    @map("gym_id") @db.Uuid
  catalogueId     String    @map("catalogue_id") @db.Uuid
  serialNumber    String?   @map("serial_number") @db.VarChar(200)
  purchaseDate    DateTime? @map("purchase_date")
  purchasePrice   Decimal?  @map("purchase_price") @db.Decimal(10, 2)
  warrantyExpiry  DateTime? @map("warranty_expiry")
  location        String?   @db.VarChar(200) // gym area / zone
  status          String    @default("ordered") @db.VarChar(20) // ordered, received, deployed, maintenance, retired
  lastMaintenance DateTime? @map("last_maintenance")
  nextMaintenance DateTime? @map("next_maintenance")
  notes           String?   @db.Text
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  tenant    Tenant             @relation(...)
  gym       Gym                @relation(...)
  catalogue EquipmentCatalogue @relation(...)

  @@index([tenantId, gymId, status])
  @@index([catalogueId])
  @@map("equipment_instances")
  @@schema("equipment")
}

model MaintenanceJob {
  id               String    @id @default(uuid()) @db.Uuid
  tenantId         String    @map("tenant_id") @db.Uuid
  gymId            String    @map("gym_id") @db.Uuid
  equipmentId      String    @map("equipment_id") @db.Uuid
  type             String    @db.VarChar(20) // scheduled, unscheduled, warranty
  description      String    @db.Text
  vendorName       String?   @map("vendor_name") @db.VarChar(200)
  cost             Decimal?  @db.Decimal(10, 2)
  partsReplaced    Json?     @default("[]") @map("parts_replaced")
  scheduledDate    DateTime? @map("scheduled_date")
  completedDate    DateTime? @map("completed_date")
  status           String    @default("pending") @db.VarChar(20) // pending, in_progress, completed, cancelled
  notes            String?   @db.Text
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  tenant    Tenant            @relation(...)
  gym       Gym               @relation(...)
  equipment EquipmentInstance @relation(...)

  @@index([tenantId, gymId, status])
  @@index([equipmentId])
  @@map("maintenance_jobs")
  @@schema("equipment")
}

model AmcContract {
  id              String    @id @default(uuid()) @db.Uuid
  tenantId        String    @map("tenant_id") @db.Uuid
  gymId           String    @map("gym_id") @db.Uuid
  vendorName      String    @map("vendor_name") @db.VarChar(200)
  contractNumber  String?   @map("contract_number") @db.VarChar(100)
  startDate       DateTime  @map("start_date")
  endDate         DateTime  @map("end_date")
  amount          Decimal   @db.Decimal(10, 2)
  coverage        Json?     @default("{}")
  status          String    @default("active") @db.VarChar(20) // active, expiring, expired, cancelled
  autoRenew       Boolean   @default(false) @map("auto_renew")
  notes           String?   @db.Text
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  tenant Tenant @relation(...)
  gym    Gym    @relation(...)

  @@index([tenantId, gymId, status])
  @@index([endDate]) // for expiry monitoring
  @@map("amc_contracts")
  @@schema("equipment")
}
```

### Migration Plan

1. `20260621_sprint5_pt_schema` — personal_training schema tables
2. `20260621_sprint5_equipment_schema` — equipment schema tables
3. Applied via `prisma db execute --stdin` | pipeline (same pattern as Sprint 4)
4. Each migration resolved with `prisma migrate resolve --applied <name>`

### New Permissions (`seed.ts`)

```typescript
// E3 — Personal Training
{ name: 'pt:read', category: 'personal_training' },
{ name: 'pt:manage', category: 'personal_training' },
{ name: 'pt:schedule', category: 'personal_training' },
{ name: 'trainer:read', category: 'personal_training' },
{ name: 'trainer:manage', category: 'personal_training' },
{ name: 'commission:read', category: 'personal_training' },
{ name: 'commission:manage', category: 'personal_training' },

// E4 — Equipment & AMC
{ name: 'equipment:read', category: 'equipment' },
{ name: 'equipment:manage', category: 'equipment' },
{ name: 'maintenance:read', category: 'equipment' },
{ name: 'maintenance:manage', category: 'equipment' },
{ name: 'amc:read', category: 'equipment' },
{ name: 'amc:manage', category: 'equipment' },
```

---

## 4. API Expansion Plan

### E3 — Personal Training (14 new endpoints)

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/pt/trainers` | `trainer:read` | List trainers |
| GET | `/api/v1/pt/trainers/:id` | `trainer:read` | Get trainer |
| POST | `/api/v1/pt/trainers` | `trainer:manage` | Create trainer |
| PATCH | `/api/v1/pt/trainers/:id` | `trainer:manage` | Update trainer |
| GET | `/api/v1/pt/packages` | `pt:read` | List PT packages |
| GET | `/api/v1/pt/packages/:id` | `pt:read` | Get PT package |
| POST | `/api/v1/pt/packages` | `pt:manage` | Create PT package |
| PATCH | `/api/v1/pt/packages/:id` | `pt:manage` | Update PT package |
| GET | `/api/v1/pt/sessions` | `pt:read` | List sessions |
| GET | `/api/v1/pt/sessions/:id` | `pt:read` | Get session |
| POST | `/api/v1/pt/sessions` | `pt:schedule` | Book session |
| PATCH | `/api/v1/pt/sessions/:id/checkin` | `pt:schedule` | Check-in |
| PATCH | `/api/v1/pt/sessions/:id/checkout` | `pt:schedule` | Check-out |
| GET | `/api/v1/pt/commissions` | `commission:read` | List commissions/payouts |

### E4 — Equipment & AMC (16 new endpoints)

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/equipment/catalogue` | `equipment:read` | List catalogue |
| POST | `/api/v1/equipment/catalogue` | `equipment:manage` | Create catalogue item |
| GET | `/api/v1/equipment/catalogue/:id` | `equipment:read` | Get catalogue item |
| PATCH | `/api/v1/equipment/catalogue/:id` | `equipment:manage` | Update catalogue item |
| GET | `/api/v1/equipment/instances` | `equipment:read` | List instances |
| POST | `/api/v1/equipment/instances` | `equipment:manage` | Add equipment instance |
| GET | `/api/v1/equipment/instances/:id` | `equipment:read` | Get instance |
| PATCH | `/api/v1/equipment/instances/:id` | `equipment:manage` | Update instance |
| GET | `/api/v1/equipment/maintenance` | `maintenance:read` | List maintenance jobs |
| POST | `/api/v1/equipment/maintenance` | `maintenance:manage` | Create maintenance job |
| GET | `/api/v1/equipment/maintenance/:id` | `maintenance:read` | Get maintenance job |
| PATCH | `/api/v1/equipment/maintenance/:id` | `maintenance:manage` | Update maintenance job |
| GET | `/api/v1/equipment/amc` | `amc:read` | List AMC contracts |
| POST | `/api/v1/equipment/amc` | `amc:manage` | Create AMC contract |
| GET | `/api/v1/equipment/amc/:id` | `amc:read` | Get AMC contract |
| PATCH | `/api/v1/equipment/amc/:id` | `amc:manage` | Update AMC contract |

**Total new endpoints: 30** (cumulative Sprint 5 total: 55)

---

## 5. Event Expansion Plan

### E3 — Personal Training Events

| Event | Queue | Payload | Consumer |
|---|---|---|---|
| `pt.session.booked` | billing | sessionId, trainerId, memberId, scheduledAt | billingConsumers |
| `pt.session.checked_in` | billing | sessionId, trainerId, checkedInAt | billingConsumers |
| `pt.session.completed` | billing | sessionId, trainerId, duration | billingConsumers |
| `pt.session.cancelled` | billing | sessionId, reason | billingConsumers |
| `pt.commission.earned` | billing | payoutId, trainerId, amount | billingConsumers |
| `pt.commission.paid` | billing | payoutId, trainerId, amount, paidAt | billingConsumers |

### E4 — Equipment Events

| Event | Queue | Payload | Consumer |
|---|---|---|---|
| `equipment.deployed` | billing | instanceId, gymId, location | billingConsumers |
| `equipment.maintenance.created` | billing | jobId, equipmentId, type, scheduledDate | billingConsumers |
| `equipment.maintenance.completed` | billing | jobId, equipmentId, cost | billingConsumers |
| `equipment.maintenance.due` | billing | instanceId, equipmentName, nextDate | billingConsumers |
| `equipment.amc.created` | billing | contractId, vendor, startDate, endDate | billingConsumers |
| `equipment.amc.expiring` | billing | contractId, vendor, endDate, daysRemaining | billingConsumers |
| `equipment.retired` | billing | instanceId, reason | billingConsumers |

**Total new events: 13** (cumulative Sprint 5 total: 23)

All events published via existing `publishBillingEvent()` to the `billing` queue, consumed by the expanded `billingConsumers`.

---

## 6. UI Expansion Plan

### E3 — Admin Pages (7 new pages)

| Route | Page Type |
|---|---|
| `/admin/pt/trainers` | Trainer list |
| `/admin/pt/trainers/new` | Create trainer |
| `/admin/pt/trainers/[id]` | Trainer detail/edit |
| `/admin/pt/packages` | PT package list |
| `/admin/pt/packages/new` | Create PT package |
| `/admin/pt/packages/[id]` | PT package detail/edit |
| `/admin/pt/sessions` | Session list + calendar view |

### E4 — Admin Pages (10 new pages)

| Route | Page Type |
|---|---|
| `/admin/equipment/catalogue` | Equipment catalogue list |
| `/admin/equipment/catalogue/new` | Add catalogue item |
| `/admin/equipment/catalogue/[id]` | Catalogue item detail/edit |
| `/admin/equipment/instances` | Equipment inventory list |
| `/admin/equipment/instances/new` | Add equipment instance |
| `/admin/equipment/instances/[id]` | Equipment instance detail + lifecycle |
| `/admin/equipment/maintenance` | Maintenance job list |
| `/admin/equipment/maintenance/[id]` | Maintenance job detail |
| `/admin/equipment/amc` | AMC contract list |
| `/admin/equipment/amc/new` | Create AMC contract |
| `/admin/equipment/amc/[id]` | AMC contract detail/edit |

**Total new UI pages: 17**

### Sidebar Updates

- Add "Personal Training" section (super_admin) — links to trainers, packages, sessions
- Add "Equipment" section (super_admin) — links to catalogue, inventory, maintenance, AMC

---

## 7. Revenue Activation Plan

Both E3 and E4 contribute to the existing `billing.payments` table via `entityType`:

```typescript
// Existing Payment entityType values
'membership'        // Sprint 4
'supplement_order'  // Sprint 4
'pt_session'        // Sprint 5 (E3)
'pt_package'        // Sprint 5 (E3)
'maintenance_job'   // Sprint 5 (E4)
'amc_contract'      // Sprint 5 (E4)
```

### Revenue Flow — E3 (Personal Training)

```
Member buys PT package → payment recorded in billing.payments
  → PT sessions deducted from package allowance
  → Each completed session triggers commission.earned
  → Trainer payouts aggregated for pay period
```

### Revenue Flow — E4 (Equipment / AMC)

```
Gym signs AMC contract → payment recorded in billing.payments
  → Maintenance jobs created against contract
  → Unscheduled maintenance billed separately
  → Equipment depreciation tracked (non-revenue, cost-side)
```

### Wallet Integration

Existing wallet (on `billing.memberships`) can be extended to accept PT session checkouts:
- Session completion deducts from PT package (prepaid) OR wallet balance (pay-per-session)

---

## 8. Dependencies on Sprint 4 Deliverables

| Sprint 4 Deliverable | Used By | Dependency Type |
|---|---|---|
| `billing.payments` table | E3 (session billing), E4 (AMC billing) | Hard — must add entityType values |
| `billing` event queue + consumers | E3 events, E4 events | Hard — extend consumer switch |
| `publishBillingEvent` utility | E3/E4 event producers | Hard — reuse directly |
| JWT auth + `authenticate` middleware | All E3/E4 routes | Hard — no change needed |
| `authorize()` middleware + permission model | All E3/E4 routes | Hard — add new permission names |
| `loadPermissions` middleware | All E3/E4 routes | Hard — no change needed |
| Multi-tenancy (`tenantId` scoping) | All E3/E4 queries | Hard — pattern established |
| Audit logging (`auditService.log`) | All E3/E4 mutations | Hard — reuse directly |
| Admin UI pattern (SidebarLayout, Suspense) | E3/E4 admin pages | Soft — same pattern |
| API client pattern (`lib/api.ts`) | E3/E4 API functions | Soft — extend with new functions |
| Supplement module pattern (validation/service/controller/routes) | E3/E4 domain modules | Soft — architectural template |

### No Hard Blockers

None of the Sprint 4 conditions (backlog items) block Sprint 5 implementation. The carryover items are quality/hardening tasks that can be parallelized.

---

## 9. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Prisma shadow DB corruption persists | High | Medium | Follow same `db execute + resolve` workflow from Sprint 4 |
| PT session scheduling complexity | Medium | Medium | Start with simple CRUD, add calendar integration in follow-up |
| Commission calculation edge cases (partial packages, refunds) | Medium | Medium | Use simple percentage-based commission model initially |
| Equipment maintenance AMC overlap (jobs spanning contracts) | Low | Medium | Allow maintenance job to reference optional AMC contract |
| Sprint 4 carryover items slip again | Medium | Low | Explicitly schedule them as Sprint 5 stories, not background tasks |
| Schema limit — `billing` queue becomes overloaded | Low | Medium | Monitor throughput; split to `personal-training` or `equipment` queues if needed |
| Admin UI page count grows large (17 new) | Low | Low | Batch into 2 milestones: E3 UI first, then E4 UI |

---

## 10. Sprint 5 Acceptance Criteria

### Mandatory (Gate Pass Requirements)

1. [ ] E3.1 — Trainer profiles: CRUD, RBAC, multi-tenancy, audit logging — all tested
2. [ ] E3.2 — PT packages: CRUD, validation, RBAC — all tested
3. [ ] E3.3 — PT sessions: scheduling, check-in/check-out, package deduction — all tested
4. [ ] E3.4 — Commission rules + payout tracking — all tested
5. [ ] E4.1 — Equipment catalogue: CRUD, categories — all tested
6. [ ] E4.2 — Equipment instances: lifecycle states, serial tracking — all tested
7. [ ] E4.3 — Maintenance jobs: CRUD, status flow, cost tracking — all tested
8. [ ] E4.4 — AMC contracts: CRUD, expiry monitoring — all tested
9. [ ] E3 + E4 integration tests: ≥80 tests total
10. [ ] All events published and consumed correctly (verified via tests)
11. [ ] All audit entries created for mutations (verified via tests)
12. [ ] Multi-tenancy isolation verified (cross-tenant rejection tests)
13. [ ] RBAC: unauthorized requests return 401/403 appropriately
14. [ ] Frontend build: `next build` passes with zero errors
15. [ ] Backend build: `tsc --noEmit` passes with zero errors

### Sprint 4 Carryover Conditions (Must Complete)

16. [ ] Billing RBAC hardening — `authorize()` guard review
17. [ ] Billing audit logging completeness — spot-check
18. [ ] DLQ authorization hardening — `authorize('admin:events')` guard
19. [ ] Pagination (TD12) — page/limit on list endpoints

### Gate Review Output

```
Sprint 5 Gate Status: PASS / CONDITIONAL PASS / FAIL
Conditions (if any): ...
```

---

**End of Sprint 5 Planning Review**

**Next Step**: Await acceptance before beginning Sprint 5 implementation (E3.1).

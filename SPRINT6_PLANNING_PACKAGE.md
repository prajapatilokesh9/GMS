# Sprint 6 Planning Package

**Project**: FitCore Pro — Gym Management System
**Sprint**: 6 — Equipment & AMC Lifecycle + Technical Debt
**Epic Keys**: E4
**Status**: **For Review** ⏳

---

## 1. Sprint 6 Objectives

Activate the equipment & AMC revenue domain and close remaining technical debt:

| Epic | Objective | Revenue Model |
|------|-----------|---------------|
| **E4** — Equipment & AMC Lifecycle | Enable gyms to track equipment inventory, maintenance schedules, AMC contracts, and lifecycle states | AMC contracts + maintenance billing |
| **TD** — Technical Debt | Resolve trainer test isolation, rate limiting, consumer tests, DLQ end-to-end coverage | Infrastructure hardening |

E4 integrates with existing `billing` schema (`payments` ledger, `billing` event queue) and shares multi-tenancy, RBAC, and audit logging infrastructure built in Sprints 2–5.

---

## 2. Epic Inventory

### E4 — Equipment & AMC Lifecycle (Estimated: 21 SP)

| Story | ID | SP | Description |
|-------|----|:--:|-------------|
| E4.1 — Equipment Catalogue | E4-01 | 3 | `equipment_catalogue` table: brand, model, category, specs. CRUD + admin UI |
| E4.2 — Equipment Inventory | E4-02 | 5 | `equipment_instances` table: serial number, purchase info, warranty, lifecycle state (ordered→received→deployed→maintenance→retired). CRUD + admin UI |
| E4.3 — Maintenance Tracking | E4-03 | 5 | `maintenance_jobs` table: scheduled/unscheduled/warranty, vendor, costs, parts. CRUD + admin UI |
| E4.4 — AMC Contract Management | E4-04 | 5 | `amc_contracts` table: vendor, equipment scope, start/end, renewal, amount. CRUD + admin UI |
| E4.5 — Equipment Events & Consumers | E4-05 | 2 | Events: equipment.deployed, maintenance.due, amc.expiring. Consumer handlers wired |
| E4.6 — Equipment Integration Tests | E4-06 | 1 | ≥50 tests across CRUD, RBAC, multi-tenancy, validation, lifecycle transitions, events, audit logging (see §8 for full coverage matrix) |

### Technical Debt Backlog (Estimated: 4 SP)

| Story | ID | SP | Priority | Description |
|-------|----|:--:|:--------:|-------------|
| Trainer test data isolation | TD-01 | 1 | High | Add `beforeAll`/`afterAll` cleanup for trainer test suite. Ensure `admin@fitcore.local` trainer record is isolated. Resolve 4 cascade failures. |
| Commission rate limiting | TD-02 | 1 | Low | Add `express-rate-limit` to commission mutation routes following billing pattern. |
| Consumer unit tests | TD-03 | 1 | Low | Unit tests for `billingConsumers.ts` event handlers. Cover all 21+ event types. |
| DLQ end-to-end test | TD-04 | 1 | Low | Integration test verifying DLQ routing on consumer failure and `requeueDLQJob` replay. |

**Total Estimated Sprint Capacity: 25 SP** (21 new + 4 technical debt)

---

## 3. Story Estimates

### E4 — Equipment & AMC Lifecycle

| Story | SP | Breakdown |
|-------|:--:|-----------|
| E4.1 — Equipment Catalogue | 3 | Prisma model + migration + service + controller + routes + validation + 2 UI pages (list, create) + tests |
| E4.2 — Equipment Inventory | 5 | Prisma model + migration + service (lifecycle state machine) + controller + routes + validation + 3 UI pages (list, add, detail with state transitions) + tests |
| E4.3 — Maintenance Tracking | 5 | Prisma model + migration + service (status flow) + controller + routes + validation + 2 UI pages (list, detail) + tests |
| E4.4 — AMC Contract Management | 5 | Prisma model + migration + service (expiry monitoring) + controller + routes + validation + 2 UI pages (list, create, detail) + tests |
| E4.5 — Equipment Events & Consumers | 2 | 7 event types published to `billing` queue. Consumer handlers. DLQ coverage. |
| E4.6 — Equipment Integration Tests | 1 | 40+ tests across all E4 sub-modules. RBAC, multi-tenancy, validation, events, audit. |

### Technical Debt

| Story | SP | Effort |
|-------|:--:|--------|
| TD-01 — Trainer test isolation | 1 | Fix `beforeAll` to clean up orphaned trainer record. Add tenant-scoped test data factory. Verify standalone execution. |
| TD-02 — Commission rate limiting | 1 | Add import + middleware to 7 commission mutation routes. Test rate limit triggers. |
| TD-03 — Consumer unit tests | 1 | Create `billingConsumers.unit.test.ts`. Mock `logger`. 21+ test cases for event payload parsing. |
| TD-04 — DLQ end-to-end test | 1 | Integration test simulating worker failure → DLQ routing → requeue → success. |

---

## 4. Database Activation Plan

### Schema Strategy

- **E4**: New `equipment` schema (dedicated domain schema)
- All tables follow established patterns: `tenantId` FK cascade, UUID PKs, snake_case `@map`, Decimal(10,2) for monetary values, audit timestamps

### E4 — New Tables (`equipment` schema)

```prisma
model EquipmentCatalogue {
  id               String    @id @default(uuid()) @db.Uuid
  tenantId         String    @map("tenant_id") @db.Uuid
  name             String    @db.VarChar(200)
  sku              String    @db.VarChar(100)
  brand            String    @db.VarChar(100)
  model            String    @db.VarChar(100)
  category         String    @db.VarChar(100)
  subcategory      String?   @db.VarChar(100)
  specs            Json?     @default("{}")
  unitCost         Decimal   @db.Decimal(10, 2)
  warrantyMonths   Int?      @default(12)
  isActive         Boolean   @default(true) @map("is_active")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")
  deletedAt        DateTime? @map("deleted_at")

  // Flag semantics:
  //   isActive  = business visibility flag (inactive items hidden from non-admin users)
  //   deletedAt = soft delete flag (records excluded from ALL application queries)

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  instances EquipmentInstance[]

  @@index([tenantId, category])
  @@index([tenantId, subcategory])
  @@index([brand, model])
  @@index([sku])
  @@unique([tenantId, brand, model])
  @@unique([tenantId, sku])
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
  location        String?   @db.VarChar(200)
  status          String    @default("ordered") @db.VarChar(20)
  lastMaintenance DateTime? @map("last_maintenance")
  nextMaintenance DateTime? @map("next_maintenance")
  notes           String?   @db.Text
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  tenant    Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  gym       Gym                @relation(fields: [gymId], references: [id])
  catalogue EquipmentCatalogue @relation(fields: [catalogueId], references: [id])
  maintenanceJobs MaintenanceJob[]
  contracts AmcContractEquipment[]

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
  type             String    @db.VarChar(20)
  description      String    @db.Text
  vendorName       String?   @map("vendor_name") @db.VarChar(200)
  cost             Decimal?  @db.Decimal(10, 2)
  partsReplaced    Json?     @default("[]") @map("parts_replaced")
  scheduledDate    DateTime? @map("scheduled_date")
  completedDate    DateTime? @map("completed_date")
  status           String    @default("pending") @db.VarChar(20)
  notes            String?   @db.Text
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  tenant    Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  gym       Gym               @relation(fields: [gymId], references: [id])
  equipment EquipmentInstance @relation(fields: [equipmentId], references: [id])

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
  status          String    @default("active") @db.VarChar(20)
  autoRenew       Boolean   @default(false) @map("auto_renew")
  notes           String?   @db.Text
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  gym    Gym    @relation(fields: [gymId], references: [id])
  equipmentCoverage AmcContractEquipment[]

  @@index([tenantId, gymId, status])
  @@index([endDate])
  @@map("amc_contracts")
  @@schema("equipment")
}

model AmcContractEquipment {
  id          String   @id @default(uuid()) @db.Uuid
  contractId  String   @map("contract_id") @db.Uuid
  equipmentId String   @map("equipment_id") @db.Uuid
  createdAt   DateTime @default(now()) @map("created_at")

  contract  AmcContract       @relation(fields: [contractId], references: [id], onDelete: Cascade)
  equipment EquipmentInstance @relation(fields: [equipmentId], references: [id], onDelete: Cascade)

  @@unique([contractId, equipmentId])
  @@map("amc_contract_equipment")
  @@schema("equipment")
}
```

### Migration Plan

1. `202606xx_sprint6_equipment_schema` — equipment schema tables (catalogue, instances, maintenance, AMC, junction)
2. Applied via `prisma db execute --stdin` | pipeline (same pattern as Sprint 4 & 5)
3. Each migration resolved with `prisma migrate resolve --applied <name>`

### Migration SQL

```sql
-- Create equipment schema
CREATE SCHEMA IF NOT EXISTS equipment;

-- Create equipment_catalogue table
CREATE TABLE equipment.equipment_catalogue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  specs JSONB DEFAULT '{}'::jsonb,
  unit_cost DECIMAL(10, 2) NOT NULL,
  warranty_months INT DEFAULT 12,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Foreign key to tenant
  CONSTRAINT fk_equipment_catalogue_tenant
    FOREIGN KEY (tenant_id) REFERENCES public.tenant(id)
    ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_equipment_catalogue_tenant_category ON equipment.equipment_catalogue (tenant_id, category);
CREATE INDEX idx_equipment_catalogue_tenant_subcategory ON equipment.equipment_catalogue (tenant_id, subcategory);
CREATE INDEX idx_equipment_catalogue_brand_model ON equipment.equipment_catalogue (brand, model);
CREATE INDEX idx_equipment_catalogue_sku ON equipment.equipment_catalogue (sku);

-- Unique constraints
ALTER TABLE equipment.equipment_catalogue
ADD CONSTRAINT uq_tenant_brand_model UNIQUE (tenant_id, brand, model);

ALTER TABLE equipment.equipment_catalogue
ADD CONSTRAINT uq_tenant_sku UNIQUE (tenant_id, sku);
```

### New Permissions (`seed.ts` additions)

```typescript
// E4 — Equipment & AMC
{ name: 'equipment:read', category: 'equipment' },
{ name: 'equipment:manage', category: 'equipment' },
{ name: 'maintenance:read', category: 'equipment' },
{ name: 'maintenance:manage', category: 'equipment' },
{ name: 'amc:read', category: 'equipment' },
{ name: 'amc:manage', category: 'equipment' },
```

---

## 5. API Expansion Plan

### E4 — Equipment & AMC (16 new endpoints)

| Method | Path | Permission | Description |
|--------|------|:----------:|-------------|
| GET | `/api/v1/equipment/catalogue` | `equipment:read` | List catalogue items |
| POST | `/api/v1/equipment/catalogue` | `equipment:manage` | Create catalogue item |
| GET | `/api/v1/equipment/catalogue/:id` | `equipment:read` | Get catalogue item |
| PATCH | `/api/v1/equipment/catalogue/:id` | `equipment:manage` | Update catalogue item |
| GET | `/api/v1/equipment/instances` | `equipment:read` | List equipment instances |
| POST | `/api/v1/equipment/instances` | `equipment:manage` | Add equipment instance |
| GET | `/api/v1/equipment/instances/:id` | `equipment:read` | Get instance detail |
| PATCH | `/api/v1/equipment/instances/:id` | `equipment:manage` | Update instance + lifecycle transition |
| GET | `/api/v1/equipment/maintenance` | `maintenance:read` | List maintenance jobs |
| POST | `/api/v1/equipment/maintenance` | `maintenance:manage` | Create maintenance job |
| GET | `/api/v1/equipment/maintenance/:id` | `maintenance:read` | Get maintenance job |
| PATCH | `/api/v1/equipment/maintenance/:id` | `maintenance:manage` | Update maintenance job |
| GET | `/api/v1/equipment/amc` | `amc:read` | List AMC contracts |
| POST | `/api/v1/equipment/amc` | `amc:manage` | Create AMC contract |
| GET | `/api/v1/equipment/amc/:id` | `amc:read` | Get AMC contract |
| PATCH | `/api/v1/equipment/amc/:id` | `amc:manage` | Update AMC contract |

**Total new endpoints: 16** (cumulative Sprint 6 total: 78)

---

## 6. Event Expansion Plan

### Authoritative Event Inventory (grouped by queue)

**Current: 36 events across 5 queues. Sprint 6 adds 7 → 43 total.**

#### Queue: `auth` (3 events)

| Event | Producer | Consumer |
|-------|----------|----------|
| `user.registered` | auth.service.ts | authEventsConsumer |
| `user.logged_in` | auth.service.ts | authEventsConsumer |
| `user.password_reset_requested` | auth.service.ts | authEventsConsumer |

#### Queue: `gym` (4 events)

| Event | Producer | Consumer |
|-------|----------|----------|
| `gym.documents_uploaded` | gym-document.service.ts | notificationConsumers (gym) |
| `gym.verification_status_changed` | gym.service.ts | notificationConsumers (gym) |
| `gym.staff_added` | gym.service.ts | notificationConsumers (gym) |
| `gym.staff_removed` | gym.service.ts | notificationConsumers (gym) |

#### Queue: `user` (1 event)

| Event | Producer | Consumer |
|-------|----------|----------|
| `user.profile_updated` | gymEvents.ts (defined, not yet wired) | notificationConsumers (user) |

#### Queue: `notification` (3 events)

| Event | Producer | Consumer |
|-------|----------|----------|
| `notification.email.required` | gymEvents.ts (defined, not yet wired) | notificationConsumers (notification) |
| `notification.sms.required` | gymEvents.ts (defined, not yet wired) | notificationConsumers (notification) |
| `notification.push.required` | gymEvents.ts (defined, not yet wired) | notificationConsumers (notification) |

#### Queue: `billing` — Existing (25 events)

| Group | Events | Producer Service |
|-------|--------|------------------|
| **Plans** (2) | `plan.created`, `plan.updated` | billing.service.ts |
| **Memberships** (3) | `membership.created`, `membership.updated`, `membership.renewed` | billing.service.ts |
| **Wallet** (1) | `wallet.topup` | billing.service.ts |
| **Payments** (2) | `payment.completed`, `payment.failed` | billing.service.ts |
| **Supplement Companies** (2) | `supplement.company.created`, `supplement.company.updated` | supplement.service.ts |
| **Supplements** (2) | `supplement.created`, `supplement.updated` | supplement.service.ts |
| **Supplement Orders** (2) | `supplement.order.created`, `supplement.order.updated` | supplement.service.ts |
| **Trainers** (2) | `pt.trainer.created`, `pt.trainer.updated` | trainer.service.ts |
| **PT Packages** (2) | `pt.package.created`, `pt.package.updated` | ptPackage.service.ts |
| **PT Sessions** (4) | `pt.session.created`, `pt.session.started`, `pt.session.completed`, `pt.session.cancelled` | ptSession.service.ts |
| **Commission** (3) | `pt.commission.generated`, `pt.commission.approved`, `pt.commission.paid` | commission.service.ts |

#### Queue: `billing` — Sprint 6 Additions (7 new → 32 total on billing queue)

| Event | Payload | Producer |
|-------|---------|----------|
| `equipment.instance.created` | instanceId, gymId, catalogueId, status | equipment.service.ts |
| `equipment.instance.deployed` | instanceId, gymId, location, deployedAt | equipment.service.ts |
| `equipment.maintenance.created` | jobId, equipmentId, type, scheduledDate | equipment.service.ts |
| `equipment.maintenance.completed` | jobId, equipmentId, cost, completedDate | equipment.service.ts |
| `equipment.maintenance.due` | instanceId, equipmentName, nextMaintenanceDate | equipment.service.ts |
| `equipment.amc.created` | contractId, vendor, startDate, endDate, amount | equipment.service.ts |
| `equipment.amc.expiring` | contractId, vendor, endDate, daysRemaining | equipment.service.ts |

All Sprint 6 events published via existing `publishBillingEvent()` to the `billing` queue, consumed by the expanded `billingConsumers`.

---

## 7. Revenue Mapping

E4 contributes to the existing `billing.payments` table via `entityType`:

```typescript
// Payment entityType values (cumulative)
'membership'        // Sprint 4
'supplement_order'  // Sprint 4
'pt_session'        // Sprint 5
'pt_package'        // Sprint 5
'maintenance_job'   // Sprint 6 (E4)
'amc_contract'      // Sprint 6 (E4)
```

### AMC Lifecycle Clarification

#### 1. Contract State Machine

```
active → expiring (30 days before endDate) → expired
active → cancelled (manual, only if no pending maintenance)
active → renewed (manual or autoRenew)
```

| State | Meaning | Allowed Transitions |
|-------|---------|---------------------|
| `active` | Contract in force, maintenance covered | → `expiring`, `cancelled`, `renewed` |
| `expiring` | Within 30-day expiry window | → `expired`, `renewed` |
| `expired` | Past endDate, no longer covers maintenance | → `renewed` (new contract) |
| `cancelled` | Manually terminated | — (terminal) |

#### 2. Renewal Flow

- **Auto-renew** (`autoRenew = true`): On `endDate` expiry, system automatically extends by original `durationDays`. New `startDate` = old `endDate + 1`. New `endDate` = `startDate + durationDays`. Status remains `active`. A new `payment` record is created for the renewal amount.
- **Manual renew** (`autoRenew = false`): Admin clicks "Renew" on contract detail page. Creates new contract period (new `startDate`/`endDate`) with optionally updated `amount`. A new `payment` record is created.
- Renewal triggers `equipment.amc.renewed` event.

#### 3. Expiry Workflow

- System checks `endDate` daily via a scheduled check (or on-demand via admin report).
- When `endDate - today <= 30 days`: status transitions to `expiring`.
- When `today > endDate`: status transitions to `expired`.
- `expiring` / `expired` contracts do NOT block maintenance job creation — maintenance can be logged without active AMC coverage (billed separately).

#### 4. Reminder Strategy

| Trigger | Action | Channel |
|---------|--------|---------|
| `endDate - 30 days` | Status → `expiring`, publish `equipment.amc.expiring` event | Event (billling queue) |
| `endDate - 14 days` | (Future) Email reminder to gym admin | Notification queue (future) |
| `endDate` | Status → `expired` if not renewed | System-side only |

The `reminder` column is a calculated virtual field — not a stored DB column. The `equipment.amc.expiring` event carries `daysRemaining` computed at publish time.

#### 5. Payment Linkage

- AMC contracts reference `billing.payments` via `entityType = 'amc_contract'` and `entityId = contract.id`.
- Each contract period (initial + each renewal) creates one `payment` record.
- Payment status (`pending`/`completed`/`failed`) does NOT gate contract activation — contracts are `active` on creation. Payment reconciliation is a separate workflow.

### Revenue Flow — E4 (Equipment / AMC)

```
Gym signs AMC contract → payment recorded in billing.payments (entityType: 'amc_contract')
  → Equipment instances linked via amc_contract_equipment junction table
  → Scheduled maintenance covered by active contract (no separate billing)
  → Unscheduled maintenance billed separately via billing.payments (entityType: 'maintenance_job')
  → Renewal creates new payment record; endDate monitoring drives lifecycle
  → Equipment cost-side tracking (depreciation, non-revenue)
```

### Wallet Integration

Existing wallet on `billing.memberships` can accept PT session checkouts (from E3, Sprint 5). No wallet changes needed for E4 — AMC and maintenance billing go through `billing.payments` directly.

---

## 8. Acceptance Criteria

### Mandatory (Gate Pass Requirements)

1. [ ] E4.1 — Equipment catalogue: CRUD, categories, RBAC, multi-tenancy, validation — all tested
2. [ ] E4.2 — Equipment instances: lifecycle state machine (ordered→received→deployed→maintenance→retired), serial tracking, purchase records — all tested
3. [ ] E4.3 — Maintenance jobs: CRUD, status flow (pending→in_progress→completed→cancelled), vendor/cost tracking — all tested
4. [ ] E4.4 — AMC contracts: CRUD, equipment coverage (junction table), expiry monitoring, renewal, auto-renew flag, reminder trigger — all tested
5. [ ] E4.5 — Equipment events: 7 events published and consumed correctly (verified via tests)
6. [ ] E4.6 — Equipment integration tests: ≥50 integration tests across the following explicit coverage areas:
     - **CRUD** — Each table: create, read, update, delete with valid/invalid payloads
     - **RBAC** — Unauthorized requests return 401 (no token) or 403 (wrong permission) per route
     - **Multi-tenancy** — Cross-tenant isolation: Tenant A cannot read/write Tenant B data
     - **Validation** — Invalid inputs rejected (bad UUIDs, missing required fields, constraint violations, negative Decimal)
     - **Lifecycle transitions** — State machine transitions tested (invalid transitions rejected, valid transitions succeed with audit entries)
     - **Events** — Each of the 7 equipment events is emitted on correct trigger with correct payload shape
     - **Audit logging** — Every mutation (create/update/delete/transition) creates an audit log entry with correct `entityType`, `entityId`, `action`, `userId`, `tenantId`
7. [ ] All audit entries created for mutations (verified via tests)
8. [ ] Multi-tenancy isolation verified (cross-tenant rejection tests)
9. [ ] RBAC: unauthorized requests return 401/403 appropriately
10. [ ] Frontend build: `next build` passes with zero errors
11. [ ] Backend build: `tsc --noEmit` passes with zero errors

### Technical Debt Acceptance Criteria

12. [ ] TD-01: Trainer suite runs 27/27 with zero pre-existing cascade failures
13. [ ] TD-02: Commission mutation routes rate-limited (100 req/min); rate limit test added
14. [ ] TD-03: Consumer unit tests added for `billingConsumers.ts` — 21+ event type coverage
15. [ ] TD-04: DLQ end-to-end test verifies job failure → DLQ → requeue → consumption

---

## 9. Risks

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|------------|
| Prisma shadow DB corruption persists | High | Medium | Follow same `db execute + resolve` workflow from Sprint 4/5 |
| Equipment lifecycle state machine complexity (5 states, transitions with guards) | Medium | Medium | Model after PT session status transitions; define explicit transition map |
| AMC contract-equipment M:N relationship complexity | Medium | Medium | Junction table (`amc_contract_equipment`) with unique constraint; keep coverage as JSON fallback |
| E4 scope large (21 SP) + 4 TD items (4 SP) = 25 SP total | Medium | Medium | Stage TD items as parallel workstream; defer low-priority TD if capacity constrained |
| Admin UI page count grows large (10 new E4 pages) | Low | Low | Batch into 2 milestones: catalogue + inventory first, then maintenance + AMC |
| `billing` queue throughput (32+ event types) | Low | Medium | Monitor; split to dedicated `equipment` queue if needed post-Sprint 6 |

---

## 10. Dependencies

### On Sprint 5 Deliverables

| Sprint 5 Deliverable | Used By | Dependency Type |
|----------------------|---------|:---------------:|
| `billing.payments` table | E4 (AMC billing, maintenance billing) | Hard — add entityType values |
| `billing` event queue + consumers | E4 events | Hard — extend consumer switch |
| `publishBillingEvent` utility | E4 event producers | Hard — reuse directly |
| JWT auth + `authenticate` middleware | All E4 routes | Hard — no change needed |
| `authorize()` middleware + permission model | All E4 routes | Hard — add new equipment permission names |
| `loadPermissions` middleware | All E4 routes | Hard — no change needed |
| Multi-tenancy (`tenantId` scoping) | All E4 queries | Hard — pattern established |
| Audit logging (`auditService.log`) | All E4 mutations | Hard — reuse directly |
| Admin UI pattern (SidebarLayout, Suspense) | E4 admin pages | Soft — same pattern |
| PT Session lifecycle patterns | Equipment lifecycle state machine | Soft — architectural template |

### External

| Dependency | Required For | Status |
|------------|-------------|:------:|
| PostgreSQL 18 with `equipment` schema | All E4 tables | ✅ Available |
| Redis + BullMQ | Event publishing/consuming | ✅ Available |
| Prisma client generation | After migration | ⚠️ Shadow DB workaround needed |

---

## 11. Delivery Sequence

### Milestone 1: Foundation (Week 1)

| Day | Deliverable | Dependencies |
|:---:|-------------|:------------:|
| 1–2 | E4.1 — Equipment Catalogue (Prisma + migration + backend + UI) | None |
| 3–5 | E4.2 — Equipment Inventory (Prisma + migration + lifecycle + backend + UI) | E4.1 |
| 5 | TD-01 — Trainer test isolation (parallel workstream) | None |

**Milestone 1 Gate**: Catalogue + Inventory CRUD working, trainer tests passing.

### Milestone 2: Operations (Week 2)

| Day | Deliverable | Dependencies |
|:---:|-------------|:------------:|
| 6–7 | E4.3 — Maintenance Tracking (Prisma + migration + backend + UI) | E4.2 |
| 8–9 | E4.4 — AMC Contracts (Prisma + migration + backend + UI) | E4.2 |
| 9 | TD-02 — Commission rate limiting (parallel workstream) | None |

**Milestone 2 Gate**: Maintenance + AMC CRUD working.

### Milestone 3: Integration (Week 3)

| Day | Deliverable | Dependencies |
|:---:|-------------|:------------:|
| 10 | E4.5 — Equipment Events & Consumers | E4.1–E4.4 |
| 10 | TD-03 — Consumer unit tests (parallel) | E4.5 |
| 11–12 | E4.6 — Equipment Integration Tests | E4.1–E4.5 |
| 11 | TD-04 — DLQ end-to-end test (parallel) | None |
| 12–13 | Sprint 6 Gate Review preparation | All |
| 13 | Sprint 6 Gate Review | All |

**Milestone 3 Gate**: All tests passing, builds clean.

---

### Acceptance Criteria Checklist

```
Mandatory:
[ ] E4.1 Equipment catalogue CRUD
[ ] E4.2 Equipment instances lifecycle
[ ] E4.3 Maintenance job tracking
[ ] E4.4 AMC contract management (incl. renewal, expiry, reminders, payments)
[ ] E4.5 Equipment events published + consumed
[ ] E4.6 ≥50 equipment integration tests covering: CRUD | RBAC | Multi-tenancy | Validation | Lifecycle transitions | Events | Audit logging
[ ] Audit logging on all mutations
[ ] Multi-tenancy isolation
[ ] RBAC enforcement
[ ] Frontend build (next build)
[ ] Backend build (tsc --noEmit)

Technical Debt:
[ ] TD-01 Trainer 27/27 tests passing
[ ] TD-02 Commission rate limiting
[ ] TD-03 Consumer unit tests
[ ] TD-04 DLQ end-to-end test
```

---

## E4.1 Design Note — Equipment Catalogue

### 1. Equipment Lifecycle State Machine

| State | Entry Conditions | Exit Conditions | Valid Transitions |
|-------|------------------|-----------------|-------------------|
| **ordered** | Equipment created in catalogue, status = "ordered" | Purchase confirmed, serial assigned | → `received` |
| **received** | Physical receipt confirmed, serial verified | Equipment deployed to gym | → `deployed` |
| **deployed** | Equipment active in gym, operational | Maintenance scheduled or retired | → `maintenance`, `retired` |
| **maintenance** | Maintenance job created/completed | Equipment operational or retired | → `deployed`, `retired` |
| **retired** | Equipment decommissioned, removed from service | Final audit entry created | — (terminal) |

**Transition Guards:**
- `ordered → received`: Requires `serialNumber` not null, `purchaseDate` not null
- `received → deployed`: Requires `status = "deployed"` and `gymId` assigned
- `deployed → maintenance`: Requires maintenance job with status `completed`
- `deployed → retired`: Requires `equipmentId` not referenced in active AMC contracts
- `maintenance → deployed`: Requires maintenance job status `completed`
- `maintenance → retired`: Requires equipment not critical for active contracts

### 2. AMC Lifecycle State Machine

| State | Entry Conditions | Exit Conditions | Valid Transitions |
|-------|------------------|-----------------|-------------------|
| **active** | Contract created, startDate ≤ today ≤ endDate | Expiry reached or cancelled | → `expiring`, `cancelled` |
| **expiring** | `endDate - today ≤ 30 days` | Expiry reached or renewed | → `expired`, `renewed` |
| **expired** | `today > endDate` | Renewal processed | → `renewed` |
| **renewed** | New contract period created | New expiry date reached | → `active` |
| **cancelled** | Manually terminated | Final audit entry created | — (terminal) |

**Transition Guards:**
- `active → expiring`: Triggered automatically when `endDate - today ≤ 30`
- `active → cancelled`: Requires no pending maintenance jobs
- `expiring → expired`: Automatic on `today > endDate`
- `expiring → renewed`: Manual or auto-renew based on `autoRenew` flag
- `expired → renewed`: Requires new contract creation
- `renewed → active`: Automatic on new `startDate`

### 3. Maintenance Lifecycle State Machine

| State | Entry Conditions | Exit Conditions | Valid Transitions |
|-------|------------------|-----------------|-------------------|
| **scheduled** | Maintenance job created, status = "scheduled" | Job start time reached | → `in_progress` |
| **in_progress** | Technician assigned, work started | Work completed or paused | → `completed`, `cancelled` |
| **completed** | All work verified, cost recorded | Equipment returned to service | → `deployed` (if equipment exists) |
| **cancelled** | Job cancelled before completion | Final audit entry created | — (terminal) |

**Transition Guards:**
- `scheduled → in_progress`: Requires `scheduledDate ≤ today`
- `in_progress → completed`: Requires `completedDate` set and `cost` recorded
- `in_progress → cancelled`: Manual cancellation allowed
- `completed → deployed`: Automatic if equipment exists and not retired

### 4. Financial Integrity Rules

#### 4.1 Active AMC Uniqueness Rules
```sql
-- One active AMC contract per gym-equipment combination
CREATE UNIQUE INDEX idx_active_amc_gym_equipment 
ON amc_contracts (gym_id, equipment_id) 
WHERE status = 'active';
```

**Constraints:**
- Cannot create new active AMC contract for equipment already covered
- Renewal creates new contract, old expires then new becomes active
- Equipment retirement requires breaking all active AMC contracts first

#### 4.2 Renewal Rules
- **Auto-renew**: If `autoRenew = true`, system automatically creates new contract on expiry
- **Manual renew**: Admin must explicitly create new contract before expiry
- **Grace period**: 30-day expiry window allows time for manual renewal
- **Payment linkage**: Each renewal creates new `payment` record with `entityType: 'amc_contract'`

#### 4.3 Payment Linkage Rules
```sql
-- Payments linked to AMC contracts
ALTER TABLE billing.payments 
ADD CONSTRAINT fk_amc_contract 
FOREIGN KEY (entity_id) REFERENCES equipment.amc_contracts(id)
WHERE entity_type = 'amc_contract';
```

**Rules:**
- AMC contract creation requires corresponding payment record
- Payment status (`pending`/`completed`/`failed`) does NOT gate contract activation
- Renewal creates new payment record, old payment remains linked to old contract
- Maintenance costs billed separately via `entityType: 'maintenance_job'`

#### 4.4 Equipment Retirement Constraints
```sql
-- Prevent retirement while equipment has active coverage
CREATE FUNCTION can_retire_equipment() RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM equipment.amc_contracts 
    WHERE equipment_id = OLD.id AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Cannot retire equipment with active AMC coverage';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;
```

**Constraints:**
- Equipment cannot be retired if referenced in active AMC contracts
- Must cancel/expire all AMC contracts before retirement
- Equipment in maintenance cannot be retired until maintenance completed

#### 4.5 Maintenance Cost Constraints
```sql
-- Validate maintenance cost ranges
ALTER TABLE equipment.maintenance_jobs
ADD CONSTRAINT chk_maintenance_cost
CHECK (cost IS NULL OR cost >= 0);
```

**Constraints:**
- Maintenance costs must be non-negative
- Cost can be null for non-billed maintenance (e.g., warranty)
- Cost recorded at completion, not at scheduling

### 5. Audit Requirements

**5.1 Required Audit Fields**
```typescript
interface AuditEntry {
  id: string;
  tenantId: string;
  entityType: 'equipment_catalogue' | 'equipment_instance' | 
             'maintenance_job' | 'amc_contract' | 
             'amc_contract_equipment';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATE_TRANSITION';
  userId: string;
  changes: Json;
  previousState: Json;
  newState: Json;
  createdAt: DateTime;
}
```

**5.2 Mandatory Audit Events**
- **Equipment Catalogue**: CREATE, UPDATE, DELETE
- **Equipment Instances**: CREATE, UPDATE, DELETE, STATE_TRANSITION
- **Maintenance Jobs**: CREATE, UPDATE, DELETE, STATE_TRANSITION
- **AMC Contracts**: CREATE, UPDATE, DELETE, STATE_TRANSITION
- **AMC-Equipment Junction**: CREATE, DELETE

**5.3 Audit Log Structure**
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "entityType": "equipment_instance",
  "entityId": "uuid",
  "action": "STATE_TRANSITION",
  "userId": "uuid",
  "changes": {
    "from": {"status": "deployed"},
    "to": {"status": "maintenance"}
  },
  "previousState": {"status": "deployed", "location": "gym-a"},
  "newState": {"status": "maintenance", "jobId": "job-123"},
  "createdAt": "2026-06-20T10:30:00Z"
}
```

### 6. Event Publication Matrix

| Source | Event Type | Queue | Payload | Consumer | Trigger |
|--------|------------|-------|---------|----------|---------|
| **Equipment Catalogue** | `equipment.catalogue.created` | billing | catalogueId, name, category, tenantId | billingConsumers | CREATE |
| **Equipment Catalogue** | `equipment.catalogue.updated` | billing | catalogueId, changes, tenantId | billingConsumers | UPDATE |
| **Equipment Catalogue** | `equipment.catalogue.deleted` | billing | catalogueId, tenantId | billingConsumers | DELETE |

| **Equipment Instances** | `equipment.instance.created` | billing | instanceId, catalogueId, gymId, status, tenantId | billingConsumers | CREATE |
| **Equipment Instances** | `equipment.instance.updated` | billing | instanceId, changes, tenantId | billingConsumers | UPDATE |
| **Equipment Instances** | `equipment.instance.deleted` | billing | instanceId, tenantId | billingConsumers | DELETE |
| **Equipment Instances** | `equipment.instance.received` | billing | instanceId, serialNumber, purchaseDate, tenantId | billingConsumers | STATE_TRANSITION |
| **Equipment Instances** | `equipment.instance.deployed` | billing | instanceId, location, tenantId | billingConsumers | STATE_TRANSITION |
| **Equipment Instances** | `equipment.instance.maintenance` | billing | instanceId, jobId, tenantId | billingConsumers | STATE_TRANSITION |
| **Equipment Instances** | `equipment.instance.retired` | billing | instanceId, reason, tenantId | billingConsumers | STATE_TRANSITION |

| **Maintenance Jobs** | `equipment.maintenance.created` | billing | jobId, equipmentId, type, scheduledDate, tenantId | billingConsumers | CREATE |
| **Maintenance Jobs** | `equipment.maintenance.updated` | billing | jobId, changes, tenantId | billingConsumers | UPDATE |
| **Maintenance Jobs** | `equipment.maintenance.deleted` | billing | jobId, tenantId | billingConsumers | DELETE |
| **Maintenance Jobs** | `equipment.maintenance.scheduled` | billing | jobId, equipmentId, scheduledDate, tenantId | billingConsumers | STATE_TRANSITION |
| **Maintenance Jobs** | `equipment.maintenance.in_progress` | billing | jobId, technicianId, tenantId | billingConsumers | STATE_TRANSITION |
| **Maintenance Jobs** | `equipment.maintenance.completed` | billing | jobId, cost, completedDate, tenantId | billingConsumers | STATE_TRANSITION |
| **Maintenance Jobs** | `equipment.maintenance.cancelled` | billing | jobId, reason, tenantId | billingConsumers | STATE_TRANSITION |

| **AMC Contracts** | `equipment.amc.created` | billing | contractId, vendor, startDate, endDate, amount, tenantId | billingConsumers | CREATE |
| **AMC Contracts** | `equipment.amc.updated` | billing | contractId, changes, tenantId | billingConsumers | UPDATE |
| **AMC Contracts** | `equipment.amc.deleted` | billing | contractId, tenantId | billingConsumers | DELETE |
| **AMC Contracts** | `equipment.amc.expiring` | billing | contractId, vendor, endDate, daysRemaining, tenantId | billingConsumers | STATE_TRANSITION |
| **AMC Contracts** | `equipment.amc.renewed` | billing | oldContractId, newContractId, tenantId | billingConsumers | STATE_TRANSITION |
| **AMC Contracts** | `equipment.amc.cancelled` | billing | contractId, reason, tenantId | billingConsumers | STATE_TRANSITION |

**Event Publishing Pattern:**
- All events published via existing `publishBillingEvent()` utility
- Event payload includes `tenantId` for multi-tenancy isolation
- Event consumers are the expanded `billingConsumers.ts`
- Events include full state changes for audit and downstream processing

### Design Note Review

**Review Required:**
- [ ] State machine transition logic validated
- [ ] Financial integrity rules tested
- [ ] Audit requirements implemented
- [ ] Event publication matrix verified
- [ ] Multi-tenancy isolation confirmed
- [ ] RBAC integration checked

**Next Step:** After E4.1 Design Note review is accepted, begin E4.1 Equipment Catalogue implementation.

---

**End of Sprint 6 Planning Package**

**Next Step**: Await acceptance before beginning Sprint 6 implementation (E4.1).

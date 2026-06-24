# Technical Debt & Backlog

> Active items tracked across sprints. Completed items archived.
> New items added during Sprint 5.

## Sprint 6 Planning Package Items

### High Priority

#### 5. Trainer Test Data Isolation (BACKLOG #5)

- [ ] Add automated cleanup of trainer test data in `beforeAll`/`afterAll` hooks
- [ ] Ensure `admin@fitcore.local` trainer record is removed before suite runs
- [ ] Ensure permissions/role-permission grants are idempotent or cleaned up between runs
- [ ] Verify trainer suite can run standalone with no prior state

### Low Priority

#### TD-01: Commission Route Rate Limiting

- [ ] Add `express-rate-limit` middleware to commission mutation routes:
  - `POST /rules`, `PATCH /rules/:id`, `POST /rules/:id/activate`, `POST /rules/:id/deactivate`
  - `POST /payouts/generate`, `POST /payouts/:id/approve`, `POST /payouts/:id/mark-paid`
- [ ] Follow same pattern as billing mutation limiter (100 req/min)

#### TD-02: Consumer Unit Tests

- [ ] Add unit tests for `billingConsumers.ts` handler logic
- [ ] Test event payload parsing for all 11 PT events + existing billing/supplement events
- [ ] Test unknown event default case

#### TD-03: DLQ End-to-End Test

- [ ] Add integration test verifying failed jobs route to DLQ
- [ ] Add integration test for `requeueDLQJob` replay workflow
- [ ] Verify DLQ job metadata (failedReason, attemptsMade) preserved

---

## Archived (Sprint 5 — Resolved)

### 1. Billing RBAC Hardening (BC-01)

Resolved in Sprint 5. All 15 billing routes now have `authorize()` guards.

### 2. Billing Audit Logging (BC-02)

Resolved in Sprint 5. All 8 billing mutation methods write audit log entries.

### 3. DLQ Authorization Hardening (BC-03)

Resolved in Sprint 5. All 3 events/DLQ routes protected by `authorize('admin:events')`.

### 4. TD12 — Pagination Carryover (BC-04)

Resolved in Sprint 5. Pagination added to billing list endpoints (`listPlans`, `listMemberships`, `listPayments`).

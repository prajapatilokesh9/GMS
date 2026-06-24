# Phase 2 Backlog

> Governance Audit — 20 June 2026
> Phase 1: CLOSED ✅
> Phase 2 Planning Package: APPROVED ✅
> Sprint 4 Implementation: AUTHORIZED ✅

## Carryover Technical Debt

### TD12 — Gym Document Pagination

| Field | Value |
|-------|-------|
| **ID** | TD12 |
| **Category** | API Debt |
| **Severity** | Low |
| **Source** | Sprint 3 governance audit |
| **Target Sprint** | Sprint 5 |
| **Owner** | Backend 1 |
| **Status** | OPEN |

**Description:**
The `GET /gyms/:id/documents` endpoint returns all documents for a gym without pagination support. As document volume grows this will cause performance degradation.

**Affected Files:**
- `apps/backend/src/modules/gym-documents/gym-document.controller.ts` — `list()` method
- `apps/backend/src/modules/gym-documents/gym-document.service.ts` — `findByGym()` method
- `apps/backend/src/modules/gym-documents/gym-document.routes.ts` — route definition
- `apps/backend/src/modules/gym-documents/gym-document.validation.ts` — missing pagination schema

**Acceptance Criteria:**
- [ ] `page` query parameter accepted (default: 1)
- [ ] `limit` query parameter accepted (default: 10, max: 100)
- [ ] Response includes `total` count
- [ ] Response includes `totalPages` field
- [ ] Sorting support via `sortBy` and `sortOrder` (asc/desc) parameters
- [ ] Validation schema for list query parameters
- [ ] Minimum 1 integration test covering paginated response shape
- [ ] Minimum 1 integration test covering default pagination values
- [ ] Minimum 1 integration test covering sorting behavior
- [ ] No regression in existing document upload/status/delete endpoints

**Resolution:**
Implement `page`, `limit`, `sortBy`, `sortOrder` query params on `GET /gyms/:id/documents`. Update service to use Prisma `skip`/`take`/`orderBy`. Return `{ data, pagination: { page, limit, total, totalPages } }` in response.

---

## Approved Phase 2 Epics (Reference)

| Epic | Title | Points | Sprint |
|------|-------|--------|--------|
| E1 | Membership & Billing Engine | 34 | Sprint 4 |
| E2 | Supplement Marketplace Foundation | 13 | Sprint 4 |
| E3 | OAuth & Notification Channels | 8 | Sprint 5 |
| E4 | Trainer Affiliate System | 5 | Sprint 5 |
| E5 | Admin Dashboard & Reporting | 18 | Sprint 5 |
| E6 | Platform Analytics & ML | 21 | Sprint 6 |
| E7 | Advanced Marketplace & Orders | 18 | Sprint 6 |
| E8 | Marketing & Engagement | 13 | Sprint 7 |
| E9 | Payment Reconciliation & Audit | 8 | Sprint 7 |
| E10 | Production Hardening & Launch | 8 | Sprint 7 |

*For full epic details see `docs/phase-2-planning/02-PHASE2-EPICS.md`*

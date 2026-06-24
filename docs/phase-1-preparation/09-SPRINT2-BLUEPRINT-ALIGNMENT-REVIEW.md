# Sprint 2 — Blueprint Alignment Review

**Reference:** FITCORE PRO BLUEPRINT — Phase 1 (Months 2-4)  
**Document:** `08-SPRINT2-PLANNING-PACKAGE.md`  
**Review Date:** June 19, 2026  
**Status:** Pending Approval

---

## 1. Story-to-Blueprint Mapping

Every Sprint 2 story mapped to the corresponding blueprint section and requirement:

| Story | Blueprint Section | Blueprint Requirement | Status |
|-------|-------------------|----------------------|--------|
| **A1** — Forgot/reset password | Dev Roadmap — Auth System (§2241): *"Forgot password flow"* | POST /auth/password-reset, POST /auth/password-reset/{token} (§2113-2114) | ✅ Aligned |
| **A2** — User profile, change password | Dev Roadmap — Auth System (§2241): *"JWT-based auth"* + Blueprint Users table (§1116-1144) has firstName, lastName, avatarUrl | User profile CRUD | ✅ Aligned |
| **B1** — Login history | Blueprint Audit Logs table (§1860-1892): `audit_logs` stores action, ip_address, user_agent | Login events logged with IP + UA | ✅ Aligned |
| **B2** — Rate limiting | Security Checklist (§2579): *"Rate limiting: 100 requests/min per API key"* | Auth endpoint rate limiting | ✅ Aligned |
| **C1** — Gym document upload | Gym Management (§2247-2251): Gym profile creation + Member onboarding includes document collection | Document upload for verification | ✅ Aligned |
| **C2** — Gym verification workflow | Company Staff — Onboarding Tracker (§681-689): *"Activation checklist", "Funnel visibility"* | State machine: pending→documents→review→active/rejected | ✅ Aligned |
| **C3** — Gym staff management | Staff Management (§234-238): *"Role-based access control", "Shift scheduling"* | Staff CRUD with gym-scoped roles | ✅ Aligned |
| **D1** — Notification channel interfaces | Notification Service (§849-856): *"SMS (Twilio), Push (Firebase), Email (SendGrid/SES)"* | Channel abstraction | ✅ Aligned (stubbed) |
| **D2** — Notification event contracts | Event Architecture (§55-60 AC55-AC59): BaseEvent pattern extending to notification domain | 10 new events conforming to BaseEvent | ✅ Aligned |
| **D3** — Email notification stub | Notification Service (§849-856): *"Email (SendGrid / AWS SES)"* | Template rendering + queue | ✅ Aligned (stubbed) |
| **E1** — Staging deployment (AWS) | Infrastructure (§1038-1053): *"AWS EKS", "GitHub Actions", "CloudFlare"* | ECR → ECS, RDS, Redis | ✅ Aligned |
| **E2** — Monitoring/observability | Infra (§1047-1049): *"Sentry", "CloudWatch"* + Security Checklist (§2586) | Sentry + CloudWatch + /health | ✅ Aligned |
| **E3** — API documentation | Dev Roadmap — Phase 0 (§2218): *"API contracts (OpenAPI 3.1 spec)"* | Swagger UI at /api/v1/docs | ✅ Aligned |
| **F1** — Next.js app setup | Tech Stack (§1001-1011): *"Next.js 14+", "Tailwind CSS"* + Blueprint project structure (§2685-2698) | Workspace config + routing + shared types | ✅ Aligned |
| **F2** — Login page | API — Auth (§2106-2114): POST /auth/login | Login form → JWT → redirect | ✅ Aligned |
| **F3** — Register page | API — Auth (§2107): POST /auth/register | Registration form | ✅ Aligned |
| **F4** — Dashboard shell | Dev Roadmap — Gym Management (§2251): *"Basic dashboard"* + Staff Management (§236-238) | Sidebar, user menu, gym list | ✅ Aligned |

### Blueprint Features EXCLUDED from Sprint 2 (No scope creep)

| Blueprint Feature | Phase | Reason |
|------------------|-------|--------|
| Membership plans & pricing | Phase 2, Sprint 4 | Not in Phase 1 scope |
| Memberships & subscriptions | Phase 2, Sprint 4 | Not in Phase 1 scope |
| Payment integration (Razorpay/Stripe) | Phase 2, Sprint 4 | Not in Phase 1 scope |
| Google OAuth | Phase 2, Sprint 4 | Blueprint Phase 1 requirement; deferred |
| Apple OAuth | Phase 2, Sprint 4 | Blueprint Phase 1 requirement; deferred |
| Trainer management | Phase 2, Sprint 5 | Not in Phase 1 scope |
| Customer app (discovery, search) | Phase 2, Sprint 4+ | Not in Phase 1 scope |
| Supplement marketplace | Phase 2, Sprint 5 | Not in Phase 1 scope |
| Equipment & maintenance | Phase 2, Sprint 5 | Not in Phase 1 scope |
| Analytics (ClickHouse) | Phase 3 | Not in Phase 1 scope |
| AI/ML recommendations | Phase 3 | Not in Phase 1 scope |
| Mobile app (React Native) | Phase 3 | Not in Phase 1 scope |
| Real notification delivery (Twilio/SES/FCM) | Phase 2, Sprint 4 | Stubbed in Phase 1 per blueprint alignment plan |

---

## 2. New Table Review

### 2.1 `gym_documents`

| Property | Value |
|----------|-------|
| **Purpose** | Store documents uploaded during gym onboarding (business license, ID proofs, photos) to support the verification workflow. |
| **Schema** | `gym` (same schema as `gyms` table for logical grouping) |
| **Relationships** | `gym_id` → FK → `gym.id` (CASCADE delete); `uploaded_by` → FK → `user.id` |
| **Columns** | `id` (UUID PK), `gym_id` (UUID FK), `document_type` (enum: business_license, owner_id_proof, gym_photo, utility_bill, other), `file_name`, `file_path`, `mime_type`, `file_size` (Int), `status` (pending/approved/rejected), `uploaded_by` (UUID FK), `created_at`, `updated_at` |
| **Indexes** | `(gym_id, document_type)` — unique partial; `(gym_id, status)` — B-tree for listing |
| **Blueprint dependency** | Gym Onboarding (§2247-2251): *"Gym profile creation"* implicitly requires document collection for verification. Company Staff — Onboarding Tracker (§681-689) drives the need for document verification. |
| **Future phase dependency** | Phase 2: Documents may be extended for trainer certifications, supplement company FSSAI licenses. Tables `trainers` and `supplements` will reference documents. |

### 2.2 `password_reset_tokens`

| Property | Value |
|----------|-------|
| **Purpose** | Securely store password reset tokens with expiry. Separate table (not a column on users) to support multiple concurrent tokens and TTL cleanup. |
| **Schema** | `public` |
| **Relationships** | `user_id` → FK → `user.id` (CASCADE delete); no tenant FK — reset flow is tenant-aware via the user lookup |
| **Columns** | `id` (UUID PK), `user_id` (UUID FK), `token_hash` (SHA-256 hash of reset token — never store raw), `expires_at` (timestamp, NOT NULL), `used_at` (timestamp, nullable), `created_at` |
| **Indexes** | `token_hash` — unique; `(user_id, expires_at)` — B-tree for cleanup queries |
| **Blueprint dependency** | Auth System (§2241-2245): *"Forgot password flow"* + Security (§2534): *"Forgot password: Secure token (32 bytes random, 1-hour expiry)"* |
| **Future phase dependency** | Phase 2: May be extended with email verification tokens, phone OTP tokens. |

### 2.3 `notification_templates`

| Property | Value |
|----------|-------|
| **Purpose** | Store template definitions for email, SMS, and push notifications. Phase 1 stores template content (stubbed); Phase 2 will render them. |
| **Schema** | `public` |
| **Relationships** | `tenant_id` → FK → `tenant.id` (optional: null = platform-level templates); no user FK |
| **Columns** | `id` (UUID PK), `tenant_id` (UUID FK, nullable), `channel` (email/sms/push/in_app), `event_name` (matches event contract name), `subject` (Varchar), `body` (Text, supports {{variable}} placeholders), `metadata` (Json for channel-specific config), `is_active` (Boolean), `created_at`, `updated_at` |
| **Indexes** | `(channel, event_name)` — unique (for per-tenant template lookup) |
| **Blueprint dependency** | Notification Service (§849-856): *"SMS (Twilio), Push (Firebase), Email (SendGrid/SES)"* — templates are fundamental to any notification system. |
| **Future phase dependency** | Phase 2, Sprint 4: When real delivery is implemented, templates will be rendered with dynamic data and sent via Twilio/SES/FCM. The table design is forward-compatible — no migration needed. |

### 2.4 `login_history`

| Property | Value |
|----------|-------|
| **Purpose** | Store login/logout events for user-facing audit trail. Separate from `audit_logs` because: (a) login queries are high-frequency user-facing, (b) audit_logs is admin/system-facing, (c) separates concerns. |
| **Schema** | `auth` |
| **Relationships** | `user_id` → FK → `user.id` (CASCADE delete); `tenant_id` → FK → `tenant.id` |
| **Columns** | `id` (UUID PK), `tenant_id` (UUID FK), `user_id` (UUID FK), `event_type` (LOGIN/LOGOUT/FAILED), `ip_address` (Varchar 45), `user_agent` (Text), `metadata` (Json: device, location if available), `created_at` |
| **Indexes** | `(user_id, created_at)` — B-tree for paginated user-facing history; `(tenant_id, created_at)` — B-tree for tenant-level audit |
| **Blueprint dependency** | Audit Logs (§1860-1892) — Blueprint defines `audit_logs` with action, ip_address, user_agent. `login_history` is a specialization of this pattern for auth-specific events. |
| **Future phase dependency** | Phase 3: Login history may feed AI churn models (frequency of logins is a churn predictor per blueprint Scenario 3 §960-976). Also feeds Security checklist (§2591): *"Audit logging: All sensitive actions logged"*. |

### Total new tables: 4 (gym_documents, password_reset_tokens, notification_templates, login_history)
### Total new columns on existing tables: 3 (gym.rejection_reason, gym.verified_at, gym.verified_by)

---

## 3. Frontend Scope Clarification

### 3.1 Exact Pages/Routes Included in Sprint 2

| Route | Page | Auth | Type |
|-------|------|------|------|
| `/login` | Login (email + password → JWT) | Public | **Foundation** |
| `/register` | Register (email + password + name) | Public | **Foundation** |
| `/forgot-password` | Forgot password (email input → reset link) | Public | **Foundation** |
| `/reset-password/[token]` | Reset password (new password form) | Public | **Foundation** |
| `/dashboard` | Post-login dashboard (sidebar + gym list + user menu) | JWT | **Foundation** |
| `/profile` | View/edit profile (firstName, lastName, phone) | JWT | **Foundation** |
| `/profile/change-password` | Change password form (old + new) | JWT | **Foundation** |
| `/gyms` | List my gyms | JWT | **Foundation** |
| `/gyms/new` | Gym onboarding (create gym form) | JWT | **Foundation** |
| `/gyms/[id]` | Gym detail view | JWT | **Foundation** |
| `/gyms/[id]/documents` | Upload/view gym documents | JWT | **Foundation** |
| `/gyms/[id]/staff` | Manage gym staff | JWT | **Foundation** |
| `/profile/login-history` | View login history | JWT | **Foundation** |
| `/admin/gyms/verify` | Admin verification queue (super_admin) | JWT+Admin | **Foundation** |

### 3.2 Foundation UI vs Business Functionality

**Foundation UI (Sprint 2 scope):**
- Authentication pages (login, register, forgot/reset password)
- User profile pages (view, edit, change password)
- Dashboard shell with navigation layout
- Gym CRUD pages (list, create, detail, documents, staff)
- Login history page
- Admin verification page

**Business Functionality (NOT in Sprint 2):**
- Membership plan selection and purchase — Phase 2, Sprint 4
- Payment checkout flow (Razorpay) — Phase 2, Sprint 4
- Trainer portfolio and booking — Phase 2, Sprint 5
- Supplement browsing and ordering — Phase 2, Sprint 5
- Workout logging and tracking — Phase 2, Sprint 6
- Diet plan viewing and food logging — Phase 2, Sprint 6
- Gym discovery (GPS-based search) — Phase 2, Sprint 4
- Class booking — Phase 2, Sprint 5
- Loyalty points and gamification — Phase 3
- Analytics dashboards with charts — Phase 3
- AI-generated recommendations — Phase 3

### 3.3 Confirmation: No Phase 2 Business Modules

Sprint 2 frontend delivers **only** the foundation UI layer — auth pages, profile management, gym CRUD, and dashboard shell. No membership plans, no payments, no trainers, no supplements, no equipment, no analytics, no AI. All business features remain deferred to Phase 2 as documented in the blueprint alignment.

---

## 4. Event Contract Review

### 4.1 Event: `user.password_reset_requested`

| Property | Value |
|----------|-------|
| **Producer** | AuthService — `forgotPassword()` method |
| **Consumer** | EmailNotificationStub — logs reset URL |
| **Retry behavior** | 3 retries: 30s → 2min → 5min exponential backoff; DLQ after exhaustion |
| **Audit** | AuditService creates LOGIN_RECOVERY audit entry; `login_history` records FAILED event if token requested but no user found |
| **Payload** | `{ userId, email, resetToken (hashed logged, raw never persisted), expiresAt }` |

### 4.2 Event: `user.password_reset_completed`

| Property | Value |
|----------|-------|
| **Producer** | AuthService — `resetPassword()` method |
| **Consumer** | AuditService — logs password change |
| **Retry behavior** | 3 retries: 30s → 2min → 5min; DLQ |
| **Audit** | AuditService creates PASSWORD_CHANGE audit entry; `login_history` records LOGIN event |
| **Payload** | `{ userId, email }` |

### 4.3 Event: `user.profile_updated`

| Property | Value |
|----------|-------|
| **Producer** | UserService — `updateProfile()` method |
| **Consumer** | EmailNotificationStub — would notify of profile changes |
| **Retry behavior** | 3 retries: 30s → 2min → 5min; DLQ |
| **Audit** | AuditService creates UPDATE audit entry with changed fields diff (oldValue/newValue) |
| **Payload** | `{ userId, changedFields[], oldValues{}, newValues{} }` |

### 4.4 Event: `gym.documents_uploaded`

| Property | Value |
|----------|-------|
| **Producer** | GymService — document upload handler |
| **Consumer** | GymVerificationWorkflow — transitions gym to `documents` status if ready |
| **Retry behavior** | 5 retries: 30s → 1min → 2min → 5min → 10min; DLQ (higher retry because verification is critical path) |
| **Audit** | AuditService creates DOCUMENT_UPLOAD audit entry with document metadata |
| **Payload** | `{ gymId, documentTypes[], uploadedBy, timestamp }` |

### 4.5 Event: `gym.verification_status_changed`

| Property | Value |
|----------|-------|
| **Producer** | GymService — `verifyGym()` method |
| **Consumer** | EmailNotificationStub — would notify gym owner of status change |
| **Retry behavior** | 3 retries: 30s → 2min → 5min; DLQ |
| **Audit** | AuditService creates VERIFICATION audit entry with oldStatus → newStatus transition |
| **Payload** | `{ gymId, oldStatus, newStatus, reviewerId, rejectionReason? }` |

### 4.6 Event: `gym.staff_added`

| Property | Value |
|----------|-------|
| **Producer** | GymService — addStaff method |
| **Consumer** | EmailNotificationStub — would notify added staff member |
| **Retry behavior** | 3 retries: 30s → 2min → 5min; DLQ |
| **Audit** | AuditService creates STAFF_ADDED audit entry with userId + roleSlug |
| **Payload** | `{ gymId, userId, roleSlug, addedBy }` |

### 4.7 Event: `gym.staff_removed`

| Property | Value |
|----------|-------|
| **Producer** | GymService — removeStaff method |
| **Consumer** | None (fire-and-forget) |
| **Retry behavior** | 2 retries: 30s → 2min (lower priority); DLQ |
| **Audit** | AuditService creates STAFF_REMOVED audit entry |
| **Payload** | `{ gymId, userId, removedBy }` |

### 4.8 Event: `notification.email.required`

| Property | Value |
|----------|-------|
| **Producer** | Any service (NotificationService acts as aggregator) |
| **Consumer** | EmailWorker — logs "Would send email to X with template Y" |
| **Retry behavior** | 3 retries: 1min → 5min → 15min; DLQ |
| **Audit** | NotificationService creates NOTIFICATION audit entry (stub mode: logged only) |
| **Payload** | `{ to, template, data, cc?, bcc?, correlationId }` |

### 4.9 Event: `notification.sms.required`

| Property | Value |
|----------|-------|
| **Producer** | Any service via NotificationService |
| **Consumer** | SmsWorker — logs "Would send SMS to X" |
| **Retry behavior** | 3 retries: 1min → 5min → 15min; DLQ |
| **Audit** | NotificationService creates NOTIFICATION audit entry |
| **Payload** | `{ to, template, data, correlationId }` |

### 4.10 Event: `notification.push.required`

| Property | Value |
|----------|-------|
| **Producer** | Any service via NotificationService |
| **Consumer** | PushWorker — logs "Would send push to X devices" |
| **Retry behavior** | 3 retries: 1min → 5min → 15min; DLQ |
| **Audit** | NotificationService creates NOTIFICATION audit entry |
| **Payload** | `{ deviceTokens[], title, body, data, correlationId }` |

### Event Summary

| # | Event | Producer | Consumer | Retries | Audit | Queue |
|---|-------|----------|----------|---------|-------|-------|
| 1 | `user.password_reset_requested` | AuthService | EmailStub | 3 | auth + login_history | auth |
| 2 | `user.password_reset_completed` | AuthService | AuditService | 3 | auth + login_history | auth |
| 3 | `user.profile_updated` | UserService | EmailStub | 3 | audit_logs | user |
| 4 | `gym.documents_uploaded` | GymService | VerificationWorkflow | 5 | audit_logs | gym |
| 5 | `gym.verification_status_changed` | GymService | EmailStub | 3 | audit_logs | gym |
| 6 | `gym.staff_added` | GymService | EmailStub | 3 | audit_logs | gym |
| 7 | `gym.staff_removed` | GymService | — | 2 | audit_logs | gym |
| 8 | `notification.email.required` | NotificationService | EmailWorker | 3 | notification | notification |
| 9 | `notification.sms.required` | NotificationService | SmsWorker | 3 | notification | notification |
| 10 | `notification.push.required` | NotificationService | PushWorker | 3 | notification | notification |

---

## 5. Architecture Confirmation

### 5.1 Sprint 2 Introduces No Architectural Changes

Sprint 2 extends the existing architecture established in Sprint 1:

| Layer | Sprint 1 | Sprint 2 Change | Architectural Impact |
|-------|----------|-----------------|---------------------|
| **API framework** | Express (single-process, route-based) | No change | None |
| **Middleware pipeline** | authenticate → authorize → tenantContext → route | No change | None |
| **Database** | PostgreSQL 18, Prisma ORM, RLS | 4 new tables, 3 new columns | None — additive only |
| **Redis** | ioredis client connection | No change | None |
| **Event bus** | BullMQ with BaseEvent pattern | 10 new events, 1 new queue (notification) | None — follows existing pattern |
| **Auth** | JWT (HS256), authenticate middleware, authorize middleware | Forgot/reset, profile, login history | None — extends existing module |
| **File storage** | Not present | Multer → local uploads dir | **New subsystem** — but follows same layered pattern (controller → service → storage adapter) |
| **Web frontend** | Not present | Next.js 14 app | **New client layer** — matches blueprint architecture (Next.js in client layer §730-734). Communicates via REST only. No architectural coupling. |
| **Deployment** | Docker Compose (local) | AWS ECS Fargate | **New deployment target** — same container image, no code changes |

**New subsystems:**
1. `storage/` — File storage abstraction (local adapter for dev; S3 adapter interface for staging)
2. `apps/web/` — Next.js app (separate package, communicates via REST, no architectural coupling to backend)

### 5.2 Express Compatibility with Blueprint Architecture

The blueprint specifies **NestJS** (§988) for the web framework. Sprint 1 used **Express** with a structured modular pattern as an accepted simplification.

**Compatibility assessment:**

| Blueprint Requirement | Express Implementation in Sprint 1 | Compatible? |
|----------------------|-----------------------------------|-------------|
| Modular architecture | Module-based directory structure (auth/, users/, gyms/, etc.) | ✅ Same separation of concerns |
| Dependency injection | Manual DI via constructor pattern | ✅ DI pattern preserved |
| Guards (auth) | authenticate middleware | ✅ Same semantics |
| Guards (RBAC) | authorize middleware with roles parameter | ✅ Same semantics |
| Interceptors | response wrapper, error handler middleware | ✅ Same semantics |
| Pipes/Validation | Zod validation via middleware | ✅ Same semantics |
| OpenAPI auto-docs | Swagger/OpenAPI in Sprint 2 (E3) | ✅ NestJS has built-in; Express needs `swagger-jsdoc` — functionally equivalent |
| Prisma ORM | PrismaClient with service pattern | ✅ Identical |
| BullMQ events | EventBusService | ✅ Identical |

**No compatibility issues found.** The Express-based implementation achieves the same architectural goals (modularity, middleware pipeline, event-driven, layered) as the blueprint's NestJS specification. Future migration to NestJS (if desired) would be a mechanical refactor — no data model, event contract, or API surface changes needed.

**Explicit deviations from blueprint (already accepted in Sprint 1):**
1. HS256 (symmetric) JWT signing instead of RS256 (asymmetric) — will be upgraded before production
2. PostgreSQL 18 instead of 16 — compatible superset
3. Express instead of NestJS — functionally equivalent
4. UUID PKs instead of BigInt — functionally equivalent, better for distributed systems

None of these deviations create migration debt for future blueprint phases. Each deviation is a safe additive change.

### 5.3 No Migration Debt for Future Phases

| Blueprint Phase 2 Feature | Required Schema Change | Sprint 2 Schema Prepared? | Migration Debt? |
|--------------------------|----------------------|--------------------------|-----------------|
| Membership plans + memberships | 2 new tables (membership_plans, memberships) | Not created yet — deferred | ❌ None. Gym model has `subscriptionPlan` placeholder field for FK |
| Payment integration (Razorpay) | 1 new table (payments) + FK from memberships | Not created yet — deferred | ❌ None. Standard additive change |
| Trainer management | 1 new table (trainers) + FK from users, gyms | Not created yet — deferred | ❌ None. Standard additive change |
| Notification delivery (real) | Connect Twilio/SES/FCM to existing channels | Notification interfaces + templates ready | ❌ None — Sprint 2 builds the abstraction; real delivery is a drop-in implementation |
| Real file storage (S3) | S3 bucket + adapter | Sprint 2 builds local adapter + S3 interface | ❌ None — swap adapter at runtime |
| Mobile app (React Native) | New client package | Not started | ❌ None — separate package, REST API already versioned |
| Google/Apple OAuth | passport strategies | Not started — deferred | ❌ None — standard additive change |
| Search (Elasticsearch) | New service | Not started | ❌ None — separate service |

**Conclusion:** Sprint 2 introduces zero migration debt. All additions are either additive (new tables/columns) or abstracted behind interfaces (storage, notifications). No existing table or interface needs to be restructured for future phases.

---

## 6. Updated Phase 1 Completion Matrix

### 6.1 Feature Completion Status

| Blueprint Phase 1 Deliverable | Status | Sprint | Notes |
|------------------------------|--------|--------|-------|
| Monorepo setup (Turborepo, pnpm, shared TS config) | ✅ **COMPLETE** | 1 | — |
| Docker development environment | ✅ **COMPLETE** | 1 | Local PostgreSQL + Redis |
| Prisma schema (8 active tables) | ✅ **COMPLETE** | 1 | 4 new Sprint 2 tables pending |
| Seed data (21 permissions, 9 roles, 1 tenant, 1 admin) | ✅ **COMPLETE** | 1 | — |
| CI/CD pipeline (GitHub Actions) | ✅ **COMPLETE** | 1 | CI only; CD deferred to Sprint 2 E1 |
| ESLint + Prettier config | ✅ **COMPLETE** | 1 | — |
| Shared types package | ✅ **COMPLETE** | 1 | @fitcore/shared |
| Redis connection (ioredis) | ✅ **COMPLETE** | 1 | — |
| Auth core (register, login, JWT, refresh) | ✅ **COMPLETE** | 1 | — |
| JWT guard (authenticate middleware) | ✅ **COMPLETE** | 1 | — |
| RBAC (authorize middleware, permission check) | ✅ **COMPLETE** | 1 | — |
| Tenant isolation (tenantContext middleware, RLS) | ✅ **COMPLETE** | 1 | 9 RLS policies |
| User registration with role assignment | ✅ **COMPLETE** | 1 | — |
| Gym CRUD (create, read, update, list) | ✅ **COMPLETE** | 1 | — |
| BullMQ event bus (BaseEvent, retry, DLQ) | ✅ **COMPLETE** | 1 | — |
| Auth event producers + consumers | ✅ **COMPLETE** | 1 | — |
| Audit logging service | ✅ **COMPLETE** | 1 | — |
| Forgot/reset password flow | 📋 **PLANNED** | 2 | A1 |
| User profile (GET/PATCH, change password) | 📋 **PLANNED** | 2 | A2 |
| Login history (user-facing audit) | 📋 **PLANNED** | 2 | B1 |
| Rate limiting (auth endpoints) | 📋 **PLANNED** | 2 | B2 |
| Gym document upload | 📋 **PLANNED** | 2 | C1 |
| Gym verification workflow (state machine) | 📋 **PLANNED** | 2 | C2 |
| Gym staff management | 📋 **PLANNED** | 2 | C3 |
| Notification channel interfaces (SMS/Email/Push stubs) | 📋 **PLANNED** | 2 | D1 |
| Notification event contracts (10 events) | 📋 **PLANNED** | 2 | D2 |
| Email/SMS/Push stub workers | 📋 **PLANNED** | 2 | D3 |
| AWS staging deployment (ECR → ECS → RDS → Redis) | 📋 **PLANNED** | 2 | E1. Requires AWS account. |
| Monitoring (Sentry, CloudWatch, /health) | 📋 **PLANNED** | 2 | E2 |
| API documentation (Swagger/OpenAPI) | 📋 **PLANNED** | 2 | E3 |
| Next.js web app (auth pages, dashboard, gym screens) | 📋 **PLANNED** | 2 | F1-F4 |
| Google OAuth | ⏳ **DEFERRED** | 3+ | Blueprint Phase 1 but not in approved 12 scope items |
| Apple OAuth | ⏳ **DEFERRED** | 3+ | Blueprint Phase 1 but not in approved 12 scope items |
| Integration tests (30+ scenarios) | ⏳ **DEFERRED** | 3 | Buffer sprint |
| E2E tests (Cypress/Playwright) | ⏳ **DEFERRED** | 3 | Buffer sprint |
| Security audit (OWASP, Snyk) | ⏳ **DEFERRED** | 3 | Buffer sprint |
| Performance baseline (k6, 50 concurrent users) | ⏳ **DEFERRED** | 3 | Buffer sprint |
| Developer documentation | ⏳ **DEFERRED** | 3 | Buffer sprint |
| Pilot gym onboarding preparation | ⏳ **DEFERRED** | 3 | Buffer sprint |

### 6.2 Sprint 2 Gate Criteria (Extension of Phase 1 Exit Criteria)

| # | Criterion | Minimum | Verification |
|---|-----------|---------|-------------|
| G1 | Forgot/reset password flow: token generation → email stub → hash update | 100% | curl + DB verify |
| G2 | User profile CRUD + password change: all endpoints return correct data | 100% | Unit test + curl |
| G3 | Login history: login events create audit entries with IP + UA | 100% | DB query |
| G4 | Rate limiting: 5th login attempt within 1 min returns 429 | 100% | curl sequence |
| G5 | Gym onboarding state machine: all valid transitions work; invalid transitions return 400 | 100% | Unit test |
| G6 | Gym document upload: file saved to disk; metadata returned; S3 interface implemented | 100% | curl + file system |
| G7 | Gym staff management: add/remove/list scoped to gym | 100% | Unit test + curl |
| G8 | Notification channels: EmailChannel.send logs without error | 100% | Unit test |
| G9 | Notification event contracts: all 10 events emitted with valid BaseEvent schema | 100% | Integration test |
| G10 | Staging URL responds 200 with valid SSL | 100% | curl (post-deploy) |
| G11 | Sentry captures test error; CloudWatch has log stream | 100% | Dashboard verify |
| G12 | Swagger UI renders all Phase 1 endpoints | 100% | Browser verify |
| G13 | Web app: login flow completes; register flow completes; dashboard renders | 100% | e2e / manual |
| G14 | All unit + integration tests pass (target 40+ tests) | 100% | `pnpm test` |
| G15 | TypeScript strict mode passes with 0 errors | 100% | `pnpm typecheck` |
| G16 | No blueprint deviations introduced | 0 | Audit against blueprint |

### 6.3 Features Deferred Beyond Sprint 3

| Feature | Blueprint Reference | Target Phase |
|---------|-------------------|-------------|
| Membership plans & pricing | Membership Module | Phase 2, Sprint 4 |
| Customer memberships | Membership Module | Phase 2, Sprint 4 |
| Payment integration (Razorpay) | Payment Module | Phase 2, Sprint 4 |
| Notification real delivery (Twilio/SES/FCM) | Notification Service | Phase 2, Sprint 4 |
| Real file storage (AWS S3) | Document Management | Phase 2, Sprint 4 |
| Gym discovery (GPS-based search) | Customer App | Phase 2, Sprint 4 |
| Google OAuth | Auth Module | Phase 2, Sprint 4 |
| Apple OAuth | Auth Module | Phase 2, Sprint 4 |
| Trainer management | Trainer Module | Phase 2, Sprint 5 |
| PT session scheduling | PT Session Module | Phase 2, Sprint 5 |
| Supplement marketplace (zero-inventory) | Supplement Module | Phase 2, Sprint 5 |
| Equipment inventory + AMC | Equipment Module | Phase 2, Sprint 5 |
| Class booking | Booking Module | Phase 2, Sprint 5 |
| Nutritionist profiles + diet plans | Nutritionist Module | Phase 2, Sprint 5 |
| Workout tracking | Workout Module | Phase 2, Sprint 6 |
| Body metrics + progress tracking | Body Metrics | Phase 2, Sprint 6 |
| Food logging | Food Logs | Phase 2, Sprint 6 |
| Loyalty + gamification | Loyalty Points | Phase 2, Sprint 6 |
| Analytics dashboard | Analytics Module | Phase 3 |
| AI churn prediction | AI Engine | Phase 3 |
| AI workout/diet recommendations | AI Engine | Phase 3 |
| Mobile app (React Native/Expo) | Mobile Platform | Phase 3 |
| Biometric device integration | Biometric Service | Phase 3 |
| White-label gym app | White-Label | Phase 3 |
| IoT equipment telemetry | Equipment Telemetry | Phase 3 |
| Multi-language/currency | Internationalization | Phase 4 |
| Video consultations (Agora/Jitsi) | Video Module | Phase 4 |

---

## 7. Summary of Risks and Mitigations (Addendum)

| # | Risk | Mitigation |
|---|------|-----------|
| R1 | Express vs NestJS creates integration friction if NestJS required later | No structural lock-in. Middleware pattern maps 1:1. Migration would be mechanical. |
| R2 | HS256 JWT signing (dev) vs RS256 (blueprint spec) | Sprint 2 uses HS256. RS256 upgrade is a config change + key pair generation — no code impact. |
| R3 | UUID PKs vs BigInt (blueprint spec) | UUIDs are functionally equivalent with better distributed compatibility. No migration needed. |
| R4 | Staging deployment E1 blocked by AWS account delays | Local deployment with Docker Compose as fallback. Infrastructure-as-code (Terraform/CloudFormation) prepared in advance. |
| R5 | Notification stubs cause interface drift before Phase 2 | Notification interfaces frozen by end of Sprint 2. Documented in shared types. No changes without architecture review. |

---

*End of Blueprint Alignment Review — 6 sections complete.*

**Ready for stakeholder review and Sprint 2 implementation approval.**

# Sprint 2 Planning Package

**Based on:** FITCORE PRO BLUEPRINT — Phase 1, Sprint 2  
**Duration:** 2 weeks (Sprint 2 of Phase 1)  
**Capacity:** 6-person team, target velocity 35-45 points  

---

## 1. Sprint 2 Objectives

1. Complete the authentication lifecycle (password reset, profile, login history)
2. Enhance gym onboarding with document management and verification workflow
3. Implement notification channel infrastructure with stubs for SMS/Email/Push
4. Deploy to staging AWS environment with monitoring
5. Build web frontend (Next.js) with auth pages and dashboard shell
6. Generate API documentation via OpenAPI/Swagger

---

## 2. Sprint 2 Deliverables

| # | Deliverable | Description | Blueprint Reference |
|---|-------------|-------------|-------------------|
| D1 | Forgot/Reset Password Flow | Password reset via email token | Auth Module — Password Reset |
| D2 | User Profile Management | GET/PATCH profile, password change, avatar | User Module |
| D3 | Login History | Audit trail of user login events | Audit Logging |
| D4 | Gym Onboarding Workflow | Document upload, verification state machine, admin review | Gym Onboarding |
| D5 | Gym Staff Management | Staff CRUD, role assignment within gym | Gym Management |
| D6 | Notification Channel Interfaces | SMS/Email/Push channel abstraction with stubs | Notification Infrastructure |
| D7 | Email Notification Service (Stub) | Email rendering + queuing via BullMQ (logging only) | Notification — Email |
| D8 | SMS Notification Service (Stub) | SMS queuing via BullMQ (logging only) | Notification — SMS |
| D9 | Push Notification Service (Stub) | Push queuing via BullMQ (logging only) | Notification — Push |
| D10 | File/Document Upload | Multer-based file upload, S3-compatible storage abstraction | Document Management |
| D11 | Staging Deployment (AWS) | ECR → ECS Fargate, RDS, ElastiCache, CloudFront | Environment & Deployment |
| D12 | Monitoring & Observability | CloudWatch logs, Sentry error tracking, health dashboard | Monitoring |
| D13 | API Documentation | Swagger/OpenAPI for all Phase 1 endpoints | Documentation |
| D14 | Web App (Next.js) | Auth pages, dashboard shell, gym list | Web Application |
| D15 | Rate Limiting | Express-rate-limit on auth endpoints | Security |

---

## 3. User Stories with Estimates

### Epic A: Authentication Lifecycle (10 points)

| # | Story | Points | Acceptance Criteria | Sprint 1 Dep |
|---|-------|--------|-------------------|-------------|
| A1 | Forgot password: POST /auth/forgot-password generates reset token; POST /auth/reset-password/:token validates and updates hash; email stub logs reset URL | 5 | Token expires in 1 hour; bcrypt hash updated; event emitted `user.password_reset_completed` | Auth module |
| A2 | User profile: GET /users/me, PATCH /users/me (firstName, lastName, phone, avatarUrl); PATCH /users/me/change-password (oldPassword, newPassword) | 5 | Old password verified before update; profile returned without password hash; avatar URL validated | Auth module, Users module |

### Epic B: Login Security & Audit (6 points)

| # | Story | Points | Acceptance Criteria | Sprint 1 Dep |
|---|-------|--------|-------------------|-------------|
| B1 | Login history: audit_log entries created on LOGIN/LOGOUT; GET /auth/login-history returns paginated list | 3 | IP address, user agent, timestamp logged; paginated response | Audit service |
| B2 | Rate limiting: express-rate-limit on /auth/login (5 attempts/min/IP); configurable threshold; returns 429 with Retry-After header | 3 | 6th login attempt returns 429; header present; config via env var | Core app |

### Epic C: Gym Onboarding & Staff (12 points)

| # | Story | Points | Acceptance Criteria | Sprint 1 Dep |
|---|-------|--------|-------------------|-------------|
| C1 | Gym document upload: POST /gyms/:id/documents (business license, ID, photos); multer file handling; file metadata stored in DB; S3 adapter interface | 5 | Files uploaded to local uploads/ dir; gym_documents table created; document type enum validated | Gym module |
| C2 | Gym verification workflow: PATCH /gyms/:id/verify (super_admin only); status transitions pending→documents→review→active/rejected; rejection_reason stored | 4 | Only super_admin can transition to active; `gym.verified` event emitted; audit log created | Gym module, RBAC |
| C3 | Gym staff management: POST /gyms/:id/staff (add user + role); GET /gyms/:id/staff (list staff); DELETE /gyms/:id/staff/:userId (remove); scope role to gym | 3 | UserRole.gymId set; staff list filtered by gym; gym_owner can manage staff; events emitted | UserRole table, RBAC |

### Epic D: Notification Infrastructure (10 points)

| # | Story | Points | Acceptance Criteria | Sprint 1 Dep |
|---|-------|--------|-------------------|-------------|
| D1 | Notification channel interfaces: INotificationChannel interface (send method); EmailChannel, SmsChannel, PushChannel classes (stubs); NotificationService dispatches to all enabled channels | 4 | Service loops through enabled channels; each channel logs send attempt; returns send receipt | BullMQ |
| D2 | Notification event contracts: `notification.email.required`, `notification.sms.required`, `notification.push.required` events with standard payload; consumers stub processing | 3 | Events conform to BaseEvent; consumers log receipt; payload includes to, template, data | Event bus |
| D3 | Email notification stub: EmailChannel renders template stub; pushes to email queue; worker logs "Would send email to X with template Y"; supports CC, BCC, attachments (stubbed) | 3 | Queue receives email jobs; worker logs delivery; template resolution logged | D1, D2 |

### Epic E: Deployment & Monitoring (10 points)

| # | Story | Points | Acceptance Criteria | Sprint 1 Dep |
|---|-------|--------|-------------------|-------------|
| E1 | AWS staging: ECR repo; ECS Fargate service; RDS PostgreSQL; ElastiCache Redis; ALB with SSL; CloudFront CDN; Route53 DNS; GitHub Actions CD workflow | 6 | HTTPS staging URL responds 200; DB and Redis connected; CD deploys on main merge | CI/CD, Docker |
| E2 | Monitoring: Winston CloudWatch stream; Sentry SDK integration (DSN from env); /health endpoint returns DB + Redis status; structured logging with correlation_id | 2 | Startup logs appear in CloudWatch; test error appears in Sentry; health check reports all services | Core app |
| E3 | API documentation: OpenAPI 3.0 spec generated from Zod schemas + route metadata; Swagger UI at /api/v1/docs; all Phase 1 endpoints documented | 2 | Swagger UI renders; each endpoint has request/response examples; auth via "Authorize" button | Core API |

### Epic F: Web Frontend (10 points)

| # | Story | Points | Acceptance Criteria | Sprint 1 Dep |
|---|-------|--------|-------------------|-------------|
| F1 | Next.js app setup: pnpm workspace package; Tailwind CSS; shared types import from @fitcore/shared; API client with token management; route guards | 3 | `apps/web` runs at localhost:3000; imports shared types; API client sends JWT in Authorization header | Monorepo |
| F2 | Login page: email + password form; calls POST /auth/login; stores JWT in httpOnly cookie; redirects to /dashboard; shows error on invalid credentials | 3 | Login form renders; successful auth redirects; error message shown on failure | Auth API |
| F3 | Register page: form with email, password, firstName, lastName; calls POST /auth/register; auto-redirects to login with success message | 2 | Registration form validates required fields; duplicate email shows error; redirects to login | Auth API |
| F4 | Dashboard shell: layout with sidebar navigation; user menu with profile/logout; gym list widget; role-based navigation items | 2 | Sidebar renders navigation; user menu shows name; logout clears token and redirects | F1, F2 |

---

## 4. Story Point Summary

| Epic | Points | % of Sprint 2 |
|------|--------|---------------|
| A: Authentication Lifecycle | 10 | 17% |
| B: Login Security & Audit | 6 | 10% |
| C: Gym Onboarding & Staff | 12 | 20% |
| D: Notification Infrastructure | 10 | 17% |
| E: Deployment & Monitoring | 10 | 17% |
| F: Web Frontend | 10 | 17% |
| **Total** | **58** | **100%** |

---

## 5. Dependencies on Sprint 1

| Sprint 2 Epic | Depends On Sprint 1 Deliverable | Risk if Unstable |
|--------------|--------------------------------|------------------|
| Auth lifecycle (A) | Auth module (register, login, JWT), Users module | Profile endpoints return stale/incorrect user data |
| Login security (B) | Audit service, Logger, Core Express app | Rate limiting fails; audit logs incomplete |
| Gym onboarding (C) | Gym CRUD, RBAC (authorize middleware), Audit service, File upload lib | Document storage breaks; verification transitions fail |
| Notification infra (D) | BullMQ event bus, BaseEvent, Redis connection | Queues not created; events not delivered |
| Deployment (E) | Docker setup, CI/CD workflow, all Sprint 1 modules | Build fails; migration fails on staging |
| Web frontend (F) | Monorepo, Shared types, Auth API endpoints, RBAC permissions | Login flow broken; type mismatch |

**Critical path:** E1 (staging deployment) depends on ALL Sprint 1 deliverables and ALL Sprint 2 modules being stable. It is the last story to complete.

---

## 6. Database Changes in Sprint 2

### New Tables

| Table | Schema | Purpose | Blueprint Ref |
|-------|--------|---------|--------------|
| `gym_documents` | `gym` | Documents uploaded during gym onboarding (license, ID, photos) | Gym Onboarding |
| `password_reset_tokens` | `public` | Password reset token with expiry | Auth — Password Reset |
| `notification_templates` | `public` | Email/SMS/Push template definitions | Notification Infrastructure |
| `login_history` | `public` | Login/logout event log (replaces lightweight audit query for auth-specific events) | Audit Logging |

### New Columns on Existing Tables

| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| `gyms` | `rejection_reason` | `text?` | Admin rejection reason during verification |
| `gyms` | `verified_at` | `timestamptz?` | Timestamp of gym verification |
| `gyms` | `verified_by` | `uuid?` | FK to users (admin who verified) |
| `users` | `avatar_url` | `varchar(500)?` | Profile avatar URL |

### New Indexes

| Table | Index | Type |
|-------|-------|------|
| `gym_documents` | `(gym_id, document_type)` | Unique partial |
| `gym_documents` | `(gym_id, status)` | B-tree |
| `password_reset_tokens` | `(token)` | Unique |
| `password_reset_tokens` | `(email, expires_at)` | B-tree |
| `login_history` | `(user_id, created_at)` | B-tree |
| `notification_templates` | `(channel, event_name)` | Unique |

### Total: 4 new tables, ~6 new columns, 6 new indexes

**Deferred to future phases:** `membership_plans`, `memberships`, `trainers`, `pt_sessions`, `workouts`, `body_metrics`, `diet_plans`, `food_logs`, `supplements`, `supplement_orders`, `equipment`, `maintenance_jobs`, `payments`, `notifications`, `ai_recommendations`, `loyalty_points` — all 16 tables remain deferred.

---

## 7. API Modules to Implement

| Module | Endpoints | Auth | Sprint 1 Status |
|--------|-----------|------|----------------|
| **Password Reset** | `POST /auth/forgot-password`, `POST /auth/reset-password/:token` | Public | New |
| **Profile** | `GET /users/me`, `PATCH /users/me`, `PATCH /users/me/change-password` | JWT | Extends existing users module |
| **Login History** | `GET /auth/login-history` | JWT | New |
| **Gym Documents** | `POST /gyms/:id/documents`, `GET /gyms/:id/documents`, `DELETE /gyms/:id/documents/:docId` | JWT | New (extends gym module) |
| **Gym Verification** | `PATCH /gyms/:id/verify` | JWT + super_admin | New (extends gym module) |
| **Gym Staff** | `POST /gyms/:id/staff`, `GET /gyms/:id/staff`, `DELETE /gyms/:id/staff/:userRoleId` | JWT + gym_owner/gym_admin | New (extends gym + role modules) |
| **Notifications** | `POST /notifications/send` (admin), `GET /notifications` (user inbox) | JWT | New (stubbed) |
| **Health (enhanced)** | `GET /health` — now includes db + redis status | Public | Enhanced |
| **API Docs** | `GET /api/v1/docs` | Public | New |

### New Routes: ~25 endpoints

---

## 8. Event Contracts to Add

| Event Name | Category | Producer | Consumer | Payload |
|-----------|----------|----------|----------|---------|
| `user.password_reset_requested` | auth | AuthService | EmailStub | `{ userId, email, resetToken, expiresAt }` |
| `user.password_reset_completed` | auth | AuthService | AuditService | `{ userId, email }` |
| `user.profile_updated` | user | UserService | NotificationsStub | `{ userId, changedFields[] }` |
| `gym.documents_uploaded` | gym | GymService | VerificationWorkflow | `{ gymId, documentTypes[] }` |
| `gym.verification_status_changed` | gym | GymService | NotificationsStub | `{ gymId, oldStatus, newStatus, reviewerId }` |
| `gym.staff_added` | gym | GymService | NotificationsStub | `{ gymId, userId, roleSlug }` |
| `gym.staff_removed` | gym | GymService | — | `{ gymId, userId }` |
| `notification.email.required` | notification | Any service | EmailWorker | `{ to, template, data, cc?, bcc? }` |
| `notification.sms.required` | notification | Any service | SmsWorker | `{ to, template, data }` |
| `notification.push.required` | notification | Any service | PushWorker | `{ deviceTokens[], title, body, data }` |

### Total new events: 10
### Event queues: `auth`, `user`, `gym`, `notification`

---

## 9. UI Screens to Build (Web)

| Screen | Route | Auth | API Dependencies |
|--------|-------|------|-----------------|
| Login | `/login` | Public | `POST /auth/login` |
| Register | `/register` | Public | `POST /auth/register` |
| Forgot Password | `/forgot-password` | Public | `POST /auth/forgot-password` |
| Reset Password | `/reset-password/:token` | Public | `POST /auth/reset-password/:token` |
| Dashboard | `/dashboard` | JWT | `GET /users/me`, `GET /gyms/my` |
| Profile | `/profile` | JWT | `GET /users/me`, `PATCH /users/me` |
| Change Password | `/profile/change-password` | JWT | `PATCH /users/me/change-password` |
| Login History | `/profile/login-history` | JWT | `GET /auth/login-history` |
| My Gyms | `/gyms` | JWT | `GET /gyms/my` |
| Gym Detail | `/gyms/:id` | JWT | `GET /gyms/:id` |
| Gym Onboarding | `/gyms/new` | JWT | `POST /gyms` |
| Gym Documents | `/gyms/:id/documents` | JWT | Gym document endpoints |
| Gym Staff | `/gyms/:id/staff` | JWT | Gym staff endpoints |
| Admin Verification | `/admin/gyms/verify` | JWT + super_admin | `GET /gyms?onboardingStatus=pending`, `PATCH /gyms/:id/verify` |

### Total screens (web): ~14

---

## 10. Acceptance Criteria

| # | Criterion | Epic | Verification Method |
|---|-----------|------|-------------------|
| AC1 | Forgot password generates reset token; reset endpoint updates hash | A | curl test: forgot → reset → login with new password |
| AC2 | Reset token expires after 1 hour | A | Wait 1h (or verify TTL in Redis), attempt reset → 410 Gone |
| AC3 | GET /users/me returns authenticated user profile (no password hash) | A | Response excludes password_hash, refresh_token |
| AC4 | PATCH /users/me updates firstName, lastName, phone | A | DB reflects updated fields |
| AC5 | Change password validates old password before update | A | Incorrect oldPassword → 401; correct → hash updated |
| AC6 | Login creates audit entry with IP, user agent, timestamp | B | audit_logs table has LOGIN entry after login |
| AC7 | Rate limiting blocks 6th login attempt within 1 minute | B | curl 6 requests → 429 on 6th; Retry-After header present |
| AC8 | Gym document upload returns file metadata and saves to disk/S3 | C | POST file → response includes id, filename, mimetype, url |
| AC9 | Gym verification transitions through valid state machine | C | Only valid transitions (pending→documents→review→active/rejected) |
| AC10 | Only super_admin can set gym to 'active' status | C | gym_owner PATCH verify → 403 |
| AC11 | Gym staff management adds/removes users with gym-scoped roles | C | UserRole.gymId set; staff list scoped to gym |
| AC12 | NotificationService dispatches to all enabled channels | D | Logs show "EmailChannel.send would send to X" |
| AC13 | BullMQ notification queues process jobs | D | Queue worker logs receipt of email/sms/push events |
| AC14 | Staging URL responds 200 with valid SSL | E | `curl https://api-staging.fitcore.app/health` returns 200 |
| AC15 | CloudWatch log group receives backend logs | E | Log group `/ecs/fitcore-backend` has entries |
| AC16 | Sentry captures unhandled exception | E | Throw test error → Sentry dashboard shows it |
| AC17 | Swagger UI renders at /api/v1/docs | E | GET /api/v1/docs returns HTML; all endpoints listed |
| AC18 | Web login page authenticates and redirects to dashboard | F | e2e: fill form → submit → dashboard URL |
| AC19 | Web register page creates user and redirects to login | F | e2e: fill registration → redirect to /login |
| AC20 | Dashboard shows gym list and user menu | F | Dashboard renders gym cards; user name visible in header |

---

## 11. Risks and Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | AWS account provisioning delayed | Medium | High (blocks E1) | Use local dev as fallback; Terraform config prepared in advance |
| R2 | Web frontend 10 points exceeds capacity | Medium | Medium | Reduce scope: profile page + password change deferred to Sprint 3 if needed |
| R3 | File upload security (malicious files) | Low | High | Validate MIME type server-side; limit file size (10MB); scan with ClamAV in production |
| R4 | Notification stubs created but interface contracts drift from Phase 2 | Medium | Medium | Notification interfaces reviewed and frozen by end of Sprint 2; documented in shared types |
| R5 | Sentry DSN/CloudWatch config requires production AWS secrets | Low | Low | Use environment variables with development fallback |
| R6 | Rate limiting blocks legitimate users if too aggressive | Low | Low | Configurable via env var; default 5/min but adjustable per deployment |

---

## 12. Blueprint Feature Mapping

Every Sprint 2 deliverable maps to the FITCORE PRO BLUEPRINT:

| Blueprint Section | Sprint 2 Coverage | Delivered By | Deferred? |
|------------------|-------------------|-------------|-----------|
| **Auth Module** | Password reset, forgot password, profile management | A1, A2 | — |
| **User Module** | Profile CRUD, password change, avatar | A2 | — |
| **Audit Logging** | Login history, authentication audit trail | B1 | — |
| **Security** | Rate limiting on auth endpoints | B2 | — |
| **Gym Onboarding** | Document upload, verification workflow, state machine | C1, C2 | — |
| **Gym Management** | Staff CRUD, gym-scoped roles | C3 | — |
| **Notification Infrastructure** | Channel interfaces, event contracts, stubs for SMS/Email/Push | D1, D2, D3 | Real delivery |
| **Event Architecture** | 10 new event contracts across auth/user/gym/notification | D1-D3 | — |
| **Environment & Deployment** | AWS staging (ECR, ECS, RDS, Redis, ALB, CloudFront, Route53) | E1 | — |
| **Monitoring** | CloudWatch logs, Sentry error tracking, health dashboard | E2 | — |
| **API Documentation** | OpenAPI/Swagger auto-documentation | E3 | — |
| **Customer App (Web)** | Next.js app with auth pages, dashboard, gym screens | F1-F4 | Mobile app |
| **Customer App (Mobile)** | — | — | Phase 3 |
| **Membership & Billing** | — | — | Phase 2 |
| **Payments** | — | — | Phase 2 |
| **Analytics** | — | — | Phase 3 |
| **AI/ML** | — | — | Phase 3 |
| **Biometric Integration** | — | — | Phase 3 |

---

## 13. Remaining Phase 1 Roadmap

| Sprint | Status | Points | Scope |
|--------|--------|--------|-------|
| Sprint 1 | ✅ **COMPLETE** | 30 → 30 delivered | Foundation: monorepo, Docker, Prisma, auth, RBAC, multi-tenancy, gym CRUD, BullMQ, Redis |
| Sprint 2 | 📋 **PLANNED** | 58 | Password reset, profile, gym onboarding, notifications, deploy, monitoring, web app |
| Sprint 3 (buffer) | ⏳ **NOT STARTED** | 30 | Integration tests, E2E tests, security audit, performance baseline, pilot prep |

### Phase 1 Forecast

- **Sprint 1 delivered:** 30 points (100% of target)
- **Sprint 2 target:** 58 points
- **Sprint 3 target:** 0-30 points (buffer — used for quality/security/pilot if needed)
- **Total Phase 1:** 88-118 points (vs original plan of 121 — reduction due to Express vs NestJS simplification; quality remains equal or higher)
- **Projected Phase 1 completion:** End of Sprint 2 (4 weeks total) with Sprint 3 as optional quality buffer

### Blueprint Features Deferred Beyond Phase 1

| Feature | Blueprint Reference | Target Phase |
|---------|-------------------|-------------|
| Membership Plans & Pricing | Membership Module | Phase 2 Sprint 4 |
| Customer Memberships | Membership Module | Phase 2 Sprint 4 |
| Payment Integration (Razorpay) | Payment Module | Phase 2 Sprint 4 |
| Trainer Management | Trainer Module | Phase 2 Sprint 5 |
| PT Session Booking | PT Session Module | Phase 2 Sprint 5 |
| Supplement Marketplace | Supplement Module | Phase 2 Sprint 5 |
| Workout Tracking | Workout Module | Phase 2 Sprint 6 |
| Diet Plans & Nutrition | Nutrition Module | Phase 2 Sprint 6 |
| Equipment Management | Equipment Module | Phase 2 Sprint 5 |
| Real Notification Delivery | Notification Module | Phase 2 Sprint 4 |
| Mobile App (React Native) | Mobile Platform | Phase 3 |
| AI Recommendations | AI Service | Phase 3 |
| Biometric Gateway | Biometric Service | Phase 3 |
| Advanced Analytics | Analytics Module | Phase 3 |

---

## 14. Updated Completion Forecast

```
Phase Start:  Week 1 (Sprint 1)
Current:      Week 2 — Sprint 1 COMPLETE ✅
Projected:
  Sprint 2 end:   Week 4 — Phase 1 foundation complete
  Sprint 3 end:   Week 6 — Pilot readiness (if Sprint 3 used)
  Phase 2 start:  Week 5 (or Week 7 if Sprint 3 needed)

All 16 deferred tables remain on schedule for Phase 2 activation:
  Sprint 4: membership_plans, memberships, payments, notifications
  Sprint 5: trainers, pt_sessions, supplements, supplement_orders, equipment, maintenance_jobs
  Sprint 6: workouts, body_metrics, diet_plans, food_logs, loyalty_points
  Phase 3:  ai_recommendations
```

---

*End of Sprint 2 Planning Package*

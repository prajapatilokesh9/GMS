# Phase 0 Foundation — Phase 1 MVP Development Backlog
## Complete Sprint-by-Sprint Work Breakdown

**Reference:** FITCORE PRO BLUEPRINT — Development Roadmap Phase 1 (Months 2-4)
**Version:** 1.0 | **Date:** June 2026

---

## 1. PHASE 1 MVP SCOPE

| Metric | Target |
|--------|--------|
| **Duration** | 3 months (Months 2-4) |
| **Team** | 6 people (1 PM, 1 Designer, 2 Backend, 2 Frontend) |
| **Pilot Gyms** | 3 |
| **Pilot Members** | 100+ |
| **Payment Success Rate** | 95%+ |
| **Page Load Time** | <2 seconds |
| **Test Coverage** | 60% unit, 20% integration |

### MVP Inclusions (Blueprint P0 features enabled by end of Phase 1):
- ✅ Authentication (JWT + OAuth + password reset)
- ✅ Gym profile CRUD + dashboard
- ✅ Membership plans (fixed) + billing (Razorpay)
- ✅ Customer app: signup, goal selection, gym discovery (GPS), buy membership, view status
- ✅ Notifications: SMS (Twilio), email (SendGrid), push (Firebase)
- ✅ Basic analytics: member count, revenue, trends (PostgreSQL queries)
- ✅ Mobile app: auth, discovery, membership management, home screen
- ✅ Multi-tenancy foundation (RLS, tenant_id everywhere)
- ✅ RBAC framework (roles, permissions, guards)

---

## 2. EPIC & STORY HIERARCHY

```
Phase 1 MVP
├── Epic 1: Project Foundation & Infrastructure
│   ├── Story 1.1: Monorepo setup (Turborepo + npm workspaces)
│   ├── Story 1.2: Docker Compose local dev (Postgres 16 + Redis 7)
│   ├── Story 1.3: Prisma schema + initial migration (core tables)
│   ├── Story 1.4: CI/CD pipeline (GitHub Actions)
│   └── Story 1.5: Environment configuration (dev/staging/prod)
│
├── Epic 2: Authentication System
│   ├── Story 2.1: User registration (email + password)
│   ├── Story 2.2: JWT login + refresh tokens
│   ├── Story 2.3: Google OAuth integration
│   ├── Story 2.4: Apple OAuth integration
│   ├── Story 2.5: Password reset flow
│   ├── Story 2.6: Multi-tenancy middleware (tenant extraction + RLS)
│   └── Story 2.7: RBAC guards + permission decorators
│
├── Epic 3: Gym Management
│   ├── Story 3.1: Gym profile CRUD (create, read, update, delete)
│   ├── Story 3.2: Gym dashboard API (active members, revenue, attendance)
│   ├── Story 3.3: Operating hours management
│   ├── Story 3.4: Gym branding (logo, cover, description)
│   └── Story 3.5: Slug generation + SEO URL setup
│
├── Epic 4: Membership Plans & Billing
│   ├── Story 4.1: Membership plan CRUD (fixed type)
│   ├── Story 4.2: Razorpay integration (payment intent, verify, webhook)
│   ├── Story 4.3: Membership purchase flow (customer buys plan)
│   ├── Story 4.4: Membership status management (active/expired/paused)
│   ├── Story 4.5: Auto-renewal logic (with JWT expiry check)
│   ├── Story 4.6: Membership cancellation flow
│   └── Story 4.7: Invoice generation (auto-email on payment)
│
├── Epic 5: Customer App (Mobile)
│   ├── Story 5.1: Splash screen + auto-login
│   ├── Story 5.2: Onboarding flow (goal selection, fitness level)
│   ├── Story 5.3: Gym discovery (GPS-based list + map)
│   ├── Story 5.4: Gym detail screen (info, plans, photos)
│   ├── Story 5.5: Membership purchase flow (select plan → pay → activate)
│   ├── Story 5.6: Membership status screen (days left, QR code)
│   ├── Story 5.7: Home screen (badge, quick actions)
│   └── Story 5.8: Profile screen (edit profile)
│
├── Epic 6: Notifications
│   ├── Story 6.1: SMS service (Twilio integration — welcome SMS, renewal reminder)
│   ├── Story 6.2: Email service (SendGrid — welcome email, invoice, reminders)
│   ├── Story 6.3: Push notification service (Firebase — membership alerts)
│   ├── Story 6.4: Notification queue (BullMQ — async dispatch)
│   └── Story 6.5: Notification template engine (dynamic content)
│
├── Epic 7: Basic Analytics
│   ├── Story 7.1: Gym dashboard — active members count
│   ├── Story 7.2: Gym dashboard — revenue this month chart
│   ├── Story 7.3: Gym dashboard — member signup trend
│   ├── Story 7.4: Customer dashboard — membership expiry countdown
│   └── Story 7.5: Data export (CSV — members list, payments)
│
├── Epic 8: Web Application (Web)
│   ├── Story 8.1: Landing page + features + pricing
│   ├── Story 8.2: Login / Register pages
│   ├── Story 8.3: Gym owner dashboard (web)
│   ├── Story 8.4: Member management (list, search, detail)
│   ├── Story 8.5: Membership plan management
│   ├── Story 8.6: Public gym pages (SEO)
│   └── Story 8.7: Forgot / reset password pages
│
├── Epic 9: Admin Portal (Company Staff)
│   ├── Story 9.1: Company staff login (different auth flow)
│   ├── Story 9.2: Gym overview list (all gyms in territory)
│   ├── Story 9.3: Gym detail view (plan, subscription, members count)
│   └── Story 9.4: Basic support ticket creation
│
└── Epic 10: Testing & Quality
    ├── Story 10.1: Unit test setup (Jest) — write tests for auth, gyms, memberships
    ├── Story 10.2: Integration test setup — API endpoint tests
    ├── Story 10.3: E2E test setup — critical paths (signup → join gym → pay)
    ├── Story 10.4: Security audit (OWASP Top 10 basics)
    └── Story 10.5: Performance baseline (load test critical APIs)
```

---

## 3. SPRINT PLAN (12 Sprints × 1 Week)

### Sprint 1: Foundation
| Story | Points | Owner | Dependencies |
|-------|--------|-------|-------------|
| 1.1 Monorepo setup | 3 | DevOps | None |
| 1.2 Docker Compose local dev | 2 | DevOps | 1.1 |
| 1.3 Prisma schema + initial migration | 5 | Backend | 1.2 |
| 1.4 CI/CD pipeline | 3 | DevOps | 1.1 |
| 1.5 Env configuration | 1 | DevOps | 1.2 |
| 2.1 User registration | 5 | Backend | 1.3 |
| 2.6 Multi-tenancy middleware | 3 | Backend | 1.3 |
| Design: Auth screens | 3 | Designer | None |
| **Sprint 1 Total** | **25** | | |

### Sprint 2: Auth + Gym Core
| Story | Points | Owner | Dependencies |
|-------|--------|-------|-------------|
| 2.2 JWT login + refresh tokens | 5 | Backend | 2.1 |
| 2.3 Google OAuth | 5 | Backend | 2.2 |
| 2.5 Password reset flow | 3 | Backend | 2.2 |
| 2.7 RBAC guards + permissions | 5 | Backend | 2.2, 2.6 |
| 3.1 Gym profile CRUD | 5 | Backend | 2.7 |
| 3.5 Slug generation + SEO URL | 2 | Backend | 3.1 |
| **Sprint 2 Total** | **25** | | |

### Sprint 3: Membership Plans
| Story | Points | Owner | Dependencies |
|-------|--------|-------|-------------|
| 4.1 Membership plan CRUD | 5 | Backend | 3.1 |
| 4.2 Razorpay integration | 8 | Backend | 2.2 |
| 3.2 Gym dashboard API | 5 | Backend | 3.1, 4.1 |
| 4.3 Membership purchase flow | 5 | Backend | 4.1, 4.2 |
| Design: Dashboard + mobile screens | 5 | Designer | None |
| **Sprint 3 Total** | **28** | | |

### Sprint 4: Payments + Membership
| Story | Points | Owner | Dependencies |
|-------|--------|-------|-------------|
| 4.4 Membership status management | 3 | Backend | 4.3 |
| 4.5 Auto-renewal logic | 5 | Backend | 4.3 |
| 4.6 Cancellation flow | 2 | Backend | 4.4 |
| 4.7 Invoice generation | 3 | Backend | 4.2 |
| 8.1 Landing page + features + pricing | 5 | Frontend | None |
| 8.2 Login / Register pages | 5 | Frontend | 2.1, 2.2 |
| **Sprint 4 Total** | **23** | | |

### Sprint 5: Web Dashboard — Gym Owner
| Story | Points | Owner | Dependencies |
|-------|--------|-------|-------------|
| 8.3 Gym owner dashboard (web) | 8 | Frontend | 3.2, 4.4 |
| 8.4 Member management (list, search, detail) | 8 | Frontend | 8.3 |
| 8.5 Membership plan management | 5 | Frontend | 8.3 |
| 8.7 Forgot/reset password pages | 3 | Frontend | 2.5 |
| 6.1 SMS service (Twilio) | 5 | Backend | None |
| 6.2 Email service (SendGrid) | 5 | Backend | None |
| **Sprint 5 Total** | **34** | | |

### Sprint 6: Notifications + Mobile Start
| Story | Points | Owner | Dependencies |
|-------|--------|-------|-------------|
| 6.3 Push notification service (Firebase) | 5 | Backend | None |
| 6.4 Notification queue (BullMQ) | 5 | Backend | 6.1, 6.2, 6.3 |
| 6.5 Notification template engine | 3 | Backend | 6.4 |
| 5.1 Splash screen + auto-login (mobile) | 5 | Frontend | 2.2 |
| 5.2 Onboarding flow (mobile) | 5 | Frontend | 5.1 |
| **Sprint 6 Total** | **23** | | |

### Sprint 7: Mobile — Discovery
| Story | Points | Owner | Dependencies |
|-------|--------|-------|-------------|
| 5.3 Gym discovery (GPS list + map) | 8 | Frontend | 5.1 |
| 5.4 Gym detail screen | 5 | Frontend | 5.3 |
| 3.3 Operating hours management | 2 | Backend | None |
| 3.4 Gym branding | 2 | Backend | None |
| 7.1 Dashboard — active members count | 3 | Backend | 4.3 |
| 7.2 Dashboard — revenue chart | 3 | Backend | 4.3 |
| **Sprint 7 Total** | **23** | | |

### Sprint 8: Mobile — Membership + Home
| Story | Points | Owner | Dependencies |
|-------|--------|-------|-------------|
| 5.5 Membership purchase flow (mobile) | 8 | Frontend | 5.4, 4.2 |
| 5.6 Membership status screen | 5 | Frontend | 5.5 |
| 5.7 Home screen | 5 | Frontend | 5.5 |
| 5.8 Profile screen | 3 | Frontend | 5.1 |
| 7.3 Dashboard — member signup trend | 3 | Backend | 4.3 |
| **Sprint 8 Total** | **24** | | |

### Sprint 9: Analytics + Public Pages
| Story | Points | Owner | Dependencies |
|-------|--------|-------|-------------|
| 7.4 Customer dashboard — expiry countdown | 2 | Frontend | 5.6 |
| 7.5 Data export (CSV) | 5 | Backend | None |
| 8.6 Public gym pages (SEO) | 8 | Frontend | 3.5 |
| 9.1 Staff login | 3 | Frontend | 2.2 |
| 9.2 Staff gym overview list | 5 | Frontend | 9.1 |
| **Sprint 9 Total** | **23** | | |

### Sprint 10: Admin Portal + Notifications Wiring
| Story | Points | Owner | Dependencies |
|-------|--------|-------|-------------|
| 9.3 Staff gym detail view | 5 | Frontend | 9.2 |
| 9.4 Basic support ticket creation | 5 | Frontend | 9.2 |
| Notification wiring with membership events | 5 | Backend | 6.4, 4.4 |
| Alert emails: welcome, renewal D-7, D-3, D-1 | 5 | Backend | 6.4, 6.5 |
| **Sprint 10 Total** | **20** | | |

### Sprint 11: Testing & Quality
| Story | Points | Owner | Dependencies |
|-------|--------|-------|-------------|
| 10.1 Unit tests (auth, gyms, memberships) | 8 | Backend | All backend |
| 10.2 Integration tests (API endpoints) | 8 | Backend | All backend |
| 10.3 E2E tests (signup → join → pay) | 5 | QA | All frontend |
| 10.4 Security audit (OWASP basics) | 3 | DevOps | None |
| 10.5 Performance baseline | 3 | DevOps | None |
| **Sprint 11 Total** | **27** | | |

### Sprint 12: Pilot Launch Preparation
| Story | Points | Owner | Dependencies |
|-------|--------|-------|-------------|
| Bug fixes (from testing) | 8 | All | Sprint 11 |
| Pilot gym onboarding (3 gyms) | 5 | PM/DevOps | All |
| Seed data for pilot | 3 | Backend | None |
| Monitoring setup (Sentry) | 3 | DevOps | None |
| Deployment to staging | 3 | DevOps | None |
| Documentation | 5 | All | None |
| **Sprint 12 Total** | **27** | | |

---

## 4. MVP DELIVERY CHECKLIST (End of Phase 1)

### Functional Completion
- [ ] User can register, login, reset password
- [ ] Google/Apple OAuth works
- [ ] Gym owner can create/edit gym profile
- [ ] Gym owner can create membership plans (fixed type)
- [ ] Customer can browse gyms near their location
- [ ] Customer can view gym details and plans
- [ ] Customer can select plan and pay via Razorpay (UPI, card)
- [ ] Membership activates immediately after payment
- [ ] Customer sees membership status with days left
- [ ] Auto-renewal reminder sent at D-7, D-3, D-1
- [ ] SMS and email sent on membership creation and renewal
- [ ] Gym owner dashboard shows active members and revenue
- [ ] Public gym pages are crawlable by Google
- [ ] Company staff can view gym list and details
- [ ] Support ticket can be created

### Non-Functional Requirements
- [ ] All APIs return <500ms p95
- [ ] Web app Lighthouse score >70
- [ ] Mobile app renders in <3s on 4G
- [ ] All 21 DB tables created with proper indexes
- [ ] RLS enabled on all tenant-scoped tables
- [ ] JWT auth with RS256
- [ ] Rate limiting on public endpoints
- [ ] CI/CD pipeline passing (lint → test → build → deploy)

### Phase 1 Explicit Exclusions (Phase 2+)
- ❌ PAYG & Flex membership types (Phase 2)
- ❌ Trainer management (Phase 2)
- ❌ Supplement marketplace (Phase 2)
- ❌ Equipment management (Phase 2)
- ❌ Maintenance jobs (Phase 2)
- ❌ Nutritionist module (Phase 2)
- ❌ Biometric scanning (Phase 2)
- ❌ AI/ML features (Phase 3)
- ❌ ClickHouse analytics (Phase 3)
- ❌ Video consultations (Phase 3)
- ❌ Health integrations (Phase 4)
- ❌ Multi-language/currency (Phase 4)
- ❌ White-label (Phase 3)
- ❌ IoT telemetry (Phase 5)

---

## 5. STORY POINT ESTIMATION GUIDE

| Size | Points | Description | Example |
|------|--------|-------------|---------|
| XS | 1 | Trivial change | Environment config |
| S | 2-3 | Simple task, well-understood | Password reset flow |
| M | 5 | Moderate complexity | Gym profile CRUD |
| L | 8 | Complex, multiple sub-tasks | Razorpay integration |
| XL | 13 | Very complex, unknown unknowns | Full payment flow |

### Velocity Assumptions
- Team of 6: ~25-30 story points per sprint
- 12 sprints × 28 avg = ~336 total points
- Buffer: ~10% for bugs/unplanned work

---

## 6. DEPENDENCY MAPPING

```
Critical Path (can't parallelise):
Monorepo → DB Schema → Auth → Gym CRUD → Plans → Payments → Membership → 
                                                                     ↓
Notifications ←── BullMQ ←── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘

Frontend:
Landing + Auth Pages → Dashboard → Member Management → Analytics
                                 ↓
Mobile Auth → Onboarding → Discovery → Purchase → Home → Profile

Parallelisable:
- Admin Portal can start alongside Epics 3-4
- Notifications can start alongside Epic 4
- Analytics can start alongside Epic 5
- Testing can start Sprint 10 (integration)
```

---

## 7. RISK ITEMS IN PHASE 1

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Razorpay integration complexities | Medium | High | Start early (Sprint 3), use sandbox, have Stripe as backup |
| Mobile GPS discovery performance | Medium | Medium | Use PostGIS + spatial indexes, paginate results |
| JWT token refresh edge cases | Medium | Medium | Automated refresh, 7-day expiry, secure storage |
| Multi-tenancy RLS issues | Low | High | Thorough test coverage for cross-tenant access |
| Team velocity lower than estimated | Medium | Medium | Prioritise P0 stories, defer P1 to Phase 2 |
| App store review delays (mobile) | Low | Medium | Submit for review by Sprint 10, use TestFlight |
| Third-party API rate limits | Low | Medium | Implement caching, circuit breaker pattern |

---

*End of Document — Phase 1 MVP Backlog v1.0*

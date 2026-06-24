# Phase 0 Foundation — Implementation Execution Plan
## Milestones, Acceptance Criteria & Governance

**Reference:** FITCORE PRO BLUEPRINT — Development Roadmap (Phases 1-5)
**Version:** 1.0 | **Date:** June 2026

---

## 1. EXECUTION OVERVIEW

```
Phase 0 (Weeks 1-4) ─── Phase 1 (Months 2-4) ─── Phase 2 (Months 5-7) ─── Phase 3 (Months 8-10) ─── Phase 4 (Months 11-12) ─── Phase 5 (Month 13+)
    Foundation               MVP Core               Marketplace              AI & Intelligence      Scale & Polish          Expansion
         │                        │                        │                        │                      │                     │
         ▼                        ▼                        ▼                        ▼                      ▼                     ▼
    ✓ Wireframes              ✓ 3 Pilot Gyms           ✓ 10 Gyms                ✓ 20 Gyms              ✓ 50 Gyms              ✓ 200+ Gyms
    ✓ DB Schema               ✓ 100 Members           ✓ 2 Supp Cos             ✓ 500 Active           ✓ 3K Members           ✓ 10K+ Members
    ✓ API Spec                ✓ 95% Payment           ✓ 5 Trainers             ✓ 40% Renewal           ✓ 99.95% Uptime        ✓ International
    ✓ Design System           ✓ <2s Load              ✓ 100 Orders             ✓ ClickHouse            ✓ <100ms p95           ✓ IoT Telemetry
    ✓ Infra Setup             ✓ 60% Coverage          ✓ 50 PT Sessions         ✓ ML Models             ✓ Lighthouse 90+       ✓ Stripe Global
```

---

## 2. PHASE 0: FOUNDATION (WEEKS 1-4) — COMPLETION TRACKER

| Week | Deliverable | Owner | Status | Acceptance Criteria |
|------|------------|-------|--------|-------------------|
| **W1** | System decomposition document (22 services) | Tech Lead | ✅ Complete | All services identified with responsibility, owner, and API routes mapped |
| **W1** | Project folder architecture | Tech Lead | ✅ Complete | Monorepo structure created in GitHub with all directories per blueprint |
| **W1** | UI/UX wireframes — 8 roles (low-fi) | Designer | In Progress | 171 screens mapped, wireframes for all 8 role dashboards + mobile |
| **W2** | Complete DB schema (21 tables) | Backend Lead | ✅ Complete | All tables with columns, types, relationships, indexes, RLS per blueprint |
| **W2** | OpenAPI 3.1 specification | Backend Lead | ✅ Complete | All 150+ endpoints documented with request/response schemas |
| **W2** | Event architecture mapping | Backend Lead | ✅ Complete | All events, producers, consumers, cron jobs mapped |
| **W2** | AWS infrastructure setup | DevOps | ✅ Complete | RDS PostgreSQL 16, ElastiCache Redis, ECS Fargate (staging) |
| **W2** | GitHub repo + CI/CD pipeline | DevOps | ✅ Complete | Monorepo with Turborepo, GitHub Actions, lint/test/deploy workflows |
| **W3** | Design system (Figma) | Designer | In Progress | Component library, colour tokens, typography, spacing, iconography |
| **W3** | User role matrix (9 roles, 102 permissions) | Tech Lead | ✅ Complete | Complete permission grid with data scoping rules |
| **W3** | Screen/page inventory (171 screens) | Designer | ✅ Complete | All web + mobile + admin screens mapped to routes |
| **W3** | Local dev environment | DevOps | In Progress | Docker Compose (Postgres 16 + Redis 7 + Elasticsearch), seeding scripts |
| **W4** | Phase 1 MVP backlog (12 sprints) | PM | ✅ Complete | Stories, points, dependencies, sprint plan per blueprint |
| **W4** | Technical dependencies & infra plan | DevOps | ✅ Complete | All 3rd-party services, costs, infra specs documented |
| **W4** | Execution plan with milestones | PM | ✅ Complete | M1-M5 milestones, acceptance criteria, governance |
| **W4** | Team onboarding & tooling setup | All | In Progress | All devs have local env running, access to AWS/GitHub |

### Phase 0 Exit Criteria (Gate to Phase 1)

| # | Criterion | Verification Method | Status |
|---|-----------|-------------------|--------|
| 1 | All 10 foundation documents approved by stakeholders | Document sign-off | ⏳ Pending |
| 2 | System decomposition matches blueprint exactly | Peer review | ✅ Complete |
| 3 | DB schema contains all 21 tables with proper indexes and RLS | Schema review + `prisma db push` | ⏳ Pending |
| 4 | OpenAPI spec covers all Phase 1 MVP endpoints | Spec review | ⏳ Pending |
| 5 | Event architecture maps all data flows from blueprint | Architecture review | ✅ Complete |
| 6 | Role matrix covers all 9 roles with 102 permissions | Access control review | ✅ Complete |
| 7 | Screen inventory covers all 171 screens | Design review | ✅ Complete |
| 8 | Phase 1 backlog is estimated and prioritised | Backlog grooming | ✅ Complete |
| 9 | Infrastructure dependencies are costed and ordered | Budget approval | ⏳ Pending |
| 10 | Local dev environment works for all team members | `npm run dev:backend` passes | ⏳ Pending |

---

## 3. PHASE-LEVEL MILESTONES (M1-M5)

### Milestone M1: MVP Core Complete (End of Month 4)

**Business Goal:** 3 pilot gyms live with 100+ members paying via Razorpay

| Acceptance Criteria | Target | Measurement |
|--------------------|--------|-------------|
| User registration + login (email, Google, Apple) works end-to-end | ✅ | E2E test passes |
| Gym owner can create gym profile, plans, view dashboard | ✅ | Manual QA sign-off |
| Razorpay payment flow (UPI, card, wallet) completes successfully | 95%+ success rate | Payment logs |
| Customer mobile app: discover gym → select plan → pay → membership active | ✅ | E2E test passes |
| Membership auto-renewal reminders (SMS + email + push) at D-7, D-3, D-1 | ✅ | Automated test |
| Gym dashboard shows: active members, revenue this month, trends | ✅ | Screenshot comparison |
| Company staff can view gym list, details, create support tickets | ✅ | Manual QA |
| Public gym pages are crawlable with Schema.org markup | ✅ | Google Structured Data Test |
| Multi-tenancy RLS prevents cross-tenant data access | ✅ | Security test |
| API response time <500ms p95 under load (50 concurrent users) | ✅ | k6 load test |
| Unit test coverage >60%, integration >20% | ✅ | Jest coverage report |
| No critical or high-severity security vulnerabilities | ✅ | Snyk + OWASP scan |

**Go/No-Go Decision:** PM + Tech Lead review against criteria. If <90% met, extend Phase 1 by 2 weeks.

### Milestone M2: Marketplace Launched (End of Month 7)

**Business Goal:** 10 gyms, 2 supplement companies, 5 independent trainers active

| Acceptance Criteria | Target | Measurement |
|--------------------|--------|-------------|
| Trainer can create profile, set availability, accept bookings | ✅ | E2E test |
| PT session booking flow: customer selects trainer → pays → session scheduled | ✅ | E2E test |
| Supplement company can onboard, list products (zero-inventory) | ✅ | Manual QA |
| Customer can order supplement → payment → order routed to company | ✅ | Integration test |
| Trainer earns supplement commission on recommended sales | ✅ | Revenue engine test |
| Equipment manufacturer can list products, receive leads | ✅ | Manual QA |
| Gym can register biometric device, members enter via QR/face | ✅ | Integration test |
| Maintenance job board: gym creates job → technician accepts → completes | ✅ | E2E test |
| Google My Business sync: hours/photos/offers auto-update | ✅ | GMB API test |
| Video consultation (Jitsi) works for PT/nutritionist bookings | ✅ | Manual QA |
| API response time <300ms p95 | ✅ | k6 load test |

### Milestone M3: AI & Intelligence Active (End of Month 10)

**Business Goal:** 20 gyms, 500+ active members, 40% improvement in renewal rate

| Acceptance Criteria | Target | Measurement |
|--------------------|--------|-------------|
| Churn prediction model (XGBoost) runs nightly, accuracy >80% | ✅ | ML model eval |
| At-risk members (>70% probability) receive personalised offers | ✅ | A/B test conversion |
| Workout AI generates 4-week plan based on goal + level | ✅ | User satisfaction survey |
| Diet AI generates meal plan based on dietary preferences + macros | ✅ | User satisfaction survey |
| ClickHouse analytics: MRR/ARR/churn/cohort dashboards real-time | ✅ | Dashboard query speed |
| White-label: gym-branded mobile app with custom domain | ✅ | Manual QA |
| Birthday offers auto-generated 3 days before member's birthday | ✅ | Automated test |
| Monthly progress report (PDF) auto-generated and emailed | ✅ | Integration test |
| API response time <200ms p95 | ✅ | k6 load test |

### Milestone M4: Scale Ready (End of Month 12)

**Business Goal:** 50 gyms, 3K+ members, 99.95% uptime, 4.5+ app store rating

| Acceptance Criteria | Target | Measurement |
|--------------------|--------|-------------|
| Kubernetes auto-scaling handles 2x peak load | ✅ | Load test (1000 concurrent) |
| Database read replicas + Redis clustering operational | ✅ | Performance test |
| Franchise management: multi-branch gyms with central control | ✅ | Manual QA |
| Apple Health / Google Fit / Mi Band sync working | ✅ | Integration test |
| Multi-language: Hindi, Spanish, Gujarati, English | ✅ | UI screenshot review |
| Multi-currency: INR, USD, EUR, GBP | ✅ | Payment test |
| E-signature (DocuSign) for membership agreements | ✅ | E2E test |
| GDPR/DPDP data export + deletion workflow | ✅ | Compliance audit |
| Penetration test passes with no critical findings | ✅ | VAPT report |
| Mobile app <30MB, Lighthouse score >90 | ✅ | Performance audit |
| App store rating 4.5+ (1000+ reviews) | ✅ | App store dashboard |

### Milestone M5: Expansion Ready (Month 13+)

**Business Goal:** International expansion, IoT integration, B2B data intelligence

| Acceptance Criteria | Target | Measurement |
|--------------------|--------|-------------|
| Stripe global payments (Visa, MC, ACH, PayPal) | ✅ | Payment test per region |
| IoT telemetry ingestion from smart equipment | ✅ | Integration test |
| Predictive maintenance alerts from ML models | ✅ | Alert accuracy >90% |
| B2B data intelligence API with subscription tiers | ✅ | API test + sign-up flow |
| Third-party app integrations (Shopify, WooCommerce) | ✅ | Integration test |
| South Asia, SE Asia, Middle East regional onboarding | ✅ | Regional pilot sign-off |

---

## 4. PROJECT GOVERNANCE

### Team Structure

| Role | Phase 1 Count | Responsibilities | Reporting To |
|------|--------------|-----------------|--------------|
| **Product Manager** | 1 | Backlog, stakeholder mgmt, business decisions, pilot coordination | CEO |
| **Tech Lead / Backend Lead** | 1 | Architecture decisions, code quality, sprint planning, mentoring | CTO |
| **Backend Engineer** | 1 | NestJS API development, database, integrations | Tech Lead |
| **Frontend Engineer (Web)** | 1 | Next.js web app, admin portal, SEO pages | Tech Lead |
| **Frontend Engineer (Mobile)** | 1 | React Native mobile app, Expo, biometric SDK | Tech Lead |
| **DevOps Engineer** | 1 | CI/CD, AWS infrastructure, monitoring, security | Tech Lead |
| **UI/UX Designer** | 1 (shared) | Design system, wireframes, prototypes | PM |
| **QA Engineer** | 0 (shared in Phase 2) | Testing, automation | Tech Lead |

### Ceremonies

| Ceremony | Frequency | Duration | Attendees | Purpose |
|----------|-----------|----------|-----------|---------|
| **Daily Standup** | Daily | 15 min | All | What I did, what I'll do, blockers |
| **Sprint Planning** | Bi-weekly (Mon) | 2 hours | PM + Tech Lead + Devs | Plan next sprint from backlog |
| **Sprint Review / Demo** | Bi-weekly (Fri) | 1 hour | All + Stakeholders | Demo completed work, gather feedback |
| **Retrospective** | Bi-weekly (Fri) | 1 hour | All | What went well, what to improve, action items |
| **Architecture Review** | Weekly | 1 hour | Tech Lead + Backend | Design decisions, technical debt review |
| **PM Sync** | Weekly | 30 min | PM + Tech Lead | Progress tracking, risk review |
| **Stakeholder Demo** | Monthly | 1 hour | PM + Stakeholders | Major milestone progress, pilot feedback |

### Communication Channels

| Channel | Purpose | Tool |
|---------|---------|------|
| **Daily updates** | Standup notes, blockers | Slack #fitcore-dev |
| **Code reviews** | PRs, architecture discussions | GitHub PR comments |
| **Design feedback** | UI/UX review | Figma comments |
| **Bug tracking** | Issues, feature requests | GitHub Issues |
| **Sprint tracking** | Backlog, velocity, burndown | Jira / Linear |
| **Documentation** | Architecture, API docs | GitHub Wiki + docs/ |
| **Urgent alerts** | Production incidents | Slack + PagerDuty |
| **Knowledge base** | How-tos, onboarding, runbooks | Notion / Confluence |

### Risk Management Review

| Review Cadence | Risk Register | Owner |
|---------------|--------------|-------|
| **Weekly** | Re-evaluate top 5 risks, update likelihood/impact | PM |
| **Monthly** | Full risk register review, add/remove items | PM + Tech Lead |
| **Per Phase** | Gate review — risk assessment before phase transition | Stakeholders |

---

## 5. PHASE 1 RESOURCE PLAN

### Staffing

| Role | Monthly Cost (₹) | Months | Total (₹) |
|------|-----------------|--------|-----------|
| Product Manager | 1,50,000 | 3 | 4,50,000 |
| Tech Lead | 2,50,000 | 3 | 7,50,000 |
| Backend Engineer | 1,50,000 | 3 | 4,50,000 |
| Frontend (Web) Engineer | 1,50,000 | 3 | 4,50,000 |
| Frontend (Mobile) Engineer | 1,50,000 | 3 | 4,50,000 |
| DevOps Engineer | 1,50,000 | 3 | 4,50,000 |
| UI/UX Designer | 80,000 | 1.5 (shared) | 1,20,000 |
| **Total People Cost** | | | **₹31,20,000** |

### Infrastructure & Services

| Item | Monthly Cost (₹) | Months | Total (₹) |
|------|-----------------|--------|-----------|
| AWS RDS + Redis | ~₹6,000 | 3 | ₹18,000 |
| AWS ECS Fargate | ~₹3,500 | 3 | ₹10,500 |
| S3 + CloudFront | ~₹500 | 3 | ₹1,500 |
| CloudFlare Pro | ~₹1,600 | 3 | ₹4,800 |
| Twilio SMS (est. 2000 SMS) | ~₹1,000 | 3 | ₹3,000 |
| SendGrid Email (est. 5000) | ~₹0 (free tier) | 3 | ₹0 |
| Razorpay (2% on ₹1.5L) | ~₹3,000 | 3 | ₹9,000 |
| Sentry Team | ~₹2,200 | 3 | ₹6,600 |
| Vercel Pro (if used) | ~₹1,600 | 3 | ₹4,800 |
| Miscellaneous (domains, etc.) | ₹500 | 3 | ₹1,500 |
| **Total Infrastructure** | | | **₹59,700** |

### Phase 1 Total Budget

| Category | Amount (₹) |
|----------|-----------|
| People | 31,20,000 |
| Infrastructure & Services | 59,700 |
| Third-party licenses | 25,000 |
| Contingency (10%) | 3,20,470 |
| **Total Phase 1** | **₹35,25,170 (~$42K USD)** |

---

## 6. PHASE TRANSITION CHECKLIST

### Gate: Phase 0 → Phase 1

| Check | Criteria | Verified By |
|-------|----------|-------------|
| [ ] | All 10 foundation documents approved | PM + Tech Lead + Stakeholders |
| [ ] | Design system at 80% (all major components) | Designer |
| [ ] | Local dev environment working for all devs | DevOps |
| [ ] | CI/CD pipeline passing (lint → test → build → deploy to staging) | DevOps |
| [ ] | AWS staging environment provisioned | DevOps |
| [ ] | Razorpay/Stripe sandbox accounts configured | Backend |
| [ ] | Twilio/SendGrid/Firebase dev keys obtained | Backend |
| [ ] | Phase 1 backlog prioritised and estimated | PM + Tech Lead |
| [ ] | Pilot gyms identified and agreements signed | PM |

### Gate: Phase 1 → Phase 2

| Check | Criteria | Verified By |
|-------|----------|-------------|
| [ ] | M1 milestones ≥90% met | PM + Tech Lead |
| [ ] | 3 pilot gyms active, 100+ members onboarded | PM |
| [ ] | Payment success rate ≥95% | Backend |
| [ ] | All P0 Blueprint features in Phase 1 scope delivered | Tech Lead |
| [ ] | No critical security vulnerabilities open | Security audit |
| [ ] | Phase 2 backlog prepared | PM |
| [ ] | Lessons learned documented and retro completed | Team |

### Gate: Phase 2 → Phase 3

| Check | Criteria | Verified By |
|-------|----------|-------------|
| [ ] | M2 milestones ≥90% met | PM + Tech Lead |
| [ ] | 10 gyms, 2 supplement companies, 5 trainers live | PM |
| [ ] | Biometric devices integrated at ≥2 pilot gyms | DevOps |
| [ ] | ClickHouse operational with event ingestion | DevOps |
| [ ] | ML engineer hired or allocated | CTO |

### Gate: Phase 3 → Phase 4

| Check | Criteria | Verified By |
|-------|----------|-------------|
| [ ] | M3 milestones ≥90% met | PM + Tech Lead |
| [ ] | 20 gyms active, 500+ members, 40% renewal improvement | PM + Analytics |
| [ ] | AI models in production with monitoring | ML Engineer |
| [ ] | Kubernetes migration complete | DevOps |
| [ ] | White-label builder operational | Frontend |

### Gate: Phase 4 → Phase 5

| Check | Criteria | Verified By |
|-------|----------|-------------|
| [ ] | M4 milestones ≥90% met | PM + Tech Lead |
| [ ] | 50 gyms, 3K+ members, 99.95% uptime | PM + DevOps |
| [ ] | App store rating 4.5+ with 1000+ reviews | PM |
| [ ] | Penetration test passed | Security audit |
| [ ] | International expansion plan approved | Stakeholders |

---

## 7. COMMUNICATION & REPORTING

### Weekly Status Report (Template)

```
# FitCore Pro — Weekly Status (Week X)

## Progress
- [ ] Sprint X/Y in progress (Day X of 10)
- [ ] Story points completed: X/Y (X%)
- [ ] Velocity: X points (avg Y over last 3 sprints)

## Key Accomplishments This Week
1. 
2. 
3. 

## Blockers
1. (Blocker) → Action: Assignee → ETA

## Risks
1. (Risk) → Mitigation: → Owner

## Next Week Priorities
1. 
2. 
3. 

## Metrics
- API p95 response time: Xms
- Error rate: X%
- Payment success rate: X%
- Test coverage: X%
```

### Burn-Down Chart

```
Points
40  ┤
    │
30  ┤    ●── Start (30 points)
    │     \
20  ┤      ●── Week 1 (22 remaining)
    │       \
10  ┤        ●── Week 2 (12 remaining)
    │         \
 0  ┤          ●── Week 3 (0 remaining — Sprint Complete)
    └───────────────────────────
        W1    W2    W3    W4
```

---

## 8. APPENDIX: RISK REGISTER (LIVE)

| ID | Risk | L | I | RPN | Mitigation | Owner | Status |
|----|------|---|----|----|-----------|-------|--------|
| R01 | Developer onboarding delay (missing tools) | 3 | 4 | 12 | Pre-configure Docker images, scripted setup | DevOps | Open |
| R02 | Razorpay integration complexity | 4 | 4 | 16 | Start Sprint 3, sandbox first, Stripe fallback | Backend Lead | Open |
| R03 | Mobile app performance on low-end devices | 3 | 3 | 9 | Test on Moto G/JioPhone, Expo managed workflow | Mobile FE | Open |
| R04 | Pilot gym churn if dashboard is incomplete | 2 | 5 | 10 | Weekly check-ins with pilot gyms, fast iteration | PM | Open |
| R05 | Third-party API rate limits (Google Maps) | 2 | 3 | 6 | Batch geocoding, cache results, fallback to OSM | Backend | Open |
| R06 | Google/Apple OAuth configuration issues | 2 | 3 | 6 | Set up early (Sprint 1), document steps | Backend Lead | Open |
| R07 | Team member leave/illness | 1 | 4 | 4 | Cross-training, shared code ownership | Tech Lead | Open |

---

*End of Document — Execution Plan v1.0*

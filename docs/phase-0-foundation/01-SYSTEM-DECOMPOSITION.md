# Phase 0 Foundation — System Decomposition
## Complete Service/Module Breakdown

**Reference:** FITCORE PRO BLUEPRINT — System Architecture
**Version:** 1.0 | **Date:** June 2026

---

## 1. SERVICE INVENTORY (22 Microservices)

### 1.1 Core Business Services

| # | Service Name | Responsibility | Primary Owner | Blueprint Reference |
|---|-------------|---------------|---------------|-------------------|
| S01 | **Auth Service** | Registration, login, JWT issuance/refresh, OAuth (Google/Apple), password reset, RBAC enforcement | Backend Team | Architecture Layer |
| S02 | **User Service** | User profiles, preferences, role assignments, status management, tenant association | Backend Team | Users Table |
| S03 | **Gym Service** | Gym profile CRUD, branch management, operating hours, branding, gym discovery queries | Backend Team | Gyms Table |
| S04 | **Membership Service** | Plan CRUD (fixed/PAYG/flex), subscription lifecycle (create/pause/cancel/renew), wallet management, auto-renewal | Backend Team | Membership Plans & Memberships Tables |
| S05 | **Booking Service** | PT session booking, class booking, calendar sync (Google/Outlook), waitlist management, rescheduling/cancellation | Backend Team | PT Sessions Table |
| S06 | **Trainer Service** | Trainer profiles, certifications, specialisations, availability, client portfolio, performance metrics | Backend Team | Trainers Table |
| S07 | **Supplement Marketplace Service** | Company accounts, product catalogue, virtual shelf (zero-inventory display), order routing to fulfillment, commission tracking | Backend Team | Supplements & Supplement Orders Tables |
| S08 | **Equipment Service** | Equipment inventory, AMC lifecycle, warranty tracking, lead management, IoT telemetry ingestion | Backend Team | Equipment Table |
| S09 | **Maintenance Service** | Job board, technician assignment, job card management, work logs, photo documentation, status tracking | Backend Team | Maintenance Jobs Table |
| S10 | **Nutrition Service** | Diet plan builder, food log ingestion, macro tracking, lab report parsing, adherence scoring | Backend Team | Diet Plans & Food Logs Tables |
| S11 | **Workout Service** | Exercise library (5000+), workout logging, plan builder, progress tracking, AI plan override | Backend Team | Workouts Table |
| S12 | **Biometrics Service** | Body metrics CRUD, progress photos, measurement tracking, BMI/body fat calculations | Backend Team | Body Metrics Table |

### 1.2 Platform & Infrastructure Services

| # | Service Name | Responsibility | Primary Owner | Blueprint Reference |
|---|-------------|---------------|---------------|-------------------|
| S13 | **Payment Service** | Payment intent creation, gateway integration (Razorpay + Stripe), refunds, dispute handling, reconciliation | Backend Team | Payments Table |
| S14 | **Revenue Engine Service** | Commission splits (gym/platform/trainer/supplier/maintenance), payout queuing, settlement processing, tax calculation | Backend Team | Revenue Engine Wiring |
| S15 | **Notification Service** | Multi-channel dispatch (SMS, email, push, WhatsApp, in-app), template management, scheduling, delivery tracking | Backend Team | Notifications Table |
| S16 | **Search & Discovery Service** | Elasticsearch indexing, faceted search (goal/price/location/rating), geospatial queries, auto-complete, SEO page generation | Backend Team | Search Engine Wiring |
| S17 | **Analytics Service** | Event ingestion, real-time aggregations (MRR/DAU/churn), dashboard queries, data export, custom reports | Backend Team | Analytics Service Wiring |
| S18 | **Integration Service** | Webhook management, third-party API adapters (GMB, health APIs, calendar, ERP), data transformation, rate limiting | Backend Team | Integration Service Wiring |

### 1.3 AI/ML Services

| # | Service Name | Responsibility | Primary Owner | Blueprint Reference |
|---|-------------|---------------|---------------|-------------------|
| S19 | **AI Churn Prediction** | Member churn probability (XGBoost), risk scoring, at-risk cohort identification | ML Team | AI/ML Engine |
| S20 | **AI Recommendation Engine** | Workout plan generation (collaborative filtering), diet plan generation (LLM), supplement recommendations, gym/trainer recommendations | ML Team | AI/ML Engine |
| S21 | **AI Offer Engine** | Personalised discount generation (Bayesian optimisation), win-back campaign targeting, A/B test measurement | ML Team | AI/ML Engine |

### 1.4 Company Operations Services

| # | Service Name | Responsibility | Primary Owner | Blueprint Reference |
|---|-------------|---------------|---------------|-------------------|
| S22 | **Staff Operations Service** | Area manager dashboards, field officer GPS tracking, onboarding funnel, ticket/SLA management, commission/incentive calculation | Backend Team | Company Staff Features |

---

## 2. SERVICE-TO-MODULE MAPPING

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         SERVICE DEPENDENCY GRAPH                            │
│                                                                            │
│  S01 Auth ◄────► S02 User ◄────► S03 Gym ◄────► S04 Membership            │
│       │               │              │               │                     │
│       │               │              ├───────┐       │                     │
│       │               │              │       │       │                     │
│       │               ▼              ▼       ▼       ▼                     │
│       │          S06 Trainer ◄──► S05 Booking ◄──► S13 Payment             │
│       │               │              │                      │              │
│       │               │              │                      ▼              │
│       │               ▼              ▼               S14 Revenue Engine    │
│       │          S10 Nutrition ◄──► S11 Workout           │               │
│       │               │              │                    │               │
│       │               │              ▼                    │               │
│       │               │         S12 Biometrics            │               │
│       │               │                                   │               │
│       │               ▼                                   │               │
│       │          S07 Supplement ◄──────────────────────────┘               │
│       │               │                                                     │
│       │               ▼                                                     │
│       │          S08 Equipment ◄──── S09 Maintenance                        │
│       │               │                │                                   │
│       │               ▼                ▼                                   │
│       │          S17 Analytics ◄──── S15 Notification                       │
│       │               │                │                                   │
│       │               ▼                ▼                                   │
│       │          S19 AI Churn ◄──── S21 AI Offers                           │
│       │               │                                                     │
│       │               ▼                                                     │
│       │          S20 AI Recommendations                                     │
│       │               │                                                     │
│       │               ▼                                                     │
│       │          S16 Search & Discovery                                     │
│       │               │                                                     │
│       │               ▼                                                     │
│       │          S18 Integration Service ◄── External Systems               │
│       │               │                                                     │
│       │               ▼                                                     │
│       │          S22 Staff Operations                                       │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. MODULE BOUNDARIES & COMMUNICATION PATTERNS

| Communication Pattern | Use Case | Technology |
|----------------------|----------|------------|
| **Synchronous REST** | CRUD operations, queries, auth | HTTP/2 via Kong Gateway |
| **Async Event (Pub-Sub)** | State changes, notifications, analytics ingestion | Redis Pub-Sub / BullMQ |
| **Async Event (Streaming)** | High-volume events (biometric scans, IoT telemetry) | Kafka (Phase 4) |
| **gRPC (Internal)** | Inter-service data lookups (high-frequency) | gRPC with protobuf |
| **WebSocket** | Real-time dashboard updates, live tracking | Socket.io |
| **Webhook (Outbound)** | External system notifications (ERP, shipments) | HTTPS POST |
| **Webhook (Inbound)** | Payment gateway events, biometric device callbacks | Signed payload verification |
| **Batch (Scheduled)** | Nightly ML training, payout processing, report generation | BullMQ repeatable jobs / Airflow |

---

## 4. API GATEWAY ROUTING

| Route Pattern | Target Service | Public |
|--------------|---------------|--------|
| `/v1/auth/*` | S01 Auth | Yes |
| `/v1/users/*` | S02 User | No |
| `/v1/gyms/*` | S03 Gym | Partial |
| `/v1/memberships/*` | S04 Membership | No |
| `/v1/bookings/*` | S05 Booking | No |
| `/v1/trainers/*` | S06 Trainer | Partial |
| `/v1/supplements/*` | S07 Supplement Marketplace | Partial |
| `/v1/equipment/*` | S08 Equipment | No |
| `/v1/maintenance/*` | S09 Maintenance | No |
| `/v1/nutrition/*` | S10 Nutrition | No |
| `/v1/workouts/*` | S11 Workout | No |
| `/v1/biometrics/*` | S12 Biometrics | No |
| `/v1/payments/*` | S13 Payment | No |
| `/v1/revenue/*` | S14 Revenue Engine | No |
| `/v1/notifications/*` | S15 Notification | No |
| `/v1/search/*` | S16 Search & Discovery | Yes |
| `/v1/analytics/*` | S17 Analytics | No |
| `/v1/integrations/*` | S18 Integration | No |
| `/v1/ai/*` | S19/S20/S21 AI Services | No |
| `/v1/staff/*` | S22 Staff Operations | No |
| `/v1/admin/*` | All (internal) | No |

---

## 5. SERVICE OWNERSHIP & TEAM ALIGNMENT (Phase 1)

| Team | Services Owned | Headcount |
|------|---------------|-----------|
| **Backend Core (NestJS)** | S01, S02, S03, S04, S13, S15 | 2 engineers |
| **Backend Marketplaces** | S05, S06, S07, S10, S11 | 1 engineer |
| **Frontend Web (Next.js)** | All web-facing UIs for roles 1-8 | 1 engineer |
| **Frontend Mobile (React Native)** | Customer & Trainer mobile apps | 1 engineer |
| **DevOps/Platform** | S16, S17, S18, infrastructure | 1 engineer |
| **ML (Python)** | S19, S20, S21 | Part-time (Phase 3) |

---

## 6. DATABASE PER SERVICE STRATEGY

| Service | Database Strategy | Data Isolation |
|---------|------------------|---------------|
| S01 Auth | Shared PostgreSQL (tenant-scoped) | RLS |
| S02 User | Shared PostgreSQL (tenant-scoped) | RLS |
| S03 Gym | Shared PostgreSQL (tenant-scoped) | RLS |
| S04 Membership | Shared PostgreSQL (tenant-scoped) | RLS |
| S05 Booking | Shared PostgreSQL (tenant-scoped) | RLS |
| S06 Trainer | Shared PostgreSQL (tenant-scoped) | RLS |
| S07 Supplement | Shared PostgreSQL (tenant-scoped) | RLS |
| S08 Equipment | Shared PostgreSQL (tenant-scoped) | RLS |
| S09 Maintenance | Shared PostgreSQL (tenant-scoped) | RLS |
| S10 Nutrition | Shared PostgreSQL (tenant-scoped) | RLS |
| S11 Workout | Shared PostgreSQL (tenant-scoped) | RLS |
| S12 Biometrics | Shared PostgreSQL (tenant-scoped) | RLS |
| S13 Payment | Shared PostgreSQL (sensitive encrypted) | RLS + Column AES |
| S14 Revenue | Shared PostgreSQL | RLS |
| S15 Notification | Shared PostgreSQL | RLS |
| S16 Search | Elasticsearch index | Tenant-filtered queries |
| S17 Analytics | ClickHouse | Tenant column |
| S18 Integration | Shared PostgreSQL | RLS |
| S19/S20/S21 | PostgreSQL (results) + S3 (models) | Tenant-scoped |
| S22 Staff | Shared PostgreSQL | RLS |

---

## 7. EXTERNAL SYSTEM INTEGRATION POINTS

| External System | Service Consumer | Protocol | Data Direction |
|----------------|-----------------|----------|---------------|
| Razorpay | S13 Payment | REST Webhook + API | Bidirectional |
| Stripe | S13 Payment | REST Webhook + API | Bidirectional |
| Twilio | S15 Notification | REST API | Outbound |
| Firebase Cloud Messaging | S15 Notification | HTTP v1 API | Outbound |
| SendGrid / AWS SES | S15 Notification | SMTP / API | Outbound |
| Gupshup / WhatsApp API | S15 Notification | REST API | Outbound |
| Google Maps Platform | S16 Search | REST API | Outbound |
| Google My Business API | S18 Integration | REST API | Bidirectional |
| Google OAuth / Apple OAuth | S01 Auth | OAuth 2.0 | Inbound |
| Apple Health / Google Fit | S18 Integration | REST API + SDK | Inbound |
| Suprema Biometric SDK | S12 Biometrics (via gateway) | SDK REST | Inbound |
| ZKTeco Biometric SDK | S12 Biometrics (via gateway) | SDK REST | Inbound |
| HikVision Biometric SDK | S12 Biometrics (via gateway) | SDK REST | Inbound |
| Agora.io / Jitsi | S05 Booking | SDK + REST | Bidirectional |
| Supplement Company ERP | S18 Integration | Webhook (custom) | Bidirectional |
| Equipment IoT Telemetry | S08 Equipment | MQTT / HTTP | Inbound |

---

*End of Document — System Decomposition v1.0*

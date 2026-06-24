# Phase 0 Foundation — Complete OpenAPI Specification
## REST API Contracts for All Services

**Reference:** FITCORE PRO BLUEPRINT — API Design Patterns
**Version:** 1.0 | **Date:** June 2026

---

## 1. API OVERVIEW

| Property | Value |
|----------|-------|
| Base URL (Dev) | `http://localhost:3000/v1` |
| Base URL (Staging) | `https://api-staging.fitcore.app/v1` |
| Base URL (Production) | `https://api.fitcore.app/v1` |
| Protocol | HTTPS (TLS 1.3) |
| Format | JSON |
| Auth | Bearer JWT (RS256) |
| Rate Limit | 100 req/min per API key (public), 1000 req/min (internal) |

---

## 2. STANDARD HEADERS

```json
// Request headers
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json",
  "Accept": "application/json",
  "X-Tenant-ID": "<tenant_id>",
  "X-Request-ID": "<uuid>",
  "X-Idempotency-Key": "<uuid>"  // For payment requests
}

// Response headers
{
  "X-Request-ID": "<uuid>",
  "X-RateLimit-Limit": "100",
  "X-RateLimit-Remaining": "95",
  "X-RateLimit-Reset": "1624000000"
}
```

---

## 3. STANDARD RESPONSE FORMATS

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2026-06-19T10:30:00Z",
  "request_id": "req_uuid_123"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Email is required" },
      { "field": "password", "message": "Password must be at least 8 characters" }
    ],
    "status_code": 422
  },
  "request_id": "req_uuid_123"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "total_pages": 25,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## 4. COMPLETE ENDPOINT CATALOG

### S01: Auth Service (`/v1/auth`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| POST | `/v1/auth/register` | Register new user | Public | - |
| POST | `/v1/auth/login` | Login with email/password | Public | - |
| POST | `/v1/auth/logout` | Invalidate current session | JWT | All |
| POST | `/v1/auth/refresh-token` | Refresh JWT token | Refresh | All |
| POST | `/v1/auth/google` | Google OAuth login | Public | - |
| POST | `/v1/auth/apple` | Apple OAuth login | Public | - |
| POST | `/v1/auth/password-reset` | Request password reset email | Public | - |
| POST | `/v1/auth/password-reset/{token}` | Reset password with token | Public | - |
| GET | `/v1/auth/me` | Get current user profile | JWT | All |

### S02: User Service (`/v1/users`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/users` | List users (paginated) | JWT | company_staff, super_admin |
| GET | `/v1/users/{id}` | Get user by ID | JWT | Self, company_staff |
| PUT | `/v1/users/{id}` | Update user profile | JWT | Self, company_staff |
| DELETE | `/v1/users/{id}` | Soft-delete user | JWT | Self, super_admin |
| GET | `/v1/users/{id}/roles` | Get user roles | JWT | Self, company_staff |
| PUT | `/v1/users/{id}/roles` | Update user roles | JWT | super_admin |
| GET | `/v1/users/{id}/permissions` | Get effective permissions | JWT | Self, company_staff |
| POST | `/v1/users/export` | Export user data (GDPR) | JWT | Self |
| POST | `/v1/users/delete-request` | Request account deletion | JWT | Self |
| PUT | `/v1/users/{id}/status` | Update user status | JWT | company_staff |
| GET | `/v1/users/{id}/notifications` | List user notifications | JWT | Self |

### S03: Gym Service (`/v1/gyms`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/gyms` | List gyms (public, filtered) | Partial | Public |
| POST | `/v1/gyms` | Create gym profile | JWT | gym_owner, super_admin |
| GET | `/v1/gyms/{id}` | Get gym details | JWT | All |
| PUT | `/v1/gyms/{id}` | Update gym profile | JWT | gym_owner, super_admin |
| DELETE | `/v1/gyms/{id}` | Delete gym | JWT | gym_owner, super_admin |
| GET | `/v1/gyms/{id}/members` | List gym members | JWT | gym_owner, trainer, company_staff |
| GET | `/v1/gyms/{id}/trainers` | List gym trainers | JWT | All |
| GET | `/v1/gyms/{id}/analytics` | Gym analytics dashboard | JWT | gym_owner, company_staff |
| POST | `/v1/gyms/{id}/invitations` | Invite trainers/staff | JWT | gym_owner |
| GET | `/v1/gyms/{id}/membership-plans` | List membership plans | JWT | All |
| POST | `/v1/gyms/{id}/membership-plans` | Create membership plan | JWT | gym_owner |
| PUT | `/v1/gyms/{id}/membership-plans/{planId}` | Update plan | JWT | gym_owner |
| GET | `/v1/gyms/{id}/equipment` | List gym equipment | JWT | gym_owner, equipment_mfr |
| GET | `/v1/gyms/{id}/supplement-orders` | List supplement orders | JWT | gym_owner |
| GET | `/v1/gyms/{id}/reviews` | List gym reviews | JWT | Public |
| POST | `/v1/gyms/{id}/reviews` | Add gym review | JWT | customer |
| PUT | `/v1/gyms/{id}/hours` | Update operating hours | JWT | gym_owner |
| PUT | `/v1/gyms/{id}/gmb-sync` | Sync with Google My Business | JWT | gym_owner |
| POST | `/v1/gyms/{id}/biometric-devices` | Register biometric device | JWT | gym_owner |

### S04: Membership Service (`/v1/memberships`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/memberships` | List memberships (filtered) | JWT | Self, gym_owner (own gym) |
| POST | `/v1/gyms/{gymId}/memberships` | Create membership (buy plan) | JWT | customer, gym_owner |
| GET | `/v1/memberships/{id}` | Get membership details | JWT | Self, gym_owner |
| PUT | `/v1/memberships/{id}` | Update membership (pause/upgrade) | JWT | Self, gym_owner |
| POST | `/v1/memberships/{id}/renew` | Renew membership | JWT | Self, gym_owner |
| DELETE | `/v1/memberships/{id}` | Cancel membership | JWT | Self, gym_owner |
| POST | `/v1/memberships/{id}/pause` | Pause membership | JWT | Self |
| POST | `/v1/memberships/{id}/resume` | Resume membership | JWT | Self |
| GET | `/v1/memberships/{id}/wallet` | Get PAYG wallet details | JWT | Self |
| POST | `/v1/memberships/{id}/wallet/topup` | Top up PAYG wallet | JWT | Self |
| GET | `/v1/memberships/expiring` | List expiring memberships (D-7) | JWT | gym_owner, company_staff |
| GET | `/v1/memberships/at-risk` | List at-risk members (AI flagged) | JWT | gym_owner |

### S05: Booking Service (`/v1/bookings`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/bookings` | List bookings | JWT | Self, gym_owner |
| POST | `/v1/trainers/{trainerId}/pt-sessions` | Book PT session | JWT | customer |
| GET | `/v1/pt-sessions/{id}` | Get session details | JWT | Self, trainer, gym_owner |
| PUT | `/v1/pt-sessions/{id}` | Update session (trainer logs work) | JWT | trainer |
| POST | `/v1/pt-sessions/{id}/complete` | Complete session | JWT | trainer |
| POST | `/v1/pt-sessions/{id}/cancel` | Cancel session | JWT | Self, trainer |
| POST | `/v1/pt-sessions/{id}/reschedule` | Reschedule session | JWT | Self, trainer |
| POST | `/v1/pt-sessions/{id}/no-show` | Mark no-show | JWT | trainer |
| GET | `/v1/pt-sessions/{id}/recording` | Get session recording | JWT | Self, trainer |
| GET | `/v1/gyms/{gymId}/classes` | List gym classes | JWT | Public |
| POST | `/v1/gyms/{gymId}/classes/{classId}/book` | Book class slot | JWT | customer |
| POST | `/v1/gyms/{gymId}/classes/{classId}/waitlist` | Join class waitlist | JWT | customer |
| GET | `/v1/calendar/sync` | Get calendar sync link | JWT | trainer, customer |

### S06: Trainer Service (`/v1/trainers`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/trainers` | Search trainers (public) | Partial | Public |
| GET | `/v1/trainers/{id}` | Get trainer profile | JWT | All |
| PUT | `/v1/trainers/{id}` | Update trainer profile | JWT | trainer, gym_owner |
| GET | `/v1/trainers/{id}/clients` | List trainer clients | JWT | trainer, gym_owner |
| POST | `/v1/trainers/{id}/clients` | Add client to trainer | JWT | trainer |
| GET | `/v1/trainers/{id}/earnings` | Get earnings (PT + supplements) | JWT | trainer |
| GET | `/v1/trainers/{id}/schedule` | Get availability schedule | JWT | Public |
| PUT | `/v1/trainers/{id}/schedule` | Update availability | JWT | trainer |
| GET | `/v1/trainers/{id}/performance` | Trainer performance metrics | JWT | trainer, gym_owner |
| GET | `/v1/trainers/{id}/commissions` | Supplement commission details | JWT | trainer |
| POST | `/v1/trainers/{id}/rate` | Rate trainer | JWT | customer |
| GET | `/v1/trainers/featured` | Featured/trending trainers | JWT | Public |

### S07: Supplement Marketplace Service (`/v1/supplements`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/supplements` | List supplements (filtered) | JWT | Public |
| GET | `/v1/supplements/{id}` | Get supplement details | JWT | Public |
| POST | `/v1/supplements` | Add supplement product | JWT | supplement_company |
| PUT | `/v1/supplements/{id}` | Update supplement | JWT | supplement_company |
| DELETE | `/v1/supplements/{id}` | Delete supplement | JWT | supplement_company |
| POST | `/v1/supplements/{id}/orders` | Place supplement order | JWT | customer, trainer |
| GET | `/v1/supplements/recommendations` | Get AI supplement recommendations | JWT | customer, trainer |
| GET | `/v1/supplements/{id}/reviews` | List supplement reviews | JWT | Public |
| POST | `/v1/supplements/{id}/reviews` | Add supplement review | JWT | customer |
| GET | `/v1/supplement-orders` | List my orders | JWT | customer |
| GET | `/v1/supplement-orders/{id}` | Get order details | JWT | Self, supplement_company |
| POST | `/v1/supplement-orders/{id}/cancel` | Cancel order | JWT | Self, supplement_company |
| GET | `/v1/supplement-orders/{id}/tracking` | Track order delivery | JWT | Self |
| PUT | `/v1/supplement-orders/{id}/status` | Update order status | JWT | supplement_company |
| GET | `/v1/supplement-companies/{id}/analytics` | Sales analytics dashboard | JWT | supplement_company |
| POST | `/v1/supplements/{id}/recommend` | Recommend supplement to client | JWT | trainer, nutritionist |

### S08: Equipment Service (`/v1/equipment`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/equipment` | List equipment (filtered) | JWT | gym_owner, equipment_mfr |
| POST | `/v1/equipment` | Add equipment | JWT | gym_owner, equipment_mfr |
| GET | `/v1/equipment/{id}` | Get equipment details | JWT | All |
| PUT | `/v1/equipment/{id}` | Update equipment | JWT | gym_owner |
| DELETE | `/v1/equipment/{id}` | Remove equipment | JWT | gym_owner |
| GET | `/v1/equipment/{id}/maintenance-history` | Service history | JWT | gym_owner, equipment_mfr |
| POST | `/v1/equipment/{id}/request-quote` | Request purchase quote | JWT | gym_owner |
| GET | `/v1/equipment-leads` | List sales leads | JWT | equipment_mfr |
| PUT | `/v1/equipment-leads/{id}` | Update lead status | JWT | equipment_mfr |
| POST | `/v1/equipment/{id}/amc/renew` | Renew AMC | JWT | gym_owner |
| GET | `/v1/equipment/{id}/amc` | Get AMC details | JWT | gym_owner |
| POST | `/v1/equipment/{id}/iot/telemetry` | Receive IoT telemetry | JWT | equipment_mfr (webhook) |
| GET | `/v1/equipment/{id}/iot/anomalies` | Get anomaly alerts | JWT | gym_owner, equipment_mfr |

### S09: Maintenance Service (`/v1/maintenance`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/maintenance/jobs` | List maintenance jobs | JWT | All |
| POST | `/v1/maintenance/jobs` | Create job request | JWT | gym_owner |
| GET | `/v1/maintenance/jobs/{id}` | Get job details | JWT | All |
| PUT | `/v1/maintenance/jobs/{id}` | Update job (status, notes) | JWT | maintenance_provider |
| POST | `/v1/maintenance/jobs/{id}/accept` | Accept job | JWT | maintenance_provider |
| POST | `/v1/maintenance/jobs/{id}/start` | Start job (en-route) | JWT | maintenance_provider |
| POST | `/v1/maintenance/jobs/{id}/complete` | Complete job with job card | JWT | maintenance_provider |
| POST | `/v1/maintenance/jobs/{id}/rate` | Rate technician | JWT | gym_owner |
| GET | `/v1/maintenance/jobs/available` | Open jobs board | JWT | maintenance_provider |
| GET | `/v1/maintenance/providers/{id}/earnings` | Earnings dashboard | JWT | maintenance_provider |

### S10: Nutrition Service (`/v1/nutrition`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/nutrition/diet-plans` | List diet plans | JWT | Self, nutritionist |
| POST | `/v1/nutrition/diet-plans` | Create/request diet plan | JWT | nutritionist, customer |
| GET | `/v1/nutrition/diet-plans/{id}` | Get diet plan details | JWT | Self, nutritionist |
| PUT | `/v1/nutrition/diet-plans/{id}` | Update diet plan | JWT | nutritionist |
| GET | `/v1/nutrition/diet-plans/{id}/adherence` | Adherence tracking | JWT | nutritionist, Self |
| GET | `/v1/nutrition/food-logs` | List food logs | JWT | Self, nutritionist |
| POST | `/v1/nutrition/food-logs` | Log food entry | JWT | customer |
| PUT | `/v1/nutrition/food-logs/{id}` | Update food log | JWT | Self |
| GET | `/v1/nutrition/nutritionists` | Search nutritionists | JWT | Public |
| GET | `/v1/nutrition/nutritionists/{id}` | Get nutritionist profile | JWT | Public |
| POST | `/v1/nutrition/consultations` | Book consultation | JWT | customer |
| GET | `/v1/nutrition/consultations/{id}` | Get consultation details | JWT | Self, nutritionist |
| POST | `/v1/nutrition/lab-reports` | Upload lab report | JWT | Self, nutritionist |

### S11: Workout Service (`/v1/workouts`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/workouts` | List workouts | JWT | Self, trainer |
| POST | `/v1/workouts` | Log workout | JWT | customer |
| GET | `/v1/workouts/{id}` | Get workout details | JWT | Self, trainer |
| PUT | `/v1/workouts/{id}` | Update workout | JWT | Self |
| DELETE | `/v1/workouts/{id}` | Delete workout | JWT | Self |
| GET | `/v1/workouts/exercises` | Exercise library (5000+) | JWT | All |
| GET | `/v1/workouts/exercises/{id}` | Exercise details + video | JWT | All |
| POST | `/v1/workouts/plans` | Create workout plan | JWT | trainer |
| GET | `/v1/workouts/plans` | List workout plans | JWT | Self, trainer |
| GET | `/v1/workouts/plans/{id}` | Get plan details | JWT | Self, trainer |
| POST | `/v1/workouts/plans/{id}/assign` | Assign plan to client | JWT | trainer |
| GET | `/v1/workouts/progress` | Progress chart data | JWT | Self |
| POST | `/v1/workouts/ai-generate` | Generate plan via AI | JWT | customer, trainer |

### S12: Biometrics Service (`/v1/biometrics`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/biometrics/metrics` | List body metrics | JWT | Self, trainer |
| POST | `/v1/biometrics/metrics` | Record body metric | JWT | customer, trainer |
| GET | `/v1/biometrics/metrics/{id}` | Get metric details | JWT | Self, trainer |
| PUT | `/v1/biometrics/metrics/{id}` | Update metric | JWT | Self |
| GET | `/v1/biometrics/metrics/progress` | Progress chart data | JWT | Self, trainer |
| POST | `/v1/biometrics/metrics/{id}/photos` | Add progress photos | JWT | Self |
| POST | `/v1/biometrics/scan-entry` | Process biometric entry scan | JWT | customer (device) |
| POST | `/v1/biometrics/register-device` | Register biometric device | JWT | gym_owner |
| GET | `/v1/biometrics/devices` | List gym biometric devices | JWT | gym_owner |
| GET | `/v1/biometrics/attendance` | Attendance log | JWT | gym_owner, Self |

### S13: Payment Service (`/v1/payments`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| POST | `/v1/payments/create-intent` | Create payment intent | JWT | All |
| GET | `/v1/payments/{id}` | Get payment status | JWT | Self, gym_owner (own) |
| POST | `/v1/payments/{id}/verify` | Verify payment (webhook callback) | JWT | Payment Gateway |
| POST | `/v1/payments/{id}/refund` | Refund payment | JWT | company_staff, super_admin |
| GET | `/v1/payments/history` | Payment history | JWT | Self |
| GET | `/v1/payments/methods` | Saved payment methods | JWT | Self |
| POST | `/v1/payments/methods` | Save payment method | JWT | Self |
| DELETE | `/v1/payments/methods/{id}` | Remove saved method | JWT | Self |
| POST | `/v1/payments/razorpay-webhook` | Razorpay webhook handler | JWT | Razorpay |
| POST | `/v1/payments/stripe-webhook` | Stripe webhook handler | JWT | Stripe |

### S14: Revenue Engine Service (`/v1/revenue`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/revenue/commissions` | My commission summary | JWT | trainer, gym_owner, supplement_company |
| GET | `/v1/revenue/payouts` | Payout history | JWT | All earning roles |
| GET | `/v1/revenue/payouts/{id}` | Payout details | JWT | Self |
| GET | `/v1/revenue/settlements` | Settlement report | JWT | supplement_company, equipment_mfr |
| GET | `/v1/revenue/tax-documents/{year}` | Tax documents | JWT | Self |
| GET | `/v1/revenue/dashboard` | Revenue dashboard data | JWT | company_staff |

### S15: Notification Service (`/v1/notifications`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/notifications` | List notifications | JWT | Self |
| PUT | `/v1/notifications/{id}/read` | Mark as read | JWT | Self |
| PUT | `/v1/notifications/read-all` | Mark all as read | JWT | Self |
| DELETE | `/v1/notifications/{id}` | Delete notification | JWT | Self |
| PUT | `/v1/notifications/preferences` | Update notification preferences | JWT | Self |
| POST | `/v1/notifications/send` | Send notification (internal) | JWT | Internal Services |
| GET | `/v1/notifications/unread-count` | Unread count badge | JWT | Self |

### S16: Search & Discovery Service (`/v1/search`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/search/gyms` | Search gyms (location, goal, price) | JWT | Public |
| GET | `/v1/search/trainers` | Search trainers (specialisation, location) | JWT | Public |
| GET | `/v1/search/supplements` | Search supplements (category, goal) | JWT | Public |
| GET | `/v1/search/articles` | Search fitness articles | JWT | Public |
| GET | `/v1/search/autocomplete` | Autocomplete suggestions | JWT | Public |
| POST | `/v1/search/reindex` | Trigger full reindex | JWT | super_admin |

### S17: Analytics Service (`/v1/analytics`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/analytics/dashboard` | Role-specific dashboard data | JWT | All |
| GET | `/v1/analytics/mymembership` | Member analytics | JWT | customer |
| GET | `/v1/analytics/mygym` | Gym owner analytics | JWT | gym_owner |
| GET | `/v1/analytics/mytraining` | Trainer analytics | JWT | trainer |
| GET | `/v1/analytics/mycompany` | Supplement company analytics | JWT | supplement_company |
| GET | `/v1/analytics/company-wide` | Company-wide metrics | JWT | company_staff |
| GET | `/v1/analytics/mrr` | MRR/ARR breakdown | JWT | company_staff |
| GET | `/v1/analytics/churn` | Churn analysis | JWT | gym_owner, company_staff |
| GET | `/v1/analytics/cohort` | Cohort retention analysis | JWT | company_staff |
| GET | `/v1/analytics/export` | Export analytics (CSV) | JWT | Self |

### S18: Integration Service (`/v1/integrations`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/integrations` | List active integrations | JWT | Self |
| POST | `/v1/integrations/gmb/sync` | Sync Google My Business | JWT | gym_owner |
| GET | `/v1/integrations/gmb/insights` | GMB performance insights | JWT | gym_owner |
| POST | `/v1/integrations/health/apple` | Connect Apple Health | JWT | customer |
| POST | `/v1/integrations/health/google-fit` | Connect Google Fit | JWT | customer |
| POST | `/v1/integrations/calendar/google` | Connect Google Calendar | JWT | trainer |
| POST | `/v1/integrations/calendar/outlook` | Connect Outlook Calendar | JWT | trainer |
| POST | `/v1/integrations/webhooks` | Register webhook (for ERP) | JWT | supplement_company |
| GET | `/v1/integrations/webhooks/{id}` | Get webhook details | JWT | Self |
| PUT | `/v1/integrations/webhooks/{id}` | Update webhook | JWT | Self |
| DELETE | `/v1/integrations/webhooks/{id}` | Delete webhook | JWT | Self |

### S19/S20/S21: AI Services (`/v1/ai`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| POST | `/v1/ai/predict/churn` | Get churn probability for member | JWT | gym_owner, company_staff |
| POST | `/v1/ai/recommend/workout` | Generate workout plan | JWT | customer, trainer |
| POST | `/v1/ai/recommend/diet` | Generate diet plan | JWT | customer, nutritionist |
| POST | `/v1/ai/recommend/supplements` | Recommend supplements | JWT | customer, trainer |
| POST | `/v1/ai/recommend/gyms` | Recommend gyms | JWT | customer |
| POST | `/v1/ai/recommend/trainers` | Recommend trainers | JWT | customer |
| POST | `/v1/ai/generate/offer` | Generate personalised offer | JWT | gym_owner |
| POST | `/v1/ai/generate/recipe` | Generate recipe from macros | JWT | customer, nutritionist |
| POST | `/v1/ai/batch/churn-scan` | Nightly churn scan (batch) | JWT | Internal |
| GET | `/v1/ai/model/info` | Model version & metrics | JWT | super_admin |

### S22: Staff Operations Service (`/v1/staff`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/staff/dashboard` | Area manager dashboard | JWT | company_staff |
| GET | `/v1/staff/territory` | Territory overview | JWT | company_staff |
| POST | `/v1/staff/field-visits` | Log field visit | JWT | company_staff |
| GET | `/v1/staff/field-visits` | List field visits | JWT | company_staff |
| POST | `/v1/staff/nps-survey` | Submit NPS survey | JWT | company_staff |
| GET | `/v1/staff/nps-results` | NPS results by gym | JWT | company_staff |
| GET | `/v1/staff/onboarding-tracker` | Gym onboarding funnel | JWT | company_staff |
| GET | `/v1/staff/tickets` | Support ticket queue | JWT | company_staff |
| POST | `/v1/staff/tickets` | Create support ticket | JWT | gym_owner, All |
| PUT | `/v1/staff/tickets/{id}` | Update ticket | JWT | company_staff |
| GET | `/v1/staff/commissions` | Commission calculator | JWT | company_staff |
| GET | `/v1/staff/reports` | Custom reports | JWT | company_staff |

### Admin Only (`/v1/admin`)

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/v1/admin/dashboard` | Global system admin dashboard | JWT | super_admin |
| GET | `/v1/admin/tenants` | List all tenants | JWT | super_admin |
| POST | `/v1/admin/tenants` | Create tenant | JWT | super_admin |
| PUT | `/v1/admin/tenants/{id}` | Update tenant | JWT | super_admin |
| GET | `/v1/admin/system-health` | System health & uptime | JWT | super_admin |
| GET | `/v1/admin/audit-logs` | Full audit log search | JWT | super_admin |
| POST | `/v1/admin/feature-flags` | Toggle feature flags | JWT | super_admin |

---

## 5. WEBHOOK RECEIVERS (Inbound from External Systems)

| Path | Source | Purpose | Verification |
|------|--------|---------|-------------|
| `POST /v1/payments/razorpay-webhook` | Razorpay | Payment events (success, failed, refunded) | HMAC signature |
| `POST /v1/payments/stripe-webhook` | Stripe | Payment events | Stripe-Signature header |
| `POST /v1/integrations/webhooks/{hookId}` | Supplement ERP | Inventory updates | API key + HMAC |
| `POST /v1/equipment/iot-telemetry` | IoT devices | Machine telemetry data | Device token |
| `POST /v1/biometrics/device-callback` | Biometric devices | Entry/exit events | Device API key |

---

## 6. ERROR CODES CATALOG

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `TOKEN_EXPIRED` | 401 | JWT token expired |
| `INVALID_TOKEN` | 401 | Invalid or malformed token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `CONFLICT` | 409 | Resource already exists (duplicate) |
| `RATE_LIMITED` | 429 | Too many requests |
| `PAYMENT_FAILED` | 402 | Payment gateway error |
| `INSUFFICIENT_BALANCE` | 402 | Wallet balance too low |
| `TENANT_MISMATCH` | 403 | Cross-tenant access denied |
| `GYM_INACTIVE` | 403 | Gym subscription inactive |
| `MEMBER_EXPIRED` | 410 | Membership expired |
| `SLOT_UNAVAILABLE` | 409 | Time slot already booked |
| `ORDER_CANNOT_CANCEL` | 400 | Order cannot be cancelled (shipped) |
| `INTEGRATION_ERROR` | 502 | External service error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 7. API VERSIONING STRATEGY

| Strategy | Detail |
|----------|--------|
| Version in URL | `/v1/gyms`, `/v2/gyms` |
| Sunset period | 6 months after new version release |
| Deprecation header | `Sunset: Sat, 19 Dec 2026 23:59:59 GMT` |
| Changelog | Published at `/docs/changelog` |
| Backward compat | Additive changes only within v1; breaking = new version |

---

*End of Document — OpenAPI Specification v1.0*

# Phase 0 Foundation — Screen & Page Inventory
## Complete UI Surface Map for Web, Admin & Mobile Applications

**Reference:** FITCORE PRO BLUEPRINT — Feature List by Role (8 roles)
**Version:** 1.0 | **Date:** June 2026

---

## 1. APPLICATION MATRIX

| Application | Platform | Audience | Tech Stack | Blueprint Reference |
|------------|----------|----------|------------|-------------------|
| **FitCore Pro Web** | Next.js 14+ SSR | Gyms, Trainers, Nutritionists, Supplement Companies, Equipment Manufacturers, Maintenance Providers — Dashboard & Management | React + Tailwind + TanStack Query | Frontend: Next.js |
| **FitCore Pro Mobile** | React Native + Expo | Customers (primary), Trainers (mobile), Nutritionists (mobile) | React Native + Expo Router | Frontend: RN + Expo |
| **FitCore Admin Portal** | React + Vite | Company Staff (Area Managers, Field Officers, Support, Super Admin) | React + Tailwind + Zustand | Admin Portal |
| **Public Gym Pages** | Next.js SSG/ISR | SEO for gym discovery | Next.js + Static Generation | Local SEO |

---

## 2. WEB APPLICATION — SCREEN INVENTORY

### 2.1 Public / Landing Pages

| # | Screen | Route | Roles | Description |
|---|--------|-------|-------|-------------|
| W01 | Marketing Landing | `/` | Public | Hero, features, pricing CTA, partner logos |
| W02 | Features | `/features` | Public | Detailed feature showcase per role |
| W03 | Pricing | `/pricing` | Public | SaaS pricing table (Starter/Growth/Pro/Enterprise) |
| W04 | About / Contact | `/about`, `/contact` | Public | Company info, contact form |
| W05 | Gym Search (SEO) | `/gyms` | Public | Search gyms by city, filters |
| W06 | Gym Detail Page | `/gyms/{city}/{slug}` | Public | Full gym profile, plans, trainers, reviews |
| W07 | Trainer Search | `/trainers` | Public | Search trainers by skill/location |
| W08 | Trainer Profile | `/trainers/{id}` | Public | Bio, certifications, availability, booking |
| W09 | Supplement Product | `/supplements/{id}` | Public | Product details, nutrition info, reviews |
| W10 | Blog / Articles | `/articles` | Public | Fitness content (SEO) |

### 2.2 Auth Screens

| # | Screen | Route | Roles | Description |
|---|--------|-------|-------|-------------|
| W11 | Login | `/login` | All | Email + password, Google OAuth, Apple OAuth |
| W12 | Register | `/register` | All | Role selection, profile form, goal selection |
| W13 | Forgot Password | `/forgot-password` | All | Email verification flow |
| W14 | Reset Password | `/reset-password?token=` | All | New password form |
| W15 | OAuth Callback | `/auth/callback` | All | OAuth token exchange |

### 2.3 Gym Owner Dashboard (Role: gym_owner)

| # | Screen | Route | Roles | Description |
|---|--------|-------|-------|-------------|
| W20 | Overview Dashboard | `/dashboard` | gym_owner | Active members, revenue chart, attendance rate, facility occupancy, alerts |
| W21 | Member Management | `/dashboard/members` | gym_owner | Member list, search, filter, bulk actions |
| W22 | Member Detail | `/dashboard/members/{id}` | gym_owner | Profile, membership, attendance, payments, progress |
| W23 | Member Onboarding | `/dashboard/members/onboard` | gym_owner | Step-by-step: lead → form → plan → payment → welcome |
| W24 | Membership Plans | `/dashboard/plans` | gym_owner | Plan CRUD (fixed/PAYG/flex), pricing, features |
| W25 | Plan Edit | `/dashboard/plans/{id}/edit` | gym_owner | Plan configuration, billing cycle |
| W26 | Trainer Roster | `/dashboard/trainers` | gym_owner | Trainer list, certifications, performance |
| W27 | Trainer Detail | `/dashboard/trainers/{id}` | gym_owner | Schedule, clients, earnings, commissions |
| W28 | Trainer Invite | `/dashboard/trainers/invite` | gym_owner | Send invitation link |
| W29 | Supplement Shop | `/dashboard/supplements` | gym_owner | Products displayed, orders, commission summary |
| W30 | Supplement Orders | `/dashboard/supplements/orders` | gym_owner | Order list, status tracking, revenue |
| W31 | Equipment Inventory | `/dashboard/equipment` | gym_owner | Equipment list, status, AMC tracking |
| W32 | Equipment Detail | `/dashboard/equipment/{id}` | gym_owner | Specs, maintenance history, AMC, IoT data |
| W33 | Maintenance Requests | `/dashboard/maintenance` | gym_owner | Job list, status, technician details |
| W34 | Maintenance Job Detail | `/dashboard/maintenance/{id}` | gym_owner | Job card, photos, cost, rating |
| W35 | Staff Management | `/dashboard/staff` | gym_owner | Staff list, shifts, payroll, roles |
| W36 | Biometric Devices | `/dashboard/biometric` | gym_owner | Device list, registration, logs |
| W37 | Attendance Log | `/dashboard/attendance` | gym_owner | Entry/exit log, filter by date/member |
| W38 | Offer & Promotions | `/dashboard/offers` | gym_owner | Campaigns, coupons, A/B tests, performance |
| W39 | Offer Create | `/dashboard/offers/create` | gym_owner | Campaign builder, targeting, discount |
| W40 | Analytics | `/dashboard/analytics` | gym_owner | MRR, churn, CAC, LTV, cohort, trends |
| W41 | Reports | `/dashboard/reports` | gym_owner | Custom report builder, export (CSV/PDF) |
| W42 | Gym Settings | `/dashboard/settings` | gym_owner | Profile, hours, amenities, integrations (GMB) |
| W43 | Subscription | `/dashboard/subscription` | gym_owner | Plan, billing history, invoice download |
| W44 | Review Management | `/dashboard/reviews` | gym_owner | Reviews list, reply, flag spam |
| W45 | AI Insights | `/dashboard/ai-insights` | gym_owner | Churn predictions, recommendations |

### 2.4 Trainer Dashboard (Role: trainer)

| # | Screen | Route | Roles | Description |
|---|--------|-------|-------|-------------|
| W50 | Trainer Overview | `/dashboard` | trainer | Upcoming sessions, client progress summary, earnings |
| W51 | My Schedule | `/dashboard/schedule` | trainer | Calendar view, sessions, availability management |
| W52 | My Clients | `/dashboard/clients` | trainer | Client list, status, last session, metrics |
| W53 | Client Detail | `/dashboard/clients/{id}` | trainer | Biometrics, workout history, progress photos, diet |
| W54 | Workout Plan Builder | `/dashboard/workout-plans` | trainer | Exercise library drag-drop, AI generate, assign |
| W55 | Workout Plan Detail | `/dashboard/workout-plans/{id}` | trainer | Plan view, edit, progress tracking |
| W56 | PT Session Log | `/dashboard/pt-sessions` | trainer | Session history, notes, exercises |
| W57 | Live Session Card | `/dashboard/pt-sessions/{id}/live` | trainer | Log exercises, timer, notes, complete |
| W58 | Earnings Dashboard | `/dashboard/earnings` | trainer | PT revenue, supplement commissions, bonuses |
| W59 | Supplement Commissions | `/dashboard/supplements` | trainer | Recommended products, conversion, earnings |
| W60 | Client Progress Charts | `/dashboard/clients/{id}/progress` | trainer | Weight, body fat, muscle mass trends |
| W61 | My Profile | `/dashboard/profile` | trainer | Bio, certifications, photos, availability, rate |
| W62 | Settings | `/dashboard/settings` | trainer | Notifications, calendar sync, payout info |

### 2.5 Nutritionist Dashboard (Role: nutritionist)

| # | Screen | Route | Roles | Description |
|---|--------|-------|-------|-------------|
| W70 | Nutritionist Overview | `/dashboard` | nutritionist | Active clients, adherence scores, upcoming consultations |
| W71 | My Clients | `/dashboard/clients` | nutritionist | Client list, health intake data |
| W72 | Client Detail | `/dashboard/clients/{id}` | nutritionist | Medical history, lab reports, food logs, diet plans |
| W73 | Diet Plan Builder | `/dashboard/diet-plans` | nutritionist | Template library, custom builder, AI generation |
| W74 | Diet Plan Detail | `/dashboard/diet-plans/{id}` | nutritionist | Meal plan view, edit, modify |
| W75 | Food Log Viewer | `/dashboard/clients/{id}/food-logs` | nutritionist | Client food log timeline, adherence scoring |
| W76 | Consultation Booking | `/dashboard/consultations` | nutritionist | Appointment list, schedule management |
| W77 | Video Consultation | `/dashboard/consultations/{id}/video` | nutritionist | Jitsi/Agora integration, notes |
| W78 | Lab Report Viewer | `/dashboard/clients/{id}/lab-reports` | nutritionist | Report upload, OCR values, interpretation notes |
| W79 | My Profile | `/dashboard/profile` | nutritionist | Public profile, expertise, pricing |
| W80 | Supplement Recommendations | `/dashboard/supplements` | nutritionist | Recommend products, commissions |

### 2.6 Supplement Company Dashboard (Role: supplement_company)

| # | Screen | Route | Roles | Description |
|---|--------|-------|-------|-------------|
| W90 | Company Overview | `/dashboard` | supplement_company | Total sales, orders, top products, by-region |
| W91 | Product Catalogue | `/dashboard/products` | supplement_company | Product list, CRUD, variants, pricing |
| W92 | Product Create/Edit | `/dashboard/products/{id}/edit` | supplement_company | Full product form, images, nutrition, certs |
| W93 | Order Management | `/dashboard/orders` | supplement_company | Order list, status updates, fulfillment |
| W94 | Order Detail | `/dashboard/orders/{id}` | supplement_company | Items, customer, tracking, payment |
| W95 | Sales Analytics | `/dashboard/analytics` | supplement_company | By gym, region, trainer, product, trends |
| W96 | Campaigns | `/dashboard/campaigns` | supplement_company | Promo codes, time-limited offers, banners |
| W97 | Campaign Create | `/dashboard/campaigns/create` | supplement_company | Campaign builder, targeting rules |
| W98 | Affiliates | `/dashboard/affiliates` | supplement_company | Trainer/influencer partners, commissions |
| W99 | Inventory Sync | `/dashboard/inventory` | supplement_company | Stock levels, ERP webhook status |
| W100 | Company Profile | `/dashboard/profile` | supplement_company | GST, FSSAI, brand info, bank details |

### 2.7 Equipment Manufacturer Dashboard (Role: equipment_manufacturer)

| # | Screen | Route | Roles | Description |
|---|--------|-------|-------|-------------|
| W110 | Manufacturer Overview | `/dashboard` | equipment_mfr | Pipeline summary, AMC renewals, service jobs |
| W111 | Product Catalogue | `/dashboard/products` | equipment_mfr | Equipment catalogue, specs, pricing |
| W112 | Product Create/Edit | `/dashboard/products/{id}/edit` | equipment_mfr | Specs, images, warranty, financing |
| W113 | Sales Leads | `/dashboard/leads` | equipment_mfr | Lead list, scoring, follow-up tracking |
| W114 | Lead Detail | `/dashboard/leads/{id}` | equipment_mfr | Gym contact, equipment interest, quotes |
| W115 | AMC Management | `/dashboard/amc` | equipment_mfr | Expiring AMCs, renewals, service history |
| W116 | Service Jobs | `/dashboard/service-jobs` | equipment_mfr | Job list, technician assignment, status |
| W117 | Job Detail | `/dashboard/service-jobs/{id}` | equipment_mfr | Job card, photos, parts, payment |
| W118 | IoT Telemetry | `/dashboard/iot` | equipment_mfr | Connected devices, anomaly alerts, usage data |
| W119 | Lead Analytics | `/dashboard/analytics` | equipment_mfr | Pipeline velocity, win rate, territory |

### 2.8 Maintenance Provider Dashboard (Role: maintenance_provider)

| # | Screen | Route | Roles | Description |
|---|--------|-------|-------|-------------|
| W130 | Technician Overview | `/dashboard` | maintenance_provider | Available jobs, upcoming schedule, earnings |
| W131 | Job Board | `/dashboard/jobs` | maintenance_provider | Open jobs filterable by skill/location/urgency |
| W132 | Job Detail | `/dashboard/jobs/{id}` | maintenance_provider | Equipment info, issue, location map |
| W133 | Active Job | `/dashboard/jobs/{id}/active` | maintenance_provider | Navigation, job card, photos, parts, complete |
| W134 | Job History | `/dashboard/history` | maintenance_provider | Completed jobs with ratings |
| W135 | Earnings | `/dashboard/earnings` | maintenance_provider | Weekly/monthly earnings, payouts |
| W136 | My Profile | `/dashboard/profile` | maintenance_provider | Availability, service zone, skills, rating |
| W137 | Settings | `/dashboard/settings` | maintenance_provider | Payout info, notification prefs |

### 2.9 Company Staff — Admin Portal (Role: company_staff)

| # | Screen | Route | Roles | Description |
|---|--------|-------|-------|-------------|
| W150 | Staff Overview | `/admin/dashboard` | company_staff | Territory MRR, churn, NPS, onboarding pipeline |
| W151 | Gym Management | `/admin/gyms` | company_staff | All gyms list, filter by status/plan/territory |
| W152 | Gym Detail | `/admin/gyms/{id}` | company_staff | Full gym data, plan, biometrics, issues |
| W153 | Onboarding Tracker | `/admin/onboarding` | company_staff | Funnel view, activation checklist, blockers |
| W154 | Trainer Overview | `/admin/trainers` | company_staff | All trainers, verification, performance |
| W155 | User Management | `/admin/users` | company_staff | Users list, roles, status, actions |
| W156 | Support Tickets | `/admin/support` | company_staff | Ticket queue, SLA tracking, assignment |
| W157 | Ticket Detail | `/admin/support/{id}` | company_staff | Conversation, status, resolution |
| W158 | Field Visit Logs | `/admin/field-visits` | company_staff | Officer visits, GPS verification, NPS results |
| W159 | Revenue Dashboard | `/admin/revenue` | company_staff | MRR/ARR/churn/cohort, drill-down by gym |
| W160 | Payout Management | `/admin/payouts` | company_staff | Pending/completed payouts, commission calc |
| W161 | Commission Rules | `/admin/commissions` | company_staff | Commission structure config |
| W162 | Reports & Export | `/admin/reports` | company_staff | Custom SQL reports, schedule exports |
| W163 | Audit Logs | `/admin/audit` | company_staff | Full audit trail, filter/export |
| W164 | Fraud Detection | `/admin/fraud` | company_staff | Suspicious activity, disputes, chargebacks |
| W165 | System Health | `/admin/system` | company_staff | Service status, uptime, error rates |

### 2.10 Super Admin (Role: super_admin)

| # | Screen | Route | Roles | Description |
|---|--------|-------|-------|-------------|
| W170 | Admin Dashboard | `/super-admin/dashboard` | super_admin | Global metrics, active tenants, system health |
| W171 | Tenant Management | `/super-admin/tenants` | super_admin | Tenant CRUD, plan assignment, billing |
| W172 | Tenant Detail | `/super-admin/tenants/{id}` | super_admin | Users, gyms, subscription, usage |
| W173 | Feature Flags | `/super-admin/features` | super_admin | Toggle features per environment |
| W174 | Configuration | `/super-admin/config` | super_admin | System settings, rate limits, thresholds |
| W175 | All Audit Logs | `/super-admin/audit` | super_admin | Cross-tenant audit search |

---

## 3. MOBILE APPLICATION — SCREEN INVENTORY

### 3.1 Auth & Onboarding

| # | Screen | Route | Roles | Description |
|---|--------|-------|-------|-------------|
| M01 | Splash Screen | `/` | All | Logo + auto-login check |
| M02 | Onboarding | `/onboarding` | customer | Goal selection, fitness level, health questions |
| M03 | Login | `/login` | customer/trainer | Email/password, biometric login (face/touch) |
| M04 | Register | `/register` | customer/trainer | Registration form, role selection |
| M05 | Forgot Password | `/forgot-password` | All | Reset flow |

### 3.2 Customer Mobile App

| # | Screen | Route | Roles | Description |
|---|--------|-------|-------|-------------|
| M10 | Home Feed | `/(tabs)/home` | customer | Membership badge, days left, next session, quick actions |
| M11 | Gym Discovery | `/(tabs)/discover` | customer | Map view, list view, filters, search |
| M12 | Gym Detail | `/gym/{gymId}` | customer | Photos, plans, trainers, reviews, classes |
| M13 | Membership Plans | `/gym/{gymId}/plans` | customer | Plan comparison, select, purchase |
| M14 | Membership Card | `/membership` | customer | QR code for entry, status, renewal options |
| M15 | Gym Entry Scanner | `/scanner` | customer | QR display for biometric fallback |
| M16 | Workout Tracker | `/(tabs)/workouts` | customer | Current plan, exercise list, timer |
| M17 | Exercise Log | `/workouts/log` | customer | Select exercise, sets/reps/weight, complete |
| M18 | Workout History | `/workouts/history` | customer | Past workouts, progress charts |
| M19 | Progress Dashboard | `/(tabs)/progress` | customer | Weight, body fat, muscle mass charts, streak |
| M20 | Body Measurements | `/progress/measurements` | customer | Log weight, body fat, measurements, photos |
| M21 | Progress Photos | `/progress/photos` | customer | Timeline view with comparison |
| M22 | Diet & Nutrition | `/(tabs)/nutrition` | customer | Daily macros, meal log, plan view |
| M23 | Meal Logger | `/nutrition/log` | customer | Quick add, search food, barcode scan |
| M24 | Diet Plan | `/nutrition/plan` | customer | Assigned plan, adherence score |
| M25 | AI Workout Generator | `/ai/workout` | customer | Goal-based plan generation |
| M26 | AI Diet Generator | `/ai/diet` | customer | Macro targets, preferences → meal plan |
| M27 | Supplement Shop | `/(tabs)/shop` | customer | Browse, filter, recommendations, order |
| M28 | Supplement Detail | `/shop/{productId}` | customer | Description, nutrition, reviews, buy |
| M29 | Cart & Checkout | `/shop/cart` | customer | Cart, address, payment, place order |
| M30 | Order History | `/shop/orders` | customer | Past orders, tracking |
| M31 | Trainer Discovery | `/(tabs)/trainers` | customer | Search, filter, profiles |
| M32 | Trainer Profile | `/trainer/{trainerId}` | customer | Bio, specialisations, availability, book |
| M33 | Book PT Session | `/book/{trainerId}` | customer | Select date/time, confirm, payment |
| M34 | Class Schedule | `/gym/{gymId}/classes` | customer | Browse classes, book, waitlist |
| M35 | My Sessions | `/(tabs)/sessions` | customer | Upcoming + past PT sessions and classes |
| M36 | Notifications | `/(tabs)/notifications` | customer | List with categories, mark read |
| M37 | Profile | `/(tabs)/profile` | customer | Personal info, settings, preferences |
| M38 | Settings | `/settings` | customer | Notifications, privacy, language, health sync |
| M39 | Loyalty & Rewards | `/rewards` | customer | Points balance, badges, leaderboard |
| M40 | Health Integrations | `/settings/health` | customer | Apple Health, Google Fit, Mi Band connect |
| M41 | Injury Logger | `/health/injury` | customer | Log injury, get workout modifications |

### 3.3 Trainer Mobile App

| # | Screen | Route | Roles | Description |
|---|--------|-------|-------|-------------|
| M50 | Trainer Home | `/(tabs)/home` | trainer | Today's schedule, client check-ins, alerts |
| M51 | My Schedule | `/(tabs)/schedule` | trainer | Calendar, session details, availability toggle |
| M52 | Session Card | `/session/{sessionId}` | trainer | Client info, exercise logging, timer, notes |
| M53 | Client List | `/(tabs)/clients` | trainer | Alphabetical, search, status filter |
| M54 | Client Profile | `/client/{clientId}` | trainer | Biometrics, workouts, diet, progress photos |
| M55 | Workout Plan Builder | `/workout-plans` | trainer | Exercise library, drag-drop, assign |
| M56 | Recommend Supplement | `/client/{clientId}/recommend` | trainer | Browse supplements, send recommendation |
| M57 | Earnings | `/(tabs)/earnings` | trainer | PT revenue, commissions, payouts |
| M58 | Messages | `/(tabs)/messages` | trainer | Chat threads with clients |
| M59 | Profile | `/(tabs)/profile` | trainer | Bio, certifications, availability, rate |

### 3.4 Nutritionist Mobile App

| # | Screen | Route | Roles | Description |
|---|--------|-------|-------|-------------|
| M70 | Nutritionist Home | `/(tabs)/home` | nutritionist | Client adherence, consultations today |
| M71 | Client List | `/(tabs)/clients` | nutritionist | Searchable, sorted by adherence |
| M72 | Client Detail | `/client/{clientId}` | nutritionist | Diet plan, food logs, lab reports |
| M73 | Diet Plan Builder | `/diet-plans` | nutritionist | Template select, customise, assign |
| M74 | Consultation View | `/consultations` | nutritionist | Upcoming, join video call |
| M75 | Lab Report Viewer | `/client/{clientId}/lab` | nutritionist | OCR parsed values, interpretation |
| M76 | Messages | `/(tabs)/messages` | nutritionist | Chat with clients |
| M77 | Profile | `/(tabs)/profile` | nutritionist | Availability, pricing, public profile |

---

## 4. SCREEN COUNT SUMMARY

| Application | Public | Auth | Gym Owner | Trainer | Customer | Nutritionist | Supp Co | Equip Mfr | Maint Prov | Company Staff | Super Admin | **Total** |
|------------|:-----:|:----:|:---------:|:-------:|:--------:|:-----------:|:-------:|:---------:|:----------:|:-------------:|:-----------:|:--------:|
| **Web** | 10 | 5 | 26 | 13 | - | 11 | 11 | 10 | 8 | 16 | 6 | **116** |
| **Mobile** | - | 5 | - | 10 | 32 | 8 | - | - | - | - | - | **55** |
| **Admin** | - | - | - | - | - | - | - | - | - | same as Web | - | **16** |
| **Total** | **10** | **10** | **26** | **23** | **32** | **19** | **11** | **10** | **8** | **16** | **6** | **171** |

---

## 5. ROUTE CONVENTIONS

| Convention | Example |
|-----------|---------|
| Dashboards | `/dashboard` (role-based redirect) |
| CRUD lists | `/dashboard/members`, `/dashboard/trainers` |
| Detail pages | `/dashboard/members/{id}` |
| Create forms | `/dashboard/members/onboard` |
| Edit forms | `/dashboard/members/{id}/edit` |
| Nested resources | `/dashboard/gyms/{id}/members` |
| Settings | `/dashboard/settings` |
| Admin (staff) | `/admin/gyms`, `/admin/revenue` |
| Super admin | `/super-admin/tenants` |
| Public SEO | `/gyms/{city}/{slug}`, `/trainers/{id}` |
| Mobile tabs | `/(tabs)/home`, `/(tabs)/discover` |

---

## 6. RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Target |
|-----------|-------|--------|
| Mobile S | 320px | Small phones |
| Mobile M | 375px | Standard phones |
| Mobile L | 425px | Large phones |
| Tablet | 768px | iPad, tablets |
| Laptop | 1024px | Standard laptops |
| Laptop L | 1440px | Large screens |
| 4K | 2560px | Ultra-wide |

---

*End of Document — Screen & Page Inventory v1.0*

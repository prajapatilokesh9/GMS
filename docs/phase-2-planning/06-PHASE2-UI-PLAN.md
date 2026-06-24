# Phase 2 UI Expansion Plan

## Frontend Architecture

| Platform | Tech Stack | Purpose |
|----------|-----------|---------|
| **Web App** | Next.js 14+ (App Router), Tailwind CSS, TanStack Query, Zustand | Admin portal, gym dashboard, discovery |
| **Mobile App** | React Native 0.73+, Expo, TanStack Query, Zustand | Customer, trainer, nutritionist, technician |
| **Design System** | Storybook + Tailwind design tokens | Shared component library |
| **State** | Zustand (global: auth, tenant), TanStack Query (server state) | Caching, optimistic updates |
| **Forms** | React Hook Form + Zod validation | All input forms |
| **Charts** | Recharts | Analytics dashboards |
| **Real-time** | Socket.io (events) + WebSocket (biometric entry) | Live updates |

## Component Hierarchy

```
shared/
├── ui/                     # Design system primitives
│   ├── Button, Input, Select, Modal, Table, Badge, Card
│   ├── FormField, FileUpload, ImageGallery, Rating
│   └── Skeleton, EmptyState, ErrorBoundary, Pagination
├── auth/
│   └── AuthGuard, RoleGuard, PermissionGate
└── layout/
    ├── AppShell, Sidebar, TopNav, Breadcrumbs
    ├── MobileBottomTabs
    └── NotificationBell, UserMenu

domain/                     # Domain-specific (Phase 2 additions)
├── billing/
│   ├── MembershipPlanCard, PlanSelector, PriceDisplay
│   ├── PaymentMethodSelector, InvoiceTable
│   └── RenewalCountdown, WalletBalance
├── marketplace/
│   ├── SupplementCard, SupplementGrid, OrderTracker
│   ├── SupplierDashboard, CommissionSplitView
│   └── TrainerAffiliateLink, PromoCodeInput
├── training/
│   ├── TrainerProfileCard, AvailabilityCalendar
│   ├── SessionCard, SessionLogForm, SessionTimer
│   └── EarningsSummary, CommissionHistory
├── equipment/
│   ├── EquipmentCard, EquipmentStatusBadge
│   ├── AMCTimeline, ServiceRequestForm
│   └── MaintenanceHistory, WarrantyBadge
├── nutrition/
│   ├── DietPlanCard, MealGrid, MacroProgressBar
│   ├── ConsultationCard, BookingCalendar
│   └── LabReportViewer, FoodLogEntry
├── maintenance/
│   ├── JobCard, JobBoardList, TechnicianCard
│   ├── JobCardForm, PhotoUpload, SignaturePad
│   └── EarningsDashboard, RatingStars
├── ai/
│   ├── RecommendationCard, ChurnRiskBadge
│   ├── OfferDisplay, OfferCTA
│   └── AIInsightPanel, ConfidenceIndicator
├── loyalty/
│   ├── PointsBalanceCard, BadgeDisplay
│   ├── LeaderboardTable, StreakIndicator
│   └── ReferralLink, RewardCard
└── staff/
    ├── TerritoryMap, GymHealthCard
    ├── VisitLogForm, NPSSurveyCard
    └── CommissionCalculator, OnboardingChecklist
```

## Page Inventory by Role

### Web (Next.js Admin Portal)

| Path | Role | Epic | Description |
|------|------|------|-------------|
| `/admin/billing` | super_admin, gym_owner | E1 | Billing dashboard, MRR, invoices |
| `/admin/billing/plans` | gym_owner | E1 | Membership plan CRUD |
| `/admin/billing/plans/{id}` | gym_owner | E1 | Plan detail, pricing tiers |
| `/admin/billing/memberships` | gym_owner | E1 | Member subscription list |
| `/admin/billing/memberships/{id}` | gym_owner | E1 | Subscription detail, pause/upgrade |
| `/admin/billing/payments` | super_admin | E1 | Payment ledger, reconciliation |
| `/admin/supplements` | gym_owner | E2 | Supplement showcase settings |
| `/admin/supplements/orders` | gym_owner | E2 | Order management |
| `/admin/supplements/orders/{id}` | gym_owner | E2 | Order detail + tracking |
| `/admin/supplements/commission` | gym_owner | E2 | Commission payouts |
| `/admin/training` | gym_owner | E3 | PT session overview |
| `/admin/training/sessions` | gym_owner | E3 | All PT sessions |
| `/admin/training/earnings` | trainer | E3 | My earnings dashboard |
| `/admin/trainers/{id}` | gym_owner | E3 | Trainer detail |
| `/admin/equipment` | gym_owner | E4 | Equipment inventory |
| `/admin/equipment/{id}` | gym_owner | E4 | Equipment detail + AMC |
| `/admin/equipment/amc` | gym_owner | E4 | AMC lifecycle |
| `/admin/nutrition` | gym_owner | E5 | Nutritionist profiles |
| `/admin/nutrition/plans` | nutritionist | E5 | Diet plan management |
| `/admin/nutrition/consultations` | nutritionist | E5 | Consultation bookings |
| `/admin/maintenance` | gym_owner | E6 | Maintenance jobs |
| `/admin/maintenance/jobs/{id}` | gym_owner | E6 | Job detail |
| `/admin/maintenance/technicians` | gym_owner | E6 | Technician directory |
| `/admin/ai` | super_admin | E7 | AI model dashboard |
| `/admin/ai/recommendations` | super_admin | E7 | Recommendation audit log |
| `/admin/loyalty` | gym_owner | E9 | Loyalty configuration |
| `/admin/loyalty/leaderboard` | gym_owner | E9 | Gym leaderboard |
| `/admin/staff` | super_admin | E10 | Staff territory dashboard |
| `/admin/staff/visits` | area_manager | E10 | Visit logs |
| `/admin/staff/nps` | area_manager | E10 | NPS survey results |
| `/admin/staff/commissions` | area_manager | E10 | Commission calculator |

### Mobile (React Native - Customer/Trainer/Nutritionist/Technician)

| Screen | Role | Epic | Description |
|--------|------|------|-------------|
| `(tabs)/home` | all | E1 | Dashboard with membership status |
| `(tabs)/discover` | customer | E2, E3 | Gym/trainer/supplement discovery |
| `(tabs)/workout` | customer | E7 | Workout logging |
| `(tabs)/nutrition` | customer | E5 | Diet plan + food log |
| `(tabs)/profile` | all | E9 | Profile, loyalty points, badges |
| `membership/purchase` | customer | E1 | Plan selection + payment |
| `membership/{id}` | customer | E1 | Membership detail + renew |
| `booking/pt-session` | customer | E3 | Book PT session |
| `booking/pt-session/{id}` | trainer | E3 | Session card + log |
| `supplements/browse` | customer | E2 | Supplement catalogue |
| `supplements/orders` | customer | E2 | Order history + tracking |
| `supplements/orders/{id}` | customer | E2 | Order detail |
| `nutrition/plans` | customer | E5 | My diet plans |
| `nutrition/food-log` | customer | E5 | Log meal |
| `nutrition/consultation` | customer | E5 | Book consultation |
| `trainer/earnings` | trainer | E3 | Earnings dashboard |
| `trainer/clients` | trainer | E3 | Client portfolio |
| `technician/jobs` | technician | E6 | Job board |
| `technician/jobs/{id}` | technician | E6 | Job card submission |
| `ai/recommendations` | customer | E7 | AI recommendations |
| `ai/offers` | customer | E7 | Personalised offers |
| `loyalty/leaderboard` | customer | E9 | Gym leaderboard |
| `loyalty/refer` | customer | E9 | Referral program |

## Sprint UI Delivery Roadmap

| Sprint | Epic | Pages | Story Points |
|--------|------|-------|--------------|
| **Sprint 4** | E1, E2 | Membership purchase flow, billing admin, supplement browse/order, plan CRUD | 8 |
| **Sprint 5** | E3, E4 | PT booking, session card, trainer earnings, equipment inventory, AMC timeline | 7 |
| **Sprint 6** | E5, E6, E9 | Diet plans, food log, consultation, job board, job card, loyalty UI | 7 |
| **Sprint 7** | E7, E8, E10 | AI recommendations, offers display, biometric entry UI, staff tools | 6 |

## State Management Approach

```
Zustand (global)
├── authStore          # User, tokens, roles, tenant
├── uiStore            # Sidebar, modals, toasts, theme
└── socketStore        # WebSocket connections, real-time events

TanStack Query (server state)
├── useMemberships()   # CRUD + cache invalidation
├── usePlans()         # Plan list + mutations
├── useOrders()        # Supplement orders + tracking
├── useSessions()      # PT sessions + booking
├── useEquipment()     # Equipment list + AMC status
├── useJobs()          # Maintenance jobs + status
├── useDietPlans()     # Diet plans + adherence
├── useFoodLogs()      # Meal logging
├── useLoyalty()       # Points, badges, leaderboard
└── useAI()            # Recommendations, churn risk, offers
```

## Testing Strategy

| Layer | Tool | Target |
|-------|------|--------|
| Unit (components) | Jest + Testing Library | All domain components |
| Integration (pages) | Playwright | All Phase 2 pages |
| E2E (critical path) | Playwright | Purchase → payment → active membership |
| Snapshot (Storybook) | Chromatic | Design system regressions |
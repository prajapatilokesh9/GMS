# Phase 0 Foundation — Complete Database Design
## Schema, Relationships, Indexes, RBAC, Multi-Tenancy & Entity Mapping

**Reference:** FITCORE PRO BLUEPRINT — Database Schema (21 tables)
**Version:** 1.0 | **Date:** June 2026

---

## 1. ENTITY-RELATIONSHIP OVERVIEW

```
TENANTS (1) ──────► USERS (N) ──────► USER_ROLES (N) ──────► ROLES (N)
    │                    │                                          │
    │                    │                                    ROLE_PERMISSIONS (N)
    │                    │                                          │
    │                    │                                    PERMISSIONS (N)
    │                    │
    │                    ├──── GYMS (N) ──── MEMBERSHIP_PLANS (N)
    │                    │       │                 │
    │                    │       │           MEMBERSHIPS (N)
    │                    │       │                 │
    │                    │       ├──── TRAINERS (N)
    │                    │       │       │
    │                    │       │       PT_SESSIONS (N)
    │                    │       │
    │                    │       ├──── WORKOUTS (N)
    │                    │       ├──── BODY_METRICS (N)
    │                    │       ├──── SUPPLEMENT_ORDERS (N)
    │                    │       ├──── EQUIPMENT (N) ─── MAINTENANCE_JOBS (N)
    │                    │       └──── LOYALTY_POINTS (N)
    │                    │
    │                    ├──── NUTRITIONISTS:
    │                    │       DIET_PLANS (N) ─── FOOD_LOGS (N)
    │                    │
    │                    ├──── SUPPLEMENT COMPANIES:
    │                    │       SUPPLEMENTS (N) ─── SUPPLEMENT_ORDERS (N)
    │                    │
    │                    ├──── EQUIPMENT MANUFACTURERS:
    │                    │       EQUIPMENT (N)
    │                    │
    │                    └──── MAINTENANCE PROVIDERS:
    │                            MAINTENANCE_JOBS (N)
    │
    ├──── PAYMENTS (N)          (polymorphic: memberships, pt_sessions, orders)
    ├──── NOTIFICATIONS (N)
    ├──── AUDIT_LOGS (N)
    ├──── AI_RECOMMENDATIONS (N)
    └──── LOYALTY_POINTS (N)
```

---

## 2. COMPLETE TABLE DEFINITIONS (21 Tables)

### Table 1: `tenants`

```sql
CREATE TABLE tenants (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE,
    plan            VARCHAR(50) DEFAULT 'starter',      -- starter, growth, pro, enterprise
    subscription_status VARCHAR(50) DEFAULT 'active',   -- active, trial, suspended, cancelled
    monthly_fee     DECIMAL(10, 2),
    api_key         VARCHAR(255) UNIQUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
```

### Table 2: `users`

```sql
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    phone           VARCHAR(20),
    password_hash   VARCHAR(255),
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    avatar_url      TEXT,
    date_of_birth   DATE,
    gender          VARCHAR(20),
    status          VARCHAR(50) DEFAULT 'active',        -- active, inactive, suspended, deleted

    -- OAuth
    google_id       VARCHAR(255) UNIQUE,
    apple_id        VARCHAR(255) UNIQUE,

    -- Preferences
    preferred_language  VARCHAR(10) DEFAULT 'en',
    preferred_currency  VARCHAR(3) DEFAULT 'INR',
    notifications_enabled BOOLEAN DEFAULT true,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_tenant_status ON users(tenant_id, status);
```

### Table 3: `roles`

```sql
CREATE TABLE roles (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) UNIQUE NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed roles (inserted by migration):
-- gym_owner, trainer, customer, nutritionist, supplement_company,
-- equipment_manufacturer, maintenance_provider, company_staff, super_admin
```

### Table 4: `user_roles`

```sql
CREATE TABLE user_roles (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    role_id         BIGINT NOT NULL,
    tenant_id       BIGINT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    UNIQUE (user_id, role_id, tenant_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_tenant ON user_roles(tenant_id);
```

### Table 5: `permissions`

```sql
CREATE TABLE permissions (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) UNIQUE NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed permissions (partial list):
-- gym:create, gym:read, gym:update, gym:delete
-- member:create, member:read, member:update, member:delete
-- trainer:create, trainer:read, trainer:update, trainer:delete
-- supplement:create, supplement:read, supplement:update, supplement:delete
-- equipment:create, equipment:read, equipment:update, equipment:delete
-- payment:read, payment:refund
-- analytics:read, analytics:export
-- staff:read, staff:write
-- admin:all
```

### Table 6: `role_permissions`

```sql
CREATE TABLE role_permissions (
    id              BIGSERIAL PRIMARY KEY,
    role_id         BIGINT NOT NULL,
    permission_id   BIGINT NOT NULL,

    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id),
    UNIQUE (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
```

### Table 7: `gyms`

```sql
CREATE TABLE gyms (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    owner_id        BIGINT NOT NULL,

    -- Basic info
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    phone           VARCHAR(20),
    email           VARCHAR(255),
    website         VARCHAR(255),

    -- Address
    address_line_1  VARCHAR(255),
    address_line_2  VARCHAR(255),
    city            VARCHAR(100),
    state           VARCHAR(100),
    postal_code     VARCHAR(20),
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),

    -- Branding
    logo_url        TEXT,
    cover_photo_url TEXT,
    description     TEXT,

    -- Gym info
    established_year    INT,
    total_capacity      INT,
    equipment_count     INT,
    trainer_count       INT,

    -- Google My Business
    gmb_place_id        VARCHAR(255),

    -- Subscription
    subscription_plan_id     BIGINT,
    subscription_status      VARCHAR(50) DEFAULT 'active',
    subscription_started_at  TIMESTAMP,
    subscription_renews_at   TIMESTAMP,

    -- Operating hours (JSONB)
    operating_hours     JSONB DEFAULT '{"monday":"05:00-23:00","tuesday":"05:00-23:00","wednesday":"05:00-23:00","thursday":"05:00-23:00","friday":"05:00-23:00","saturday":"06:00-22:00","sunday":"06:00-20:00"}',

    -- Feature flags
    biometric_enabled               BOOLEAN DEFAULT false,
    supplement_marketplace_enabled  BOOLEAN DEFAULT false,
    equipment_management_enabled    BOOLEAN DEFAULT false,

    status          VARCHAR(50) DEFAULT 'active',

    -- Metadata
    amenities       TEXT[] DEFAULT '{}',                 -- ['parking','shower','steam','pool','cafe']

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (subscription_plan_id) REFERENCES membership_plans(id)
);

CREATE INDEX idx_gyms_tenant ON gyms(tenant_id);
CREATE INDEX idx_gyms_owner ON gyms(owner_id);
CREATE INDEX idx_gyms_city_state ON gyms(city, state);
CREATE INDEX idx_gyms_slug ON gyms(slug);
CREATE INDEX idx_gyms_location ON gyms(latitude, longitude);
CREATE INDEX idx_gyms_status ON gyms(status);
CREATE INDEX idx_gyms_amenities ON gyms USING GIN(amenities);
```

### Table 8: `membership_plans`

```sql
CREATE TABLE membership_plans (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    gym_id          BIGINT NOT NULL,

    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(50) NOT NULL,                -- fixed, payg, flex
    description     TEXT,

    -- Pricing
    price_amount    DECIMAL(10, 2) NOT NULL,
    currency        VARCHAR(3) DEFAULT 'INR',

    -- Duration
    duration_days   INT,                                 -- 30 for monthly, NULL for PAYG
    sessions_included INT,                               -- NULL if unlimited

    -- Features (JSONB) {pool: true, steam: true, trainer_included: 2}
    features        JSONB DEFAULT '{}',

    -- Billing
    auto_renew      BOOLEAN DEFAULT true,
    is_active       BOOLEAN DEFAULT true,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (gym_id) REFERENCES gyms(id)
);

CREATE INDEX idx_membership_plans_gym ON membership_plans(gym_id, is_active);
CREATE INDEX idx_membership_plans_type ON membership_plans(type);
```

### Table 9: `memberships`

```sql
CREATE TABLE memberships (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    gym_id          BIGINT NOT NULL,
    customer_id     BIGINT NOT NULL,
    plan_id         BIGINT NOT NULL,

    -- Dates
    start_date      DATE NOT NULL,
    end_date        DATE,
    joined_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Status
    status          VARCHAR(50) DEFAULT 'active',        -- active, expired, paused, cancelled, suspended

    -- Payment
    price_paid      DECIMAL(10, 2) NOT NULL,
    payment_id      BIGINT,
    payment_method  VARCHAR(50),                         -- card, upi, wallet

    -- Renewal
    auto_renew      BOOLEAN DEFAULT true,
    renewal_date    DATE,
    last_renewed_at TIMESTAMP,

    -- Pause
    paused_at       TIMESTAMP,
    paused_until    TIMESTAMP,

    -- PAYG specific
    wallet_balance  DECIMAL(10, 2) DEFAULT 0,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (gym_id) REFERENCES gyms(id),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (plan_id) REFERENCES membership_plans(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);

CREATE INDEX idx_memberships_customer_gym ON memberships(customer_id, gym_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_memberships_renewal_date ON memberships(renewal_date);
CREATE INDEX idx_memberships_end_date ON memberships(end_date);
CREATE INDEX idx_memberships_tenant ON memberships(tenant_id);
```

### Table 10: `trainers`

```sql
CREATE TABLE trainers (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    gym_id          BIGINT,                              -- NULL if independent

    -- Profile
    bio             TEXT,
    specialisations TEXT[],
    certifications  JSONB DEFAULT '[]',                  -- [{name: "NASM", issued_date: "2020-01-01", verified: true}]
    experience_years INT,

    -- Pricing
    hourly_rate     DECIMAL(10, 2),
    is_independent  BOOLEAN DEFAULT false,

    -- Ratings
    rating          DECIMAL(3, 2) DEFAULT 5.00,
    total_reviews   INT DEFAULT 0,
    total_completed_sessions INT DEFAULT 0,

    -- Availability (JSONB)
    availability    JSONB DEFAULT '{}',                   -- {monday: [{start: "09:00", end: "17:00"}]}

    status          VARCHAR(50) DEFAULT 'active',

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (gym_id) REFERENCES gyms(id)
);

CREATE INDEX idx_trainers_gym ON trainers(gym_id, status);
CREATE INDEX idx_trainers_specialisations ON trainers USING GIN(specialisations);
CREATE INDEX idx_trainers_user ON trainers(user_id);
CREATE INDEX idx_trainers_rating ON trainers(rating DESC);
```

### Table 11: `pt_sessions`

```sql
CREATE TABLE pt_sessions (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    trainer_id      BIGINT NOT NULL,
    customer_id     BIGINT NOT NULL,
    gym_id          BIGINT NOT NULL,

    -- Timing
    scheduled_at    TIMESTAMP NOT NULL,
    duration_minutes INT NOT NULL,
    started_at      TIMESTAMP,
    ended_at        TIMESTAMP,

    -- Status
    status          VARCHAR(50) DEFAULT 'scheduled',     -- scheduled, in-progress, completed, cancelled, no-show

    -- Session content
    trainer_notes   TEXT,
    exercises_done  JSONB DEFAULT '[]',                  -- [{exercise: "chest_press", sets: 3, reps: 10, weight: 40}]

    -- Payment
    amount_due      DECIMAL(10, 2),
    payment_id      BIGINT,
    payment_status  VARCHAR(50) DEFAULT 'pending',       -- pending, completed, refunded

    -- Recording
    recording_url             TEXT,
    recording_duration_seconds INT,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (trainer_id) REFERENCES trainers(id),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (gym_id) REFERENCES gyms(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);

CREATE INDEX idx_pt_sessions_trainer_date ON pt_sessions(trainer_id, scheduled_at);
CREATE INDEX idx_pt_sessions_customer_date ON pt_sessions(customer_id, scheduled_at);
CREATE INDEX idx_pt_sessions_status ON pt_sessions(status);
CREATE INDEX idx_pt_sessions_scheduled_at ON pt_sessions(scheduled_at);
```

### Table 12: `workouts`

```sql
CREATE TABLE workouts (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    customer_id     BIGINT NOT NULL,
    trainer_id      BIGINT,
    gym_id          BIGINT NOT NULL,

    -- Date
    workout_date    DATE NOT NULL,
    start_time      TIMESTAMP,
    end_time        TIMESTAMP,

    -- Details
    workout_type    VARCHAR(50),                         -- chest, back, cardio, yoga, class
    exercises       JSONB NOT NULL,                      -- [{exercise_id, name, sets, reps, weight, rest_seconds}]
    duration_minutes INT,
    difficulty_rating INT,                              -- 1-10
    notes           TEXT,
    photos          TEXT[],                              -- URLs

    -- AI flag
    ai_generated    BOOLEAN DEFAULT false,
    ai_plan_id      BIGINT,

    -- Mood & health
    mood            VARCHAR(50),                         -- energetic, tired, motivated, unmotivated
    injury_flags    TEXT,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (trainer_id) REFERENCES trainers(id),
    FOREIGN KEY (gym_id) REFERENCES gyms(id)
);

CREATE INDEX idx_workouts_customer_date ON workouts(customer_id, workout_date);
CREATE INDEX idx_workouts_workout_date ON workouts(workout_date);
CREATE INDEX idx_workouts_type ON workouts(workout_type);
```

### Table 13: `body_metrics`

```sql
CREATE TABLE body_metrics (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,

    -- Date
    recorded_at     DATE NOT NULL,

    -- Measurements
    weight_kg       DECIMAL(5, 2),
    height_cm       DECIMAL(5, 2),
    bmi             DECIMAL(4, 2),
    body_fat_percentage DECIMAL(5, 2),
    muscle_mass_kg  DECIMAL(5, 2),
    water_percentage DECIMAL(5, 2),

    -- Circumferences (JSONB) {chest: 100, waist: 80, bicep: 35, thigh: 60}
    measurements    JSONB DEFAULT '{}',

    -- Photos (JSONB) [{url, taken_at, note}]
    photos          JSONB DEFAULT '[]',

    -- Source (manual, biometric_device, wearable_sync)
    source          VARCHAR(50) DEFAULT 'manual',

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_body_metrics_user_date ON body_metrics(user_id, recorded_at DESC);
CREATE UNIQUE INDEX idx_body_metrics_user_date_unique ON body_metrics(user_id, recorded_at);
```

### Table 14: `diet_plans`

```sql
CREATE TABLE diet_plans (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    nutritionist_id BIGINT NOT NULL,
    customer_id     BIGINT NOT NULL,

    -- Plan info
    name            VARCHAR(255),
    description     TEXT,

    -- Duration
    start_date      DATE,
    end_date        DATE,

    -- Targets
    daily_calorie_target INT,
    macros          JSONB DEFAULT '{}',                  -- {protein_g: 150, carbs_g: 200, fat_g: 70}

    -- Meals (JSONB) [{meal_type: "breakfast", time: "08:00", foods: [{food_name, quantity, unit, calories}]}]
    meals           JSONB NOT NULL,

    -- Status
    status          VARCHAR(50) DEFAULT 'active',        -- active, completed, paused

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (nutritionist_id) REFERENCES users(id),
    FOREIGN KEY (customer_id) REFERENCES users(id)
);

CREATE INDEX idx_diet_plans_customer ON diet_plans(customer_id, status);
CREATE INDEX idx_diet_plans_nutritionist ON diet_plans(nutritionist_id);
```

### Table 15: `food_logs`

```sql
CREATE TABLE food_logs (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,

    -- Date
    logged_at       TIMESTAMP NOT NULL,
    meal_type       VARCHAR(50),                         -- breakfast, lunch, snack, dinner

    -- Foods (JSONB) [{food_id, name, quantity, unit, calories, protein_g, carbs_g, fat_g}]
    foods           JSONB NOT NULL,
    total_calories  INT,

    -- Macros
    macros          JSONB DEFAULT '{}',                  -- {protein_g, carbs_g, fat_g}

    -- Metadata
    notes           TEXT,
    photos          TEXT[],

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_food_logs_user_date ON food_logs(user_id, logged_at);
CREATE INDEX idx_food_logs_logged_at ON food_logs(logged_at);
```

### Table 16: `supplements`

```sql
CREATE TABLE supplements (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    company_id      BIGINT NOT NULL,

    -- Product info
    name            VARCHAR(255) NOT NULL,
    sku             VARCHAR(100) UNIQUE,
    category        VARCHAR(100),                        -- protein, bcaa, creatine, vitamin, pre_workout, etc.
    description     TEXT,

    -- Pricing & stock
    price_amount    DECIMAL(10, 2) NOT NULL,
    currency        VARCHAR(3) DEFAULT 'INR',
    stock_type      VARCHAR(50),                         -- dropship, physical
    physical_stock_qty INT,                              -- NULL if dropship

    -- Images
    images          TEXT[],

    -- Variants (JSONB) [{flavour: "chocolate", size_grams: 1000, price: 2499}]
    variants        JSONB DEFAULT '[]',

    -- Nutritional info
    nutritional_facts JSONB DEFAULT '{}',
    ingredients      TEXT[],
    allergen_warnings TEXT[],

    -- Certifications (JSONB) [{name: "GMP", issuer, verified_at, file_url}]
    certifications  JSONB DEFAULT '[]',
    lab_report_urls TEXT[],

    -- Goals it serves
    goals           TEXT[],

    -- Status
    status          VARCHAR(50) DEFAULT 'active',        -- active, inactive, out_of_stock, discontinued

    -- Meta
    rating          DECIMAL(3, 2) DEFAULT 0,
    total_reviews   INT DEFAULT 0,
    monthly_sales   INT DEFAULT 0,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (company_id) REFERENCES users(id)
);

CREATE INDEX idx_supplements_category ON supplements(category);
CREATE INDEX idx_supplements_company ON supplements(company_id);
CREATE INDEX idx_supplements_goals ON supplements USING GIN(goals);
CREATE INDEX idx_supplements_status ON supplements(status);
```

### Table 17: `supplement_orders`

```sql
CREATE TABLE supplement_orders (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    customer_id     BIGINT NOT NULL,
    gym_id          BIGINT,

    -- Order details
    order_number    VARCHAR(50) UNIQUE,
    status          VARCHAR(50) DEFAULT 'pending',       -- pending, confirmed, shipped, delivered, returned, refunded

    -- Items (JSONB) [{supplement_id, supplement_name, quantity, unit_price, total, commission_breakdown}]
    items           JSONB NOT NULL,
    subtotal_amount DECIMAL(10, 2),
    tax_amount      DECIMAL(10, 2),
    shipping_amount DECIMAL(10, 2),
    total_amount    DECIMAL(10, 2),

    -- Delivery
    delivery_address JSONB NOT NULL,                     -- {street, city, state, postal_code, phone}
    delivered_at    TIMESTAMP,

    -- Payment
    payment_id      BIGINT,
    payment_status  VARCHAR(50),

    -- Tracking
    tracking_number VARCHAR(100),
    tracking_url    TEXT,

    -- Commission breakdown
    commission_gym_percent     DECIMAL(5, 2) DEFAULT 0,
    commission_trainer_percent DECIMAL(5, 2) DEFAULT 0,
    commission_platform_percent DECIMAL(5, 2) DEFAULT 5.00,

    -- Trainer recommendation tracking
    recommended_by_trainer_id   BIGINT,
    recommended_by_trainer_name VARCHAR(255),

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (gym_id) REFERENCES gyms(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (recommended_by_trainer_id) REFERENCES trainers(id)
);

CREATE INDEX idx_supplement_orders_customer ON supplement_orders(customer_id, created_at);
CREATE INDEX idx_supplement_orders_status ON supplement_orders(status);
CREATE INDEX idx_supplement_orders_number ON supplement_orders(order_number);
CREATE INDEX idx_supplement_orders_gym ON supplement_orders(gym_id);
```

### Table 18: `equipment`

```sql
CREATE TABLE equipment (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    manufacturer_id BIGINT NOT NULL,
    gym_id          BIGINT NOT NULL,

    -- Equipment details
    model_name      VARCHAR(255) NOT NULL,
    serial_number   VARCHAR(100) UNIQUE,
    equipment_type  VARCHAR(100),                        -- treadmill, barbell, cable_machine, leg_press, etc.

    -- Dates
    purchase_date   DATE,
    warranty_expiry DATE,
    last_serviced_at TIMESTAMP,

    -- Status
    status          VARCHAR(50) DEFAULT 'active',        -- active, under_maintenance, damaged, retired

    -- Specs (JSONB) {motor_hp: 3, max_speed: 20, weight_capacity: 150, dimensions: "200x80x150"}
    specifications  JSONB DEFAULT '{}',

    -- AMC
    amc_status      VARCHAR(50),                         -- active, expired, no_amc
    amc_expiry      DATE,
    amc_cost        DECIMAL(10, 2),

    -- IoT
    iot_device_id   VARCHAR(255),                        -- telemetry device identifier
    iot_enabled     BOOLEAN DEFAULT false,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (manufacturer_id) REFERENCES users(id),
    FOREIGN KEY (gym_id) REFERENCES gyms(id)
);

CREATE INDEX idx_equipment_gym_status ON equipment(gym_id, status);
CREATE INDEX idx_equipment_amc_expiry ON equipment(amc_expiry);
CREATE INDEX idx_equipment_type ON equipment(equipment_type);
CREATE INDEX idx_equipment_manufacturer ON equipment(manufacturer_id);
```

### Table 19: `maintenance_jobs`

```sql
CREATE TABLE maintenance_jobs (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    equipment_id    BIGINT NOT NULL,
    gym_id          BIGINT NOT NULL,
    technician_id   BIGINT,

    -- Dates
    reported_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_at    TIMESTAMP,
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP,

    -- Issue
    issue_description TEXT NOT NULL,
    urgency         VARCHAR(50) DEFAULT 'normal',        -- normal, high, emergency

    -- Status
    status          VARCHAR(50) DEFAULT 'open',          -- open, assigned, in_progress, completed, cancelled

    -- Work done
    work_done_notes TEXT,
    parts_used      JSONB DEFAULT '[]',                  -- [{part_name, part_cost, qty}]
    labour_hours    DECIMAL(5, 2),
    labour_cost     DECIMAL(10, 2),
    total_cost      DECIMAL(10, 2),

    -- Photos
    before_photos   TEXT[],
    after_photos    TEXT[],

    -- Rating
    technician_rating INT,                               -- 1-5
    technician_review TEXT,

    -- Commission split
    commission_technician_percent DECIMAL(5, 2) DEFAULT 70.00,
    commission_company_percent    DECIMAL(5, 2) DEFAULT 20.00,
    commission_platform_percent   DECIMAL(5, 2) DEFAULT 10.00,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (gym_id) REFERENCES gyms(id),
    FOREIGN KEY (technician_id) REFERENCES users(id)
);

CREATE INDEX idx_maintenance_jobs_gym_status ON maintenance_jobs(gym_id, status);
CREATE INDEX idx_maintenance_jobs_technician ON maintenance_jobs(technician_id, scheduled_at);
CREATE INDEX idx_maintenance_jobs_status ON maintenance_jobs(status);
CREATE INDEX idx_maintenance_jobs_urgency ON maintenance_jobs(urgency);
```

### Table 20: `payments`

```sql
CREATE TABLE payments (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,

    -- Entity (polymorphic)
    entity_type     VARCHAR(50) NOT NULL,                 -- membership, pt_session, supplement_order, equipment_lead, maintenance_job
    entity_id       BIGINT NOT NULL,

    -- Amount
    amount_amount   DECIMAL(10, 2) NOT NULL,
    currency        VARCHAR(3) DEFAULT 'INR',

    -- Payment gateway
    gateway         VARCHAR(50),                          -- razorpay, stripe
    gateway_txn_id  VARCHAR(255) UNIQUE,
    gateway_order_id VARCHAR(255),

    -- Status
    status          VARCHAR(50) DEFAULT 'pending',        -- pending, completed, failed, refunded, disputed

    -- Refund
    refund_amount   DECIMAL(10, 2) DEFAULT 0,
    refund_reason   TEXT,
    refunded_at     TIMESTAMP,

    -- Metadata (JSONB) — flexible payload {gym_id, customer_id, plan_id, trainer_id, etc.}
    metadata        JSONB DEFAULT '{}',

    -- Reconciliation
    reconciled_at   TIMESTAMP,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX idx_payments_entity ON payments(entity_type, entity_id);
CREATE INDEX idx_payments_gateway_txn ON payments(gateway, gateway_txn_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
```

### Table 21: `notifications`

```sql
CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,

    -- Channel
    channel         VARCHAR(50) NOT NULL,                 -- sms, email, push, whatsapp, in_app

    -- Content
    type            VARCHAR(100),                         -- membership_reminder, churn_alert, offer, payment_receipt, etc.
    title           VARCHAR(255),
    body            TEXT,

    -- Payload (JSONB) — {discount_code, gym_id, renewal_date, booking_id, etc.}
    payload         JSONB DEFAULT '{}',

    -- Scheduling
    scheduled_at    TIMESTAMP,
    sent_at         TIMESTAMP,

    -- Status
    status          VARCHAR(50) DEFAULT 'pending',        -- pending, sent, failed, bounced
    failure_reason  TEXT,

    -- Engagement
    opened_at       TIMESTAMP,
    clicked_at      TIMESTAMP,

    -- Provider message ID (for tracking)
    provider_message_id VARCHAR(255),

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_notifications_user_channel ON notifications(user_id, channel);
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
```

### Table 22: `audit_logs`

```sql
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    user_id         BIGINT,

    -- Action
    action          VARCHAR(100),                        -- create, update, delete, login, payment, export

    -- Entity
    entity_type     VARCHAR(50),                         -- gym, membership, user, payment, trainer
    entity_id       BIGINT,

    -- Changes
    old_value       JSONB,
    new_value       JSONB,

    -- Context
    ip_address      INET,
    user_agent      TEXT,
    request_id      VARCHAR(100),

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

### Table 23: `ai_recommendations`

```sql
CREATE TABLE ai_recommendations (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,

    -- Type
    type            VARCHAR(100),                        -- workout, diet, supplement, gym, trainer, offer

    -- Recommendation
    title           VARCHAR(255),
    description     TEXT,
    payload         JSONB NOT NULL,                      -- {workout_plan_id, supplement_ids, discount_percentage, trainer_ids}

    -- Confidence
    confidence_score DECIMAL(3, 2),                      -- 0.00 to 1.00
    reasoning       TEXT,                                -- Why this recommendation

    -- Engagement
    shown_at        TIMESTAMP,
    acted_on        BOOLEAN DEFAULT false,
    acted_on_at     TIMESTAMP,
    action_value    DECIMAL(10, 2),                      -- $ value if purchase made

    -- Model version
    model_version   VARCHAR(50),

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_ai_recommendations_user_type ON ai_recommendations(user_id, type);
CREATE INDEX idx_ai_recommendations_created ON ai_recommendations(created_at);
CREATE INDEX idx_ai_recommendations_confidence ON ai_recommendations(confidence_score DESC);
```

### Table 24: `loyalty_points`

```sql
CREATE TABLE loyalty_points (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    gym_id          BIGINT,

    -- Points
    points_amount   INT NOT NULL,
    points_type     VARCHAR(50),                         -- purchase, referral, milestone, bonus, streak

    -- Redemption
    redeemed_at     TIMESTAMP,
    redeemed_for    TEXT,                                -- 'membership_discount_500', 'free_session'

    -- Expiry
    expires_at      TIMESTAMP,

    -- Reference
    reference_type  VARCHAR(50),                         -- membership_renewal, pt_session, supplement_order
    reference_id    BIGINT,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (gym_id) REFERENCES gyms(id)
);

CREATE INDEX idx_loyalty_points_user ON loyalty_points(user_id, redeemed_at);
CREATE INDEX idx_loyalty_points_expiry ON loyalty_points(expires_at);
CREATE INDEX idx_loyalty_points_tenant ON loyalty_points(tenant_id);
```

---

## 3. MULTI-TENANCY IMPLEMENTATION

### Row-Level Security Policy

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

-- Template RLS Policy (applied per table)
CREATE POLICY tenant_isolation ON <table_name>
    USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::bigint)
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant_id')::bigint);

-- Super admin bypass
CREATE POLICY super_admin_access ON <table_name>
    FOR ALL
    USING (CURRENT_SETTING('app.current_user_role') = 'super_admin')
    WITH CHECK (CURRENT_SETTING('app.current_user_role') = 'super_admin');
```

### Application-Level Tenant Context

```typescript
// Middleware sets tenant context per request
// Extract from JWT → set PostgreSQL session variable
// Prisma middleware injects tenant_id into all queries

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    tenant_id: number;
    roles: string[];
  };
}
```

---

## 4. ROLE-BASED ACCESS CONTROL MATRIX

| Permission \ Role | gym_owner | trainer | customer | nutritionist | supp_company | equip_mfr | maint_prov | company_staff | super_admin |
|------------------|-----------|---------|----------|-------------|-------------|-----------|------------|--------------|-------------|
| `gym:read` | Own | Assigned | Browse | ✗ | ✗ | ✗ | Assigned | All | All |
| `gym:write` | Own | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | All |
| `member:read` | Own gym | Own clients | Self | Own clients | ✗ | ✗ | ✗ | All | All |
| `member:write` | Own gym | ✗ | Self | ✗ | ✗ | ✗ | ✗ | ✗ | All |
| `trainer:read` | Own gym | Self | Browse | ✗ | ✗ | ✗ | ✗ | All | All |
| `trainer:write` | Own gym | Self | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | All |
| `supplement:read` | Marketplace | Browse | Browse | Browse | Own | ✗ | ✗ | All | All |
| `supplement:write` | ✗ | ✗ | ✗ | ✗ | Own | ✗ | ✗ | ✗ | All |
| `equipment:read` | Own gym | ✗ | ✗ | ✗ | ✗ | Own + leads | Assigned | All | All |
| `equipment:write` | Own gym | ✗ | ✗ | ✗ | ✗ | Own | ✗ | ✗ | All |
| `payment:read` | Own gym | Own | Self | Own | Own | Own | Own | All | All |
| `payment:refund` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | Limited | All |
| `analytics:read` | Own gym | Self | Self | Own | Own | Own | Own | Territory | All |
| `analytics:export` | Own gym | Self | Self | Own | Own | Own | Own | Territory | All |
| `staff:read` | Own gym | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | Own | All |
| `staff:write` | Own gym | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | Limited | All |
| `admin:all` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | All |

---

## 5. AUDIT & COMPLIANCE SCHEMA EXTENSIONS

```sql
-- Data retention policy marker
ALTER TABLE users ADD COLUMN data_retention_date DATE;

-- Deletion request tracking
CREATE TABLE deletion_requests (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    requested_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_for   DATE,                                -- 30-day grace period
    status          VARCHAR(50) DEFAULT 'pending',
    completed_at    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. SEED DATA STRATEGY

```sql
-- Initial roles (inserted via migration)
INSERT INTO roles (name, description) VALUES
    ('gym_owner', 'Gym/fitness center owner or manager'),
    ('trainer', 'Personal trainer or group fitness instructor'),
    ('customer', 'Gym member or end-user'),
    ('nutritionist', 'Dietitian or nutrition consultant'),
    ('supplement_company', 'Supplement brand or distributor'),
    ('equipment_manufacturer', 'Fitness equipment manufacturer or dealer'),
    ('maintenance_provider', 'Equipment maintenance technician or company'),
    ('company_staff', 'FitCore Pro internal staff'),
    ('super_admin', 'Full system access');

-- Initial permissions (seeded in development)
INSERT INTO permissions (name, description) VALUES ...;
```

---

## 7. SUMMARY OF ALL RELATIONSHIPS

| Parent | Child | Relationship Type | Foreign Key |
|--------|-------|------------------|-------------|
| tenants | users | 1:N | users.tenant_id |
| tenants | gyms | 1:N | gyms.tenant_id |
| tenants | all tenant-scoped tables | 1:N | *.tenant_id |
| users (owner) | gyms | 1:N | gyms.owner_id |
| gyms | membership_plans | 1:N | membership_plans.gym_id |
| gyms | memberships | 1:N | memberships.gym_id |
| gyms | trainers | 1:N | trainers.gym_id |
| gyms | workouts | 1:N | workouts.gym_id |
| gyms | equipment | 1:N | equipment.gym_id |
| gyms | supplement_orders | 1:N | supplement_orders.gym_id |
| gyms | loyalty_points | 1:N | loyalty_points.gym_id |
| users (customer) | memberships | 1:N | memberships.customer_id |
| users (customer) | workouts | 1:N | workouts.customer_id |
| users (customer) | body_metrics | 1:N | body_metrics.user_id |
| users (customer) | food_logs | 1:N | food_logs.user_id |
| users (customer) | supplement_orders | 1:N | supplement_orders.customer_id |
| users (customer) | diet_plans | 1:N | diet_plans.customer_id |
| users (nutritionist) | diet_plans | 1:N | diet_plans.nutritionist_id |
| users (supplement co) | supplements | 1:N | supplements.company_id |
| users (manufacturer) | equipment | 1:N | equipment.manufacturer_id |
| users (technician) | maintenance_jobs | 1:N | maintenance_jobs.technician_id |
| trainers | pt_sessions | 1:N | pt_sessions.trainer_id |
| users (customer) | pt_sessions | 1:N | pt_sessions.customer_id |
| membership_plans | memberships | 1:N | memberships.plan_id |
| equipment | maintenance_jobs | 1:N | maintenance_jobs.equipment_id |
| payments | memberships | 1:1 | memberships.payment_id |
| payments | pt_sessions | 1:1 | pt_sessions.payment_id |
| payments | supplement_orders | 1:1 | supplement_orders.payment_id |
| users | user_roles | 1:N | user_roles.user_id |
| roles | user_roles | 1:N | user_roles.role_id |
| roles | role_permissions | 1:N | role_permissions.role_id |
| permissions | role_permissions | 1:N | role_permissions.permission_id |

---

*End of Document — Complete Database Design v1.0*

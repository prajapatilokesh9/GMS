# Phase 1 — Final Prisma Schema

**Reference:** FITCORE PRO BLUEPRINT — Database Schema (Tables 1-7)  
**Scope:** Phase 1 only — Foundation, Auth, RBAC, Multi-tenancy, Gym onboarding  
**Deferred tables:** memberships, membership_plans, trainers, pt_sessions, workouts, body_metrics, diet_plans, food_logs, supplements, supplement_orders, equipment, maintenance_jobs, payments, notifications, ai_recommendations, loyalty_points

---

## Schema File: `apps/backend/prisma/schema.prisma`

```prisma
// This is your Prisma schema file.
// Phase 1 — Foundation: Tenants, Users, Roles, Permissions, Gyms

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["rowLevelSecurity", "postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgres, citext]
}

// ────────────────────────────────────────────────────────────────
// EXTENSION SETUP
// ────────────────────────────────────────────────────────────────

enum Extension {
  citext    // Case-insensitive text (email lookups)
  pgcrypto  // gen_random_uuid()
  postgis   // Geospatial queries (Phase 2+)
}

// ────────────────────────────────────────────────────────────────
// TENANTS — Multi-tenancy root
// ────────────────────────────────────────────────────────────────

model Tenant {
  id                  BigInt    @id @default(autoincrement())
  name                String    @db.VarChar(255)
  slug                String    @unique @db.VarChar(255)
  plan                String?   @default("starter") @db.VarChar(50)       // starter, growth, pro, enterprise
  subscriptionStatus  String?   @default("active") @db.VarChar(50)       // active, trial, suspended, cancelled
  monthlyFee          Decimal?  @db.Decimal(10, 2)
  apiKey              String?   @unique @db.VarChar(255)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // Relations (Phase 2+: member limits, feature flags)
  users               User[]
  gyms                Gym[]

  @@map("tenants")
}

// ────────────────────────────────────────────────────────────────
// USERS — All platform users (all roles)
// ────────────────────────────────────────────────────────────────

model User {
  id                    BigInt      @id @default(autoincrement())
  tenantId              BigInt
  email                 String      @unique @db.VarChar(255) @db.Citext   // Case-insensitive
  phone                 String?     @db.VarChar(20)
  passwordHash          String?     @db.VarChar(255)                       // Nullable for OAuth-only users
  firstName             String?     @db.VarChar(100)
  lastName              String?     @db.VarChar(100)
  avatarUrl             String?     @db.Text
  dateOfBirth           DateTime?   @db.Date
  gender                String?     @db.VarChar(20)
  status                String?     @default("active") @db.VarChar(50)    // active, inactive, suspended, deleted

  // OAuth
  googleId              String?     @unique @db.VarChar(255)
  appleId               String?     @unique @db.VarChar(255)

  // Preferences
  preferredLanguage     String?     @default("en") @db.VarChar(10)
  preferredCurrency     String?     @default("INR") @db.VarChar(3)
  notificationsEnabled  Boolean?    @default(true)

  // Audit
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  // Relations
  tenant                Tenant      @relation(fields: [tenantId], references: [id])
  userRoles             UserRole[]
  ownedGyms             Gym[]       @relation("GymOwner")

  @@index([tenantId, email])
  @@index([phone])
  @@index([tenantId, status])
  @@map("users")
}

// ────────────────────────────────────────────────────────────────
// ROLES — Role definitions
// ────────────────────────────────────────────────────────────────

model Role {
  id          BigInt              @id @default(autoincrement())
  name        String              @unique @db.VarChar(100)
  description String?             @db.Text
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  userRoles         UserRole[]
  rolePermissions   RolePermission[]

  @@map("roles")
}

// ────────────────────────────────────────────────────────────────
// USER_ROLES — Many-to-many: users <-> roles (scoped to tenant)
// ────────────────────────────────────────────────────────────────

model UserRole {
  id        BigInt  @id @default(autoincrement())
  userId    BigInt
  roleId    BigInt
  tenantId  BigInt

  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role    @relation(fields: [roleId], references: [id])
  tenant    Tenant  @relation(fields: [tenantId], references: [id])

  @@unique([userId, roleId, tenantId])
  @@index([userId])
  @@index([roleId])
  @@index([tenantId])
  @@map("user_roles")
}

// ────────────────────────────────────────────────────────────────
// PERMISSIONS — Granular permission definitions
// ────────────────────────────────────────────────────────────────

model Permission {
  id          BigInt              @id @default(autoincrement())
  name        String              @unique @db.VarChar(100)
  description String?             @db.Text
  createdAt   DateTime            @default(now())

  rolePermissions   RolePermission[]

  @@map("permissions")
}

// ────────────────────────────────────────────────────────────────
// ROLE_PERMISSIONS — Many-to-many: roles <-> permissions
// ────────────────────────────────────────────────────────────────

model RolePermission {
  id            BigInt      @id @default(autoincrement())
  roleId        BigInt
  permissionId  BigInt

  role          Role        @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission    Permission  @relation(fields: [permissionId], references: [id])

  @@unique([roleId, permissionId])
  @@index([roleId])
  @@map("role_permissions")
}

// ────────────────────────────────────────────────────────────────
// GYMS — Gym/fitness center profiles
// ────────────────────────────────────────────────────────────────

model Gym {
  id                          BigInt    @id @default(autoincrement())
  tenantId                    BigInt
  ownerId                     BigInt

  // Basic info
  name                        String    @db.VarChar(255)
  slug                        String    @unique @db.VarChar(255)
  phone                       String?   @db.VarChar(20)
  email                       String?   @db.VarChar(255)
  website                     String?   @db.VarChar(255)

  // Address
  addressLine1                String?   @db.VarChar(255)
  addressLine2                String?   @db.VarChar(255)
  city                        String?   @db.VarChar(100)
  state                       String?   @db.VarChar(100)
  postalCode                  String?   @db.VarChar(20)
  latitude                    Decimal?  @db.Decimal(10, 8)
  longitude                   Decimal?  @db.Decimal(11, 8)

  // Branding
  logoUrl                     String?   @db.Text
  coverPhotoUrl               String?   @db.Text
  description                 String?   @db.Text

  // Gym info
  establishedYear             Int?
  totalCapacity               Int?
  equipmentCount              Int?
  trainerCount                Int?

  // GMB
  gmbPlaceId                  String?   @db.VarChar(255)

  // Subscription
  subscriptionPlanId          BigInt?
  subscriptionStatus          String?   @default("active") @db.VarChar(50)
  subscriptionStartedAt       DateTime?
  subscriptionRenewsAt        DateTime?

  // Operating hours (JSON)
  operatingHours              Json?     @default("{\"monday\":\"05:00-23:00\",\"tuesday\":\"05:00-23:00\",\"wednesday\":\"05:00-23:00\",\"thursday\":\"05:00-23:00\",\"friday\":\"05:00-23:00\",\"saturday\":\"06:00-22:00\",\"sunday\":\"06:00-20:00\"}")

  // Feature flags
  biometricEnabled            Boolean?  @default(false)
  supplementMarketplaceEnabled Boolean? @default(false)
  equipmentManagementEnabled  Boolean?  @default(false)

  // Status
  status                      String?   @default("active") @db.VarChar(50)

  // Metadata
  amenities                   String[]  @default([])

  // Audit
  createdAt                   DateTime  @default(now())
  updatedAt                   DateTime  @updatedAt

  // Relations
  tenant                      Tenant    @relation(fields: [tenantId], references: [id])
  owner                       User      @relation("GymOwner", fields: [ownerId], references: [id])

  @@index([tenantId])
  @@index([ownerId])
  @@index([city, state])
  @@index([slug])
  @@index([latitude, longitude])
  @@index([status])
  @@index([amenities], type: Gin)
  @@map("gyms")
}

// ────────────────────────────────────────────────────────────────
// AUDIT_LOGS — Activity tracking (Phase 1: auth events, gym events)
// ────────────────────────────────────────────────────────────────

model AuditLog {
  id          BigInt    @id @default(autoincrement())
  tenantId    BigInt
  userId      BigInt?

  action      String?   @db.VarChar(100)      // create, update, delete, login, payment
  entityType  String?   @db.VarChar(50)       // gym, user, membership, payment
  entityId    BigInt?

  oldValue    Json?
  newValue    Json?

  ipAddress   String?   @db.Inet
  userAgent   String?   @db.Text
  requestId   String?   @db.VarChar(100)

  createdAt   DateTime  @default(now())

  @@index([entityType, entityId])
  @@index([userId])
  @@index([tenantId])
  @@index([createdAt])
  @@index([action])
  @@map("audit_logs")
}
```

---

## Schema Summary (Phase 1)

| Table | Purpose | Phase 1 Active | Blueprint Table |
|-------|---------|---------------|----------------|
| `tenants` | Multi-tenancy root | ✅ | Table 21 |
| `users` | All platform users | ✅ | Table 1 |
| `roles` | Role definitions | ✅ | Table 2 |
| `user_roles` | User-role assignment | ✅ | Table 3 |
| `permissions` | Permission definitions | ✅ | Table 4 |
| `role_permissions` | Role-permission mapping | ✅ | Table 5 |
| `gyms` | Gym profiles | ✅ | Table 6 |
| `audit_logs` | Audit trail | ✅ | Additional (blueprint-compatible) |

### Index Inventory

| Table | Indexes | Purpose |
|-------|---------|---------|
| `tenants` | 1 (slug) | Lookup by slug |
| `users` | 4 (tenant+email, phone, tenant+status, email unique) | Login, search, filter |
| `user_roles` | 4 (user, role, tenant, unique constraint) | Role queries, uniqueness |
| `role_permissions` | 2 (role, unique constraint) | Permission lookup |
| `gyms` | 7 (tenant, owner, city+state, slug, lat+lng, status, amenities GIN) | Discovery, management |
| `audit_logs` | 5 (entity, user, tenant, created, action) | Audit queries |

**Total indexes:** 23

### Migration Seed Data (Phase 1)

```typescript
// prisma/seed.ts — executed after `prisma migrate dev`

Seeded entities:
1. Default tenant: "FitCore Pro Demo" (slug: "demo")
2. Roles: gym_owner, trainer, customer, nutritionist, supplement_company, 
          equipment_manufacturer, maintenance_provider, company_staff, super_admin
3. Permissions: 102 permissions across all resource categories
4. Role-permission mappings: Full matrix from Phase 0 Gate Review
5. Super admin user: admin@fitcore.app / seeded random password
6. Demo gym: "Demo Fitness Center" (city: Jaipur)
```

---

## Phase 1 Database Migration Strategy

| Step | Command | When | 
|------|---------|------|
| 1. Initial migration | `npx prisma migrate dev --name init` | Sprint 1 — Foundation |
| 2. Seed data | `npx prisma db seed` | Sprint 1 — Foundation |
| 3. Verify schema | `npx prisma validate` | CI pipeline |
| 4. Generate client | `npx prisma generate` | Build step |
| 5. Staging migration | `npx prisma migrate deploy` | CD pipeline |
| 6. Production migration | `npx prisma migrate deploy` | CD pipeline (production) |

---

## RLS Implementation (PostgreSQL Level)

```sql
-- Applied manually or via migration after schema creation
-- Phase 1 covers: users, gyms, audit_logs

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_users ON users
  USING (tenant_id = current_setting('app.current_tenant_id')::bigint)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::bigint);

CREATE POLICY tenant_isolation_gyms ON gyms
  USING (tenant_id = current_setting('app.current_tenant_id')::bigint)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::bigint);

CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  USING (tenant_id = current_setting('app.current_tenant_id')::bigint)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::bigint);

-- Super admin bypass
CREATE POLICY super_admin_access ON users FOR ALL
  USING (current_setting('app.current_user_role') = 'super_admin')
  WITH CHECK (current_setting('app.current_user_role') = 'super_admin');
```

---

*End of Phase 1 Prisma Schema*

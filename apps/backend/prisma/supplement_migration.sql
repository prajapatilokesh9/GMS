-- CreateSupplementTables
CREATE TABLE IF NOT EXISTS "billing"."supplement_companies" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(2) NOT NULL DEFAULT 'IN',
    "pincode" VARCHAR(10),
    "logo_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "supplement_companies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "billing"."supplements" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "mrp" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(50) NOT NULL DEFAULT 'unit',
    "unit_value" VARCHAR(50),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "images" JSONB DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "supplements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "billing"."supplement_orders" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "gym_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "supplement_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "payment_id" UUID,
    "tracking_id" VARCHAR(255),
    "notes" TEXT,
    "delivered_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "return_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "supplement_orders_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "supplement_companies_tenant_id_slug_key" ON "billing"."supplement_companies"("tenant_id", "slug");
CREATE INDEX IF NOT EXISTS "supplement_companies_tenant_id_idx" ON "billing"."supplement_companies"("tenant_id");
CREATE INDEX IF NOT EXISTS "supplement_companies_is_active_idx" ON "billing"."supplement_companies"("is_active");

CREATE UNIQUE INDEX IF NOT EXISTS "supplements_tenant_id_slug_key" ON "billing"."supplements"("tenant_id", "slug");
CREATE INDEX IF NOT EXISTS "supplements_tenant_id_idx" ON "billing"."supplements"("tenant_id");
CREATE INDEX IF NOT EXISTS "supplements_company_id_idx" ON "billing"."supplements"("company_id");
CREATE INDEX IF NOT EXISTS "supplements_category_is_active_idx" ON "billing"."supplements"("category", "is_active");

CREATE INDEX IF NOT EXISTS "supplement_orders_tenant_id_idx" ON "billing"."supplement_orders"("tenant_id");
CREATE INDEX IF NOT EXISTS "supplement_orders_gym_id_status_idx" ON "billing"."supplement_orders"("gym_id", "status");
CREATE INDEX IF NOT EXISTS "supplement_orders_user_id_idx" ON "billing"."supplement_orders"("user_id");
CREATE INDEX IF NOT EXISTS "supplement_orders_company_id_idx" ON "billing"."supplement_orders"("company_id");
CREATE INDEX IF NOT EXISTS "supplement_orders_status_idx" ON "billing"."supplement_orders"("status");

-- Foreign Keys
ALTER TABLE "billing"."supplement_companies" ADD CONSTRAINT "supplement_companies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;
ALTER TABLE "billing"."supplements" ADD CONSTRAINT "supplements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;
ALTER TABLE "billing"."supplements" ADD CONSTRAINT "supplements_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "billing"."supplement_companies"("id") ON DELETE CASCADE;
ALTER TABLE "billing"."supplement_orders" ADD CONSTRAINT "supplement_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;
ALTER TABLE "billing"."supplement_orders" ADD CONSTRAINT "supplement_orders_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gym"."gyms"("id") ON DELETE RESTRICT;
ALTER TABLE "billing"."supplement_orders" ADD CONSTRAINT "supplement_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT;
ALTER TABLE "billing"."supplement_orders" ADD CONSTRAINT "supplement_orders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "billing"."supplement_companies"("id") ON DELETE RESTRICT;
ALTER TABLE "billing"."supplement_orders" ADD CONSTRAINT "supplement_orders_supplement_id_fkey" FOREIGN KEY ("supplement_id") REFERENCES "billing"."supplements"("id") ON DELETE RESTRICT;

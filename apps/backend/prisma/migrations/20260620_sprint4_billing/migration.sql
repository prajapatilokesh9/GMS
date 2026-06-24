-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "billing";

-- CreateTable
CREATE TABLE "billing"."membership_plans" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "gym_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "price_amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "duration_days" INTEGER,
    "sessions_included" INTEGER,
    "features" JSONB DEFAULT '{}',
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing"."memberships" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "gym_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "plan_id" UUID,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "price_paid" DECIMAL(10,2) NOT NULL,
    "payment_method" VARCHAR(50),
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "renewal_date" TIMESTAMP(3),
    "last_renewed_at" TIMESTAMP(3),
    "paused_at" TIMESTAMP(3),
    "paused_until" TIMESTAMP(3),
    "wallet_balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cancelled_at" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing"."payments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "gateway" VARCHAR(50),
    "gateway_txn_id" VARCHAR(255),
    "gateway_order_id" VARCHAR(255),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "refund_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "refund_reason" TEXT,
    "refunded_at" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',
    "reconciled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "membership_plans_tenant_id_idx" ON "billing"."membership_plans"("tenant_id");
CREATE INDEX "membership_plans_gym_id_is_active_idx" ON "billing"."membership_plans"("gym_id", "is_active");
CREATE INDEX "memberships_tenant_id_idx" ON "billing"."memberships"("tenant_id");
CREATE INDEX "memberships_gym_id_status_idx" ON "billing"."memberships"("gym_id", "status");
CREATE INDEX "memberships_customer_id_gym_id_idx" ON "billing"."memberships"("customer_id", "gym_id");
CREATE INDEX "memberships_renewal_date_idx" ON "billing"."memberships"("renewal_date");
CREATE INDEX "memberships_status_idx" ON "billing"."memberships"("status");
CREATE INDEX "payments_tenant_id_idx" ON "billing"."payments"("tenant_id");
CREATE INDEX "payments_entity_type_entity_id_idx" ON "billing"."payments"("entity_type", "entity_id");
CREATE INDEX "payments_gateway_gateway_txn_id_idx" ON "billing"."payments"("gateway", "gateway_txn_id");
CREATE INDEX "payments_status_idx" ON "billing"."payments"("status");
CREATE INDEX "payments_created_at_idx" ON "billing"."payments"("created_at");

-- AddForeignKey
ALTER TABLE "billing"."membership_plans" ADD CONSTRAINT "membership_plans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "billing"."membership_plans" ADD CONSTRAINT "membership_plans_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gym"."gyms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "billing"."memberships" ADD CONSTRAINT "memberships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "billing"."memberships" ADD CONSTRAINT "memberships_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gym"."gyms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "billing"."memberships" ADD CONSTRAINT "memberships_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "billing"."memberships" ADD CONSTRAINT "memberships_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "billing"."membership_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "billing"."payments" ADD CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

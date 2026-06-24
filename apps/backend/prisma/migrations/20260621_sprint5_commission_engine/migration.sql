-- CreateCommissionRulesTable
CREATE TABLE IF NOT EXISTS "personal_training"."commission_rules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "gym_id" UUID NOT NULL,
    "trainer_id" UUID,
    "commission_type" VARCHAR(20) NOT NULL DEFAULT 'percentage',
    "commission_value" DECIMAL(10, 2) NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "commission_rules_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "commission_rules_commission_type_check" CHECK ("commission_type" IN ('fixed', 'percentage'))
);

-- Indexes for commission_rules
CREATE INDEX IF NOT EXISTS "commission_rules_tenant_id_status_idx" ON "personal_training"."commission_rules"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "commission_rules_tenant_id_trainer_id_idx" ON "personal_training"."commission_rules"("tenant_id", "trainer_id");
CREATE INDEX IF NOT EXISTS "commission_rules_tenant_id_gym_id_idx" ON "personal_training"."commission_rules"("tenant_id", "gym_id");
CREATE INDEX IF NOT EXISTS "commission_rules_effective_from_idx" ON "personal_training"."commission_rules"("effective_from");

-- Foreign Keys for commission_rules
ALTER TABLE "personal_training"."commission_rules" ADD CONSTRAINT "commission_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;
ALTER TABLE "personal_training"."commission_rules" ADD CONSTRAINT "commission_rules_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gym"."gyms"("id") ON DELETE CASCADE;
ALTER TABLE "personal_training"."commission_rules" ADD CONSTRAINT "commission_rules_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "personal_training"."trainers"("id") ON DELETE CASCADE;

-- CreateCommissionPayoutsTable
CREATE TABLE IF NOT EXISTS "personal_training"."commission_payouts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "trainer_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "gross_amount" DECIMAL(10, 2) NOT NULL,
    "commission_amount" DECIMAL(10, 2) NOT NULL,
    "payout_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "payout_date" TIMESTAMP(3),
    "payment_reference" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "commission_payouts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "commission_payouts_payout_status_check" CHECK ("payout_status" IN ('pending', 'approved', 'paid', 'cancelled'))
);

-- Indexes for commission_payouts
CREATE INDEX IF NOT EXISTS "commission_payouts_tenant_id_status_idx" ON "personal_training"."commission_payouts"("tenant_id", "payout_status");
CREATE INDEX IF NOT EXISTS "commission_payouts_tenant_id_trainer_id_idx" ON "personal_training"."commission_payouts"("tenant_id", "trainer_id");
CREATE INDEX IF NOT EXISTS "commission_payouts_session_id_idx" ON "personal_training"."commission_payouts"("session_id");
CREATE INDEX IF NOT EXISTS "commission_payouts_payout_date_idx" ON "personal_training"."commission_payouts"("payout_date");

-- Foreign Keys for commission_payouts
ALTER TABLE "personal_training"."commission_payouts" ADD CONSTRAINT "commission_payouts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;
ALTER TABLE "personal_training"."commission_payouts" ADD CONSTRAINT "commission_payouts_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "personal_training"."trainers"("id") ON DELETE CASCADE;
ALTER TABLE "personal_training"."commission_payouts" ADD CONSTRAINT "commission_payouts_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "personal_training"."pt_sessions"("id") ON DELETE CASCADE;

-- CreatePtSessionsTable
CREATE TABLE IF NOT EXISTS "personal_training"."pt_sessions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "trainer_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "package_id" UUID,
    "gym_id" UUID,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "status" VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pt_sessions_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "pt_sessions_tenant_id_status_idx" ON "personal_training"."pt_sessions"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "pt_sessions_tenant_id_trainer_id_idx" ON "personal_training"."pt_sessions"("tenant_id", "trainer_id");
CREATE INDEX IF NOT EXISTS "pt_sessions_tenant_id_client_id_idx" ON "personal_training"."pt_sessions"("tenant_id", "client_id");
CREATE INDEX IF NOT EXISTS "pt_sessions_scheduled_at_idx" ON "personal_training"."pt_sessions"("scheduled_at");

-- Foreign Keys
ALTER TABLE "personal_training"."pt_sessions" ADD CONSTRAINT "pt_sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;
ALTER TABLE "personal_training"."pt_sessions" ADD CONSTRAINT "pt_sessions_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "personal_training"."trainers"("id") ON DELETE CASCADE;
ALTER TABLE "personal_training"."pt_sessions" ADD CONSTRAINT "pt_sessions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "personal_training"."pt_sessions" ADD CONSTRAINT "pt_sessions_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "personal_training"."pt_packages"("id") ON DELETE SET NULL;
ALTER TABLE "personal_training"."pt_sessions" ADD CONSTRAINT "pt_sessions_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gym"."gyms"("id") ON DELETE SET NULL;

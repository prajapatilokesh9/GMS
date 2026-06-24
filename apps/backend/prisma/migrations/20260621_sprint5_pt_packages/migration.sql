-- CreatePtPackagesTable
CREATE TABLE IF NOT EXISTS "personal_training"."pt_packages" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "gym_id" UUID,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "total_sessions" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "validity_days" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pt_packages_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "pt_packages_tenant_id_name_key" ON "personal_training"."pt_packages"("tenant_id", "name");
CREATE INDEX IF NOT EXISTS "pt_packages_tenant_id_is_active_idx" ON "personal_training"."pt_packages"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "pt_packages_tenant_id_gym_id_idx" ON "personal_training"."pt_packages"("tenant_id", "gym_id");

-- Foreign Keys
ALTER TABLE "personal_training"."pt_packages" ADD CONSTRAINT "pt_packages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;
ALTER TABLE "personal_training"."pt_packages" ADD CONSTRAINT "pt_packages_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gym"."gyms"("id") ON DELETE SET NULL;

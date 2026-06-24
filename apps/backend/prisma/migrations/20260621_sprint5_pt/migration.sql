-- AlterTrainerUniqueness
ALTER TABLE IF EXISTS "personal_training"."trainers" DROP CONSTRAINT IF EXISTS "trainers_tenant_id_user_id_key";
DROP INDEX IF EXISTS "personal_training"."trainers_tenant_id_user_id_key";
CREATE UNIQUE INDEX IF NOT EXISTS "trainers_user_id_key" ON "personal_training"."trainers"("user_id");
CREATE INDEX IF NOT EXISTS "trainers_tenant_id_user_id_idx" ON "personal_training"."trainers"("tenant_id", "user_id");

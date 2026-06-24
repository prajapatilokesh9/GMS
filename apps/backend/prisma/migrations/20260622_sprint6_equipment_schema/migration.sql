-- Create equipment schema
CREATE SCHEMA IF NOT EXISTS equipment;

-- Create equipment_catalogue table
CREATE TABLE equipment.equipment_catalogue (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "sku" VARCHAR(100) NOT NULL,
  "brand" VARCHAR(100) NOT NULL,
  "model" VARCHAR(100) NOT NULL,
  "category" VARCHAR(100) NOT NULL,
  "subcategory" VARCHAR(100),
  "specs" JSONB DEFAULT '{}',
  "unit_cost" DECIMAL(10, 2) NOT NULL,
  "warranty_months" INT DEFAULT 12,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),

  CONSTRAINT "equipment_catalogue_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "equipment_catalogue_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX "equipment_catalogue_tenant_id_category_idx" ON equipment.equipment_catalogue ("tenant_id", "category");
CREATE INDEX "equipment_catalogue_tenant_id_subcategory_idx" ON equipment.equipment_catalogue ("tenant_id", "subcategory");
CREATE INDEX "equipment_catalogue_brand_model_idx" ON equipment.equipment_catalogue ("brand", "model");
CREATE INDEX "equipment_catalogue_sku_idx" ON equipment.equipment_catalogue ("sku");

-- Unique constraints
CREATE UNIQUE INDEX "equipment_catalogue_tenant_id_brand_model_key" ON equipment.equipment_catalogue ("tenant_id", "brand", "model");
CREATE UNIQUE INDEX "equipment_catalogue_tenant_id_sku_key" ON equipment.equipment_catalogue ("tenant_id", "sku");

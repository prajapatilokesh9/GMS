-- Create equipment_inventory table
CREATE TABLE equipment.equipment_inventory (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "catalogue_item_id" UUID NOT NULL,
    "serial_number" VARCHAR(200) NOT NULL,
    "gym_id" UUID NOT NULL,
    "location" VARCHAR(200),
    "purchase_date" DATE NOT NULL,
    "purchase_cost" DECIMAL(10, 2),
    "supplier" VARCHAR(200),
    "warranty_start_date" DATE,
    "warranty_end_date" DATE,
    "last_maintenance_at" TIMESTAMP(3),
    "next_maintenance_at" TIMESTAMP(3),
    "maintenance_interval_months" INT DEFAULT 6,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ordered',
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "equipment_inventory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "equipment_inventory_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "equipment_inventory_catalogue_item_id_fkey" FOREIGN KEY ("catalogue_item_id") REFERENCES "equipment"."equipment_catalogue"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "equipment_inventory_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gym"."gyms"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create inventory_status_log table
CREATE TABLE equipment.inventory_status_log (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "inventory_id" UUID NOT NULL,
    "from_status" VARCHAR(50),
    "to_status" VARCHAR(50) NOT NULL,
    "changed_by" UUID,
    "reason" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_status_log_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "inventory_status_log_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "inventory_status_log_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "equipment"."equipment_inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for equipment_inventory
CREATE INDEX "equipment_inventory_tenant_id_gym_id_idx" ON equipment.equipment_inventory ("tenant_id", "gym_id");
CREATE INDEX "equipment_inventory_tenant_id_catalogue_item_id_idx" ON equipment.equipment_inventory ("tenant_id", "catalogue_item_id");
CREATE INDEX "equipment_inventory_tenant_id_status_idx" ON equipment.equipment_inventory ("tenant_id", "status");
CREATE INDEX "equipment_inventory_tenant_id_next_maintenance_at_idx" ON equipment.equipment_inventory ("tenant_id", "next_maintenance_at");
CREATE INDEX "equipment_inventory_tenant_id_warranty_end_date_idx" ON equipment.equipment_inventory ("tenant_id", "warranty_end_date");

-- Indexes for inventory_status_log
CREATE INDEX "inventory_status_log_inventory_id_idx" ON equipment.inventory_status_log ("inventory_id");
CREATE INDEX "inventory_status_log_tenant_id_idx" ON equipment.inventory_status_log ("tenant_id");
CREATE INDEX "inventory_status_log_tenant_id_created_at_idx" ON equipment.inventory_status_log ("tenant_id", "created_at");

-- Unique constraints
CREATE UNIQUE INDEX "equipment_inventory_tenant_id_serial_number_key" ON equipment.equipment_inventory ("tenant_id", "serial_number");

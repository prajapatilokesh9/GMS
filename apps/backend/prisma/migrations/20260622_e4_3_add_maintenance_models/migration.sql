-- Migration: E4.3 Add Maintenance Models
-- Creates MaintenanceJob and MaintenanceStatusLog tables

-- Create MaintenanceJob table
CREATE TABLE "equipment"."maintenance_job" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" uuid NOT NULL,
    "inventory_id" uuid NOT NULL,
    "scheduled_date" date NOT NULL,
    "started_at" timestamptz,
    "completed_at" timestamptz,
    "type" varchar(20) NOT NULL DEFAULT 'preventive',
    "status" varchar(50) NOT NULL DEFAULT 'scheduled',
    "assigned_to" uuid,
    "assigned_technician_name" varchar(200),
    "assigned_to_type" varchar(20) DEFAULT 'internal',
    "assigned_to_external_id" varchar(100),
    "assigned_to_external_name" varchar(200),
    "estimated_cost" decimal(10,2),
    "labor_cost" decimal(10,2),
    "parts_cost" decimal(10,2),
    "total_cost" decimal(10,2),
    "currency" varchar(3) NOT NULL DEFAULT 'INR',
    "invoice_reference" varchar(200),
    "parts_used" jsonb,
    "approval_required" boolean NOT NULL DEFAULT false,
    "approved_by" uuid,
    "approved_at" timestamptz,
    "amc_contract_id" uuid,
    "amc_covered" boolean,
    "amc_claim_reference" varchar(200),
    "amc_billing_type" varchar(20),
    "amc_approved_amount" decimal(10,2),
    "description" text,
    "outcome" text,
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz,

    CONSTRAINT "maintenance_job_pkey" PRIMARY KEY ("id")
);

-- Create indexes for MaintenanceJob
CREATE INDEX "maintenance_job_tenant_id_status_idx" ON "equipment"."maintenance_job" ("tenant_id", "status");
CREATE INDEX "maintenance_job_tenant_id_inventory_id_idx" ON "equipment"."maintenance_job" ("tenant_id", "inventory_id");
CREATE INDEX "maintenance_job_tenant_id_scheduled_date_idx" ON "equipment"."maintenance_job" ("tenant_id", "scheduled_date");
CREATE INDEX "maintenance_job_tenant_id_assigned_to_idx" ON "equipment"."maintenance_job" ("tenant_id", "assigned_to");
CREATE INDEX "maintenance_job_tenant_id_amc_contract_id_idx" ON "equipment"."maintenance_job" ("tenant_id", "amc_contract_id");

-- Add foreign keys for MaintenanceJob
ALTER TABLE "equipment"."maintenance_job" ADD CONSTRAINT "maintenance_job_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "equipment"."equipment_inventory"("id") ON DELETE RESTRICT;
ALTER TABLE "equipment"."maintenance_job" ADD CONSTRAINT "maintenance_job_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;

-- Create MaintenanceStatusLog table
CREATE TABLE "equipment"."maintenance_status_log" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" uuid NOT NULL,
    "job_id" uuid NOT NULL,
    "from_status" varchar(50),
    "to_status" varchar(50) NOT NULL,
    "changed_by" uuid,
    "reason" varchar(500),
    "created_at" timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT "maintenance_status_log_pkey" PRIMARY KEY ("id")
);

-- Create indexes for MaintenanceStatusLog
CREATE INDEX "maintenance_status_log_job_id_idx" ON "equipment"."maintenance_status_log" ("job_id");
CREATE INDEX "maintenance_status_log_tenant_id_idx" ON "equipment"."maintenance_status_log" ("tenant_id");
CREATE INDEX "maintenance_status_log_tenant_id_created_at_idx" ON "equipment"."maintenance_status_log" ("tenant_id", "created_at");

-- Add foreign keys for MaintenanceStatusLog
ALTER TABLE "equipment"."maintenance_status_log" ADD CONSTRAINT "maintenance_status_log_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "equipment"."maintenance_job"("id") ON DELETE CASCADE;
ALTER TABLE "equipment"."maintenance_status_log" ADD CONSTRAINT "maintenance_status_log_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;

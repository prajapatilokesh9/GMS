import { z } from 'zod';

const MAINTENANCE_TYPES = ['preventive', 'corrective', 'amc'] as const;
const MAINTENANCE_STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled', 'failed'] as const;
const MAINTENANCE_BILLING_TYPES = ['included', 'partial', 'excess'] as const;

export const createMaintenanceSchema = z.object({
  inventoryId: z.string().uuid(),
  scheduledDate: z.string().or(z.date()),
  type: z.enum(MAINTENANCE_TYPES).default('preventive'),
  assignedTo: z.string().uuid().optional(),
  assignedTechnicianName: z.string().max(200).optional(),
  assignedToType: z.enum(['internal', 'marketplace']).default('internal'),
  description: z.string().optional(),
  estimatedCost: z.number().positive().max(999999999.99).optional(),
});

export const updateMaintenanceSchema = z.object({
  status: z.enum(MAINTENANCE_STATUSES).optional(),
  scheduledDate: z.string().or(z.date()).optional(),
  type: z.enum(MAINTENANCE_TYPES).optional(),
  assignedTo: z.string().uuid().optional(),
  assignedTechnicianName: z.string().max(200).optional(),
  assignedToType: z.enum(['internal', 'marketplace']).optional(),
  assignedToExternalId: z.string().max(100).optional(),
  assignedToExternalName: z.string().max(200).optional(),
  description: z.string().optional(),
  outcome: z.string().optional(),
  estimatedCost: z.number().positive().max(999999999.99).optional(),
  laborCost: z.number().min(0).max(999999999.99).optional(),
  partsCost: z.number().min(0).max(999999999.99).optional(),
  partsUsed: z.array(z.object({
    partName: z.string().max(200),
    qty: z.number().int().positive(),
    unitCost: z.number().positive().max(999999999.99),
  })).optional(),
  invoiceReference: z.string().max(200).optional(),
  reason: z.string().min(1).max(500).optional(),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().or(z.date()).optional(),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;

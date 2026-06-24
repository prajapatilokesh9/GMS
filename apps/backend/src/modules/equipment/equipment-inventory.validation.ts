import { z } from 'zod';

const ALLOWED_STATUSES = [
  'ordered', 'delivered', 'active', 'maintenance', 'under_repair',
  'damaged', 'lost_stolen', 'decommissioned',
] as const;

export const createInventorySchema = z.object({
  catalogueItemId: z.string().uuid(),
  serialNumber: z.string().min(1).max(200),
  gymId: z.string().uuid(),
  location: z.string().max(200).optional(),
  purchaseDate: z.string().or(z.date()),
  purchaseCost: z.number().positive().max(999999999.99).optional(),
  supplier: z.string().max(200).optional(),
  warrantyStartDate: z.string().or(z.date()).optional(),
  warrantyEndDate: z.string().or(z.date()).optional(),
  maintenanceIntervalMonths: z.number().int().min(1).max(120).default(6),
  status: z.enum(ALLOWED_STATUSES).default('ordered'),
  notes: z.string().optional(),
});

export const updateInventorySchema = z.object({
  catalogueItemId: z.string().uuid().optional(),
  serialNumber: z.string().min(1).max(200).optional(),
  gymId: z.string().uuid().optional(),
  location: z.string().max(200).optional(),
  purchaseDate: z.string().or(z.date()).optional(),
  purchaseCost: z.number().positive().max(999999999.99).optional(),
  supplier: z.string().max(200).optional(),
  warrantyStartDate: z.string().or(z.date()).optional(),
  warrantyEndDate: z.string().or(z.date()).optional(),
  maintenanceIntervalMonths: z.number().int().min(1).max(120).optional(),
  status: z.enum(ALLOWED_STATUSES).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
  reason: z.string().min(1).max(500).optional(),
});

export const transferInventorySchema = z.object({
  gymId: z.string().uuid(),
  reason: z.string().min(10).max(500),
});

export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;

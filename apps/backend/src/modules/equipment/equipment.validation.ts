import { z } from 'zod';

export const createCatalogueSchema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().min(1).max(100),
  brand: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  subcategory: z.string().max(100).optional(),
  specs: z.object({
    physical: z.object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      weight: z.number().optional(),
      material: z.string().optional(),
    }).optional(),
    technical: z.object({
      power: z.string().optional(),
      voltage: z.string().optional(),
      frequency: z.number().optional(),
      connections: z.array(z.string()).optional(),
      compatibility: z.array(z.string()).optional(),
    }).optional(),
    features: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }).optional(),
  unitCost: z.number().positive().max(999999999.99),
  warrantyMonths: z.number().int().min(1).max(1200).default(12),
});

export const updateCatalogueSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  sku: z.string().min(1).max(100).optional(),
  brand: z.string().min(1).max(100).optional(),
  model: z.string().min(1).max(100).optional(),
  category: z.string().min(1).max(100).optional(),
  subcategory: z.string().max(100).optional(),
  specs: z.object({
    physical: z.object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      weight: z.number().optional(),
      material: z.string().optional(),
    }).optional(),
    technical: z.object({
      power: z.string().optional(),
      voltage: z.string().optional(),
      frequency: z.number().optional(),
      connections: z.array(z.string()).optional(),
      compatibility: z.array(z.string()).optional(),
    }).optional(),
    features: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }).optional(),
  unitCost: z.number().positive().max(999999999.99).optional(),
  warrantyMonths: z.number().int().min(1).max(1200).optional(),
  isActive: z.boolean().optional(),
});

export type CreateCatalogueInput = z.infer<typeof createCatalogueSchema>;
export type UpdateCatalogueInput = z.infer<typeof updateCatalogueSchema>;

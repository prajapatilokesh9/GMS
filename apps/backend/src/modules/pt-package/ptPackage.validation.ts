import { z } from 'zod';

export const createPtPackageSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  totalSessions: z.number().int().positive(),
  price: z.number().positive(),
  validityDays: z.number().int().positive(),
  gymId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
});

export const updatePtPackageSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  totalSessions: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
  validityDays: z.number().int().positive().optional(),
  gymId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

import { z } from 'zod';

export const createPtSessionSchema = z.object({
  trainerId: z.string().uuid(),
  clientId: z.string().uuid(),
  packageId: z.string().uuid().optional(),
  gymId: z.string().uuid().optional(),
  scheduledAt: z.string().datetime(),
  notes: z.string().optional(),
});

export const updatePtSessionSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  gymId: z.string().uuid().optional(),
});

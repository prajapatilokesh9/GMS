import { z } from 'zod';

export const createTrainerSchema = z.object({
  userId: z.string().uuid(),
  gymId: z.string().uuid(),
  specialization: z.string().max(200).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string().optional(),
    year: z.number().int().optional(),
  })).optional(),
  bio: z.string().optional(),
});

export const updateTrainerSchema = z.object({
  specialization: z.string().max(200).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string().optional(),
    year: z.number().int().optional(),
  })).optional(),
  bio: z.string().optional(),
  isActive: z.boolean().optional(),
});

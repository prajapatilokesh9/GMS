import { z } from 'zod';

export const createGymSchema = z.object({
  name: z.string().min(1, 'Gym name is required').max(200),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().length(2, 'Country must be ISO 3166-1 alpha-2').optional().default('IN'),
  pincode: z.string().optional(),
  timezone: z.string().optional().default('Asia/Kolkata'),
  openingTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format').optional(),
  closingTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format').optional(),
  operatingDays: z.string().optional(),
});

export const updateGymSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().length(2).optional(),
  pincode: z.string().optional(),
  logoUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
  openingTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  closingTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  operatingDays: z.string().optional(),
});

export const updateOnboardingSchema = z.object({
  onboardingStatus: z.enum(['pending', 'documents', 'review', 'active', 'rejected']),
  rejectionReason: z.string().optional(),
});

export const addStaffSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
});

export type CreateGymInput = z.infer<typeof createGymSchema>;
export type UpdateGymInput = z.infer<typeof updateGymSchema>;
export type AddStaffInput = z.infer<typeof addStaffSchema>;

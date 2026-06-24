import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['fixed', 'payg', 'flex']),
  description: z.string().optional(),
  priceAmount: z.number().positive(),
  currency: z.string().length(3).default('INR'),
  durationDays: z.number().int().positive().optional(),
  sessionsIncluded: z.number().int().positive().optional(),
  features: z.record(z.unknown()).optional(),
  autoRenew: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const updatePlanSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  priceAmount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  durationDays: z.number().int().positive().optional(),
  sessionsIncluded: z.number().int().positive().optional(),
  features: z.record(z.unknown()).optional(),
  autoRenew: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const createMembershipSchema = z.object({
  planId: z.string().uuid(),
  startDate: z.string().datetime().optional(),
  paymentMethod: z.string().max(50).optional(),
  autoRenew: z.boolean().default(true),
});

export const updateMembershipSchema = z.object({
  status: z.enum(['paused', 'cancelled']).optional(),
  autoRenew: z.boolean().optional(),
});

export const walletTopupSchema = z.object({
  amount: z.number().positive().max(100000),
  paymentMethod: z.string().max(50).optional(),
});

export const createPaymentIntentSchema = z.object({
  entityType: z.enum(['membership', 'supplement_order', 'pt_session', 'equipment_lead', 'maintenance_job']),
  entityId: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('INR'),
  gateway: z.enum(['razorpay', 'stripe']).optional(),
});

export const confirmPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  gatewayTxnId: z.string().min(1),
  gatewayOrderId: z.string().optional(),
  status: z.enum(['completed', 'failed']),
});

export const webhookSchema = z.object({
  body: z.any(),
  signature: z.string().optional(),
});
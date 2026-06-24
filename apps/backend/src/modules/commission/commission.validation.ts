import { z } from 'zod';

const commissionTypeEnum = z.enum(['fixed', 'percentage']);
const payoutStatusEnum = z.enum(['pending', 'approved', 'paid', 'cancelled']);

export const createCommissionRuleSchema = z.object({
  gymId: z.string().uuid(),
  trainerId: z.string().uuid().optional(),
  commissionType: commissionTypeEnum,
  commissionValue: z.number().positive(),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
});

export const updateCommissionRuleSchema = z.object({
  commissionType: commissionTypeEnum.optional(),
  commissionValue: z.number().positive().optional(),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
});

export const generateCommissionPayoutSchema = z.object({
  sessionId: z.string().uuid(),
  grossAmount: z.number().positive(),
});

export const approveCommissionPayoutSchema = z.object({});

export const markPaidCommissionPayoutSchema = z.object({
  paymentReference: z.string().max(255).optional(),
  payoutDate: z.string().datetime().optional(),
});

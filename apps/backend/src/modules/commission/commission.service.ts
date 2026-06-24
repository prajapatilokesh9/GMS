import { getPrisma } from '../../database/prisma.service';
import { NotFoundError, ConflictError } from '../common/errors/AppError';
import { publishBillingEvent } from '../../events/producers/billingEvents';
import { auditService } from '../common/utils/audit';

export class CommissionService {
  // ---- Commission Rules ----

  async listRules(tenantId: string, filters?: { gymId?: string; trainerId?: string; status?: string }) {
    const prisma = getPrisma();
    const where: any = { tenantId };
    if (filters?.gymId) where.gymId = filters.gymId;
    if (filters?.trainerId) where.trainerId = filters.trainerId;
    if (filters?.status) where.status = filters.status;
    return prisma.commissionRule.findMany({
      where,
      include: {
        gym: { select: { id: true, name: true } },
        trainer: { select: { id: true, user: { select: { id: true, firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRuleById(id: string, tenantId: string) {
    const prisma = getPrisma();
    const rule = await prisma.commissionRule.findFirst({
      where: { id, tenantId },
      include: {
        gym: { select: { id: true, name: true } },
        trainer: { select: { id: true, user: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });
    if (!rule) throw new NotFoundError('Commission rule not found');
    return rule;
  }

  async createRule(input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const gym = await prisma.gym.findFirst({ where: { id: input.gymId, tenantId } });
    if (!gym) throw new NotFoundError('Gym not found');
    if (input.trainerId) {
      const trainer = await prisma.trainer.findFirst({ where: { id: input.trainerId, tenantId } });
      if (!trainer) throw new NotFoundError('Trainer not found');
    }
    const rule = await prisma.commissionRule.create({
      data: {
        tenantId,
        gymId: input.gymId,
        trainerId: input.trainerId || null,
        commissionType: input.commissionType,
        commissionValue: input.commissionValue,
        effectiveFrom: new Date(input.effectiveFrom),
        effectiveTo: input.effectiveTo ? new Date(input.effectiveTo) : null,
        status: 'active',
      },
    });
    await auditService.log({ tenantId, userId, action: 'CREATE', entityType: 'commission_rule', entityId: rule.id, description: `Created ${input.commissionType} commission rule` });
    return rule;
  }

  async updateRule(id: string, input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    await this.getRuleById(id, tenantId);
    const rule = await prisma.commissionRule.update({
      where: { id },
      data: {
        commissionType: input.commissionType,
        commissionValue: input.commissionValue,
        effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : undefined,
        effectiveTo: input.effectiveTo ? new Date(input.effectiveTo) : undefined,
      },
    });
    await auditService.log({ tenantId, userId, action: 'UPDATE', entityType: 'commission_rule', entityId: id, description: `Updated commission rule` });
    return rule;
  }

  async activateRule(id: string, tenantId: string, userId: string) {
    return this.setRuleStatus(id, tenantId, userId, 'active');
  }

  async deactivateRule(id: string, tenantId: string, userId: string) {
    return this.setRuleStatus(id, tenantId, userId, 'inactive');
  }

  private async setRuleStatus(id: string, tenantId: string, userId: string, status: string) {
    const prisma = getPrisma();
    await this.getRuleById(id, tenantId);
    const rule = await prisma.commissionRule.update({ where: { id }, data: { status } });
    await auditService.log({ tenantId, userId, action: 'UPDATE', entityType: 'commission_rule', entityId: id, description: `Commission rule ${status}` });
    return rule;
  }

  // ---- Commission Payouts ----

  async listPayouts(tenantId: string, filters?: { trainerId?: string; payoutStatus?: string }) {
    const prisma = getPrisma();
    const where: any = { tenantId };
    if (filters?.trainerId) where.trainerId = filters.trainerId;
    if (filters?.payoutStatus) where.payoutStatus = filters.payoutStatus;
    return prisma.commissionPayout.findMany({
      where,
      include: {
        trainer: { select: { id: true, user: { select: { id: true, firstName: true, lastName: true } } } },
        session: { select: { id: true, scheduledAt: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPayoutById(id: string, tenantId: string) {
    const prisma = getPrisma();
    const payout = await prisma.commissionPayout.findFirst({
      where: { id, tenantId },
      include: {
        trainer: { select: { id: true, user: { select: { id: true, firstName: true, lastName: true } } } },
        session: { select: { id: true, scheduledAt: true, status: true } },
      },
    });
    if (!payout) throw new NotFoundError('Commission payout not found');
    return payout;
  }

  async generatePayout(input: { sessionId: string; grossAmount: number }, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const session = await prisma.ptSession.findFirst({ where: { id: input.sessionId, tenantId } });
    if (!session) throw new NotFoundError('PT Session not found');
    if (session.status !== 'completed') throw new ConflictError('Can only generate payout for completed sessions');

    const existing = await prisma.commissionPayout.findFirst({ where: { sessionId: input.sessionId, tenantId } });
    if (existing) throw new ConflictError('Payout already generated for this session');

    const commissionAmount = await this.calculateCommission(input.grossAmount, session.trainerId, session.gymId, tenantId);

    const payout = await prisma.commissionPayout.create({
      data: {
        tenantId,
        trainerId: session.trainerId,
        sessionId: input.sessionId,
        grossAmount: input.grossAmount,
        commissionAmount,
        payoutStatus: 'pending',
      },
    });
    await publishBillingEvent('pt.commission.generated', { payoutId: payout.id, sessionId: input.sessionId, trainerId: session.trainerId, commissionAmount }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'CREATE', entityType: 'commission_payout', entityId: payout.id, description: `Generated commission payout: ${commissionAmount}` });
    return payout;
  }

  async approvePayout(id: string, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const payout = await this.getPayoutById(id, tenantId);
    if (payout.payoutStatus !== 'pending') throw new ConflictError('Can only approve pending payouts');
    const updated = await prisma.commissionPayout.update({ where: { id }, data: { payoutStatus: 'approved' } });
    await publishBillingEvent('pt.commission.approved', { payoutId: id, sessionId: payout.sessionId, trainerId: payout.trainerId, commissionAmount: Number(payout.commissionAmount) }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'UPDATE', entityType: 'commission_payout', entityId: id, description: 'Commission payout approved' });
    return updated;
  }

  async markPaid(id: string, input: { paymentReference?: string; payoutDate?: string }, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const payout = await this.getPayoutById(id, tenantId);
    if (payout.payoutStatus !== 'approved') throw new ConflictError('Can only mark approved payouts as paid');
    const updated = await prisma.commissionPayout.update({
      where: { id },
      data: {
        payoutStatus: 'paid',
        paymentReference: input.paymentReference || null,
        payoutDate: input.payoutDate ? new Date(input.payoutDate) : new Date(),
      },
    });
    await publishBillingEvent('pt.commission.paid', { payoutId: id, sessionId: payout.sessionId, trainerId: payout.trainerId, paymentReference: input.paymentReference }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'UPDATE', entityType: 'commission_payout', entityId: id, description: 'Commission payout marked paid' });
    return updated;
  }

  // ---- Calculation Engine ----

  private async calculateCommission(grossAmount: number, trainerId: string, gymId: string | null, tenantId: string) {
    const prisma = getPrisma();
    const now = new Date();
    const trainerRules = await prisma.commissionRule.findMany({
      where: {
        tenantId,
        trainerId,
        status: 'active',
        effectiveFrom: { lte: now },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    if (trainerRules.length > 0) {
      return this.applyRule(trainerRules[0], grossAmount);
    }
    if (gymId) {
      const gymRules = await prisma.commissionRule.findMany({
        where: {
          tenantId,
          gymId,
          trainerId: null,
          status: 'active',
          effectiveFrom: { lte: now },
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gte: now } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      if (gymRules.length > 0) {
        return this.applyRule(gymRules[0], grossAmount);
      }
    }
    return 0;
  }

  private applyRule(rule: { commissionType: string; commissionValue: any }, grossAmount: number) {
    const value = Number(rule.commissionValue);
    if (rule.commissionType === 'fixed') return value;
    if (rule.commissionType === 'percentage') return Math.round((grossAmount * value) / 100 * 100) / 100;
    return 0;
  }
}

export const commissionService = new CommissionService();

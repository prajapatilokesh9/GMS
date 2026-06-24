import { getPrisma } from '../../database/prisma.service';
import { NotFoundError, ConflictError } from '../common/errors/AppError';
import { publishBillingEvent } from '../../events/producers/billingEvents';
import { auditService } from '../common/utils/audit';
import { parsePagination, buildPaginationMeta } from '../common/utils/pagination';
import logger from '../../core/logger';

export class BillingService {
  // ==================== MEMBERSHIP PLANS ====================

  async listPlans(gymId: string, tenantId: string, pagination?: { page?: string; limit?: string }) {
    const prisma = getPrisma();
    const p = parsePagination(pagination || {});
    const where = { gymId, tenantId };
    const [data, total] = await Promise.all([
      prisma.membershipPlan.findMany({ where, orderBy: { createdAt: 'desc' }, skip: p.skip, take: p.limit }),
      prisma.membershipPlan.count({ where }),
    ]);
    return { data, pagination: buildPaginationMeta(total, p) };
  }

  async getPlan(planId: string, tenantId: string) {
    const prisma = getPrisma();
    const plan = await prisma.membershipPlan.findFirst({
      where: { id: planId, tenantId },
    });
    if (!plan) throw new NotFoundError('Membership plan not found');
    return plan;
  }

  async createPlan(input: any, tenantId: string, gymId: string, userId: string) {
    const prisma = getPrisma();
    const plan = await prisma.membershipPlan.create({
      data: {
        tenantId,
        gymId,
        name: input.name,
        type: input.type,
        description: input.description,
        priceAmount: input.priceAmount,
        currency: input.currency,
        durationDays: input.durationDays,
        sessionsIncluded: input.sessionsIncluded,
        features: input.features || {},
        autoRenew: input.autoRenew,
        isActive: input.isActive,
      },
    });
    await publishBillingEvent('plan.created', { planId: plan.id, gymId, name: plan.name, type: plan.type }, { tenantId });
    await auditService.log({ tenantId, userId, action: 'CREATE', entityType: 'membership_plan', entityId: plan.id, description: `Created plan: ${plan.name}` });
    return plan;
  }

  async updatePlan(planId: string, input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const existing = await this.getPlan(planId, tenantId);
    const plan = await prisma.membershipPlan.update({
      where: { id: planId },
      data: {
        name: input.name ?? existing.name,
        description: input.description ?? existing.description,
        priceAmount: input.priceAmount ?? existing.priceAmount,
        currency: input.currency ?? existing.currency,
        durationDays: input.durationDays ?? existing.durationDays,
        sessionsIncluded: input.sessionsIncluded ?? existing.sessionsIncluded,
        features: input.features ?? existing.features,
        autoRenew: input.autoRenew ?? existing.autoRenew,
        isActive: input.isActive ?? existing.isActive,
      },
    });
    await publishBillingEvent('plan.updated', { planId, changes: Object.keys(input) }, { tenantId });
    await auditService.log({ tenantId, userId, action: 'UPDATE', entityType: 'membership_plan', entityId: planId, description: `Updated plan: ${existing.name}` });
    return plan;
  }

  // ==================== MEMBERSHIPS ====================

  async listMemberships(gymId: string, tenantId: string, filters?: { status?: string; customerId?: string; page?: string; limit?: string }) {
    const prisma = getPrisma();
    const p = parsePagination(filters || {});
    const where: any = { gymId, tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.customerId) where.customerId = filters.customerId;
    const [data, total] = await Promise.all([
      prisma.membership.findMany({
        where,
        include: { plan: true, customer: { select: { id: true, firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: p.skip,
        take: p.limit,
      }),
      prisma.membership.count({ where }),
    ]);
    return { data, pagination: buildPaginationMeta(total, p) };
  }

  async getMembership(membershipId: string, tenantId: string) {
    const prisma = getPrisma();
    const membership = await prisma.membership.findFirst({
      where: { id: membershipId, tenantId },
      include: { plan: true, customer: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    if (!membership) throw new NotFoundError('Membership not found');
    return membership;
  }

  async createMembership(input: any, tenantId: string, gymId: string, customerId: string, userId: string) {
    const prisma = getPrisma();
    const plan = await this.getPlan(input.planId, tenantId);
    if (!plan.isActive) throw new ConflictError('Plan is no longer active');
    const startDate = input.startDate ? new Date(input.startDate) : new Date();
    const endDate = plan.durationDays ? new Date(startDate.getTime() + plan.durationDays * 86400000) : null;
    const membership = await prisma.membership.create({
      data: {
        tenantId,
        gymId,
        customerId,
        planId: plan.id,
        startDate,
        endDate,
        status: 'active',
        pricePaid: plan.priceAmount,
        paymentMethod: input.paymentMethod,
        autoRenew: input.autoRenew ?? plan.autoRenew,
        renewalDate: endDate,
      },
    });
    await publishBillingEvent('membership.created', { membershipId: membership.id, gymId, customerId, planId: plan.id, pricePaid: Number(plan.priceAmount) }, { tenantId, userId: customerId });
    await auditService.log({ tenantId, userId, action: 'CREATE', entityType: 'membership', entityId: membership.id, description: `Created membership for plan: ${plan.name}` });
    return membership;
  }

  async updateMembership(membershipId: string, input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const membership = await this.getMembership(membershipId, tenantId);
    if (input.status === 'paused' && membership.status !== 'active') {
      throw new ConflictError('Only active memberships can be paused');
    }
    if (input.status === 'cancelled' && ['cancelled', 'expired'].includes(membership.status)) {
      throw new ConflictError('Membership is already cancelled or expired');
    }
    const data: any = {};
    if (input.status === 'paused') {
      data.status = 'paused';
      data.pausedAt = new Date();
      data.pausedUntil = input.pausedUntil ? new Date(input.pausedUntil) : null;
    } else if (input.status === 'cancelled') {
      data.status = 'cancelled';
      data.cancelledAt = new Date();
      data.autoRenew = false;
    }
    if (input.autoRenew !== undefined) data.autoRenew = input.autoRenew;
    const updated = await prisma.membership.update({ where: { id: membershipId }, data });
    await publishBillingEvent('membership.updated', { membershipId, status: updated.status, changes: Object.keys(input) }, { tenantId, userId: membership.customerId });
    await auditService.log({ tenantId, userId, action: 'UPDATE', entityType: 'membership', entityId: membershipId, description: `Membership ${updated.status}` });
    return updated;
  }

  async renewMembership(membershipId: string, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const membership = await this.getMembership(membershipId, tenantId);
    if (!membership.autoRenew) throw new ConflictError('Membership does not have auto-renew enabled');
    if (membership.status !== 'active' && membership.status !== 'expired') {
      throw new ConflictError('Membership cannot be renewed in its current state');
    }
    const plan = membership.plan;
    if (!plan) throw new ConflictError('Associated plan not found');
    const newEndDate = plan.durationDays ? new Date(Date.now() + plan.durationDays * 86400000) : null;
    const updated = await prisma.membership.update({
      where: { id: membershipId },
      data: {
        status: 'active',
        startDate: new Date(),
        endDate: newEndDate,
        renewalDate: newEndDate,
        lastRenewedAt: new Date(),
        pricePaid: plan.priceAmount,
      },
    });
    await publishBillingEvent('membership.renewed', { membershipId, customerId: membership.customerId, gymId: membership.gymId, pricePaid: Number(plan.priceAmount), newEndDate: newEndDate?.toISOString() }, { tenantId, userId: membership.customerId });
    await auditService.log({ tenantId, userId, action: 'UPDATE', entityType: 'membership', entityId: membershipId, description: 'Membership renewed' });
    return updated;
  }

  // ==================== WALLET (PAYG) ====================

  async topUpWallet(membershipId: string, input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const membership = await this.getMembership(membershipId, tenantId);
    if (membership.status !== 'active') throw new ConflictError('Membership is not active');
    const updated = await prisma.membership.update({
      where: { id: membershipId },
      data: { walletBalance: { increment: input.amount } },
    });
    await publishBillingEvent('wallet.topup', { membershipId, amount: input.amount, balance: Number(updated.walletBalance) }, { tenantId, userId: membership.customerId });
    await auditService.log({ tenantId, userId, action: 'UPDATE', entityType: 'membership', entityId: membershipId, description: `Wallet top-up: +${input.amount}` });
    return { balance: Number(updated.walletBalance), added: input.amount };
  }

  // ==================== PAYMENTS ====================

  async createPaymentIntent(input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const payment = await prisma.payment.create({
      data: {
        tenantId,
        entityType: input.entityType,
        entityId: input.entityId,
        amount: input.amount,
        currency: input.currency,
        gateway: input.gateway || 'razorpay',
        status: 'pending',
      },
    });
    await auditService.log({ tenantId, userId, action: 'CREATE', entityType: 'payment', entityId: payment.id, description: `Payment intent created: ${input.amount} ${input.currency}` });
    return payment;
  }

  async confirmPayment(input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const payment = await prisma.payment.findFirst({
      where: { id: input.paymentId, tenantId },
    });
    if (!payment) throw new NotFoundError('Payment not found');
    if (payment.status !== 'pending') throw new ConflictError('Payment is already processed');
    const updated = await prisma.payment.update({
      where: { id: input.paymentId },
      data: {
        status: input.status,
        gatewayTxnId: input.gatewayTxnId,
        gatewayOrderId: input.gatewayOrderId,
        reconciledAt: input.status === 'completed' ? new Date() : null,
      },
    });
    await publishBillingEvent(
      input.status === 'completed' ? 'payment.completed' : 'payment.failed',
      { paymentId: updated.id, entityType: updated.entityType, entityId: updated.entityId, amount: Number(updated.amount), gatewayTxnId: updated.gatewayTxnId },
      { tenantId },
    );
    await auditService.log({ tenantId, userId, action: 'UPDATE', entityType: 'payment', entityId: input.paymentId, description: `Payment ${input.status}` });
    if (input.status === 'completed' && updated.entityType === 'membership') {
      await this.activateMembershipAfterPayment(updated.entityId, tenantId);
    }
    return updated;
  }

  private async activateMembershipAfterPayment(entityId: string, tenantId: string) {
    try {
      const membership = await getPrisma().membership.findFirst({ where: { id: entityId, tenantId } });
      if (membership && membership.status === 'pending') {
        await getPrisma().membership.update({ where: { id: entityId }, data: { status: 'active' } });
        logger.info(`Membership ${entityId} activated after payment`);
      }
    } catch (err) {
      logger.error(`Failed to activate membership ${entityId} after payment:`, err);
    }
  }

  async getPayment(paymentId: string, tenantId: string) {
    const prisma = getPrisma();
    const payment = await prisma.payment.findFirst({ where: { id: paymentId, tenantId } });
    if (!payment) throw new NotFoundError('Payment not found');
    return payment;
  }

  async listPayments(tenantId: string, filters?: { entityType?: string; status?: string; page?: string; limit?: string }) {
    const prisma = getPrisma();
    const p = parsePagination(filters || {});
    const where: any = { tenantId };
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.status) where.status = filters.status;
    const [data, total] = await Promise.all([
      prisma.payment.findMany({ where, orderBy: { createdAt: 'desc' }, skip: p.skip, take: p.limit }),
      prisma.payment.count({ where }),
    ]);
    return { data, pagination: buildPaginationMeta(total, p) };
  }

  // ==================== WEBHOOK ====================

  async handlePaymentWebhook(payload: any, provider: string) {
    logger.info(`Received ${provider} webhook: ${payload.event || 'unknown'}`);
    if (payload.event === 'payment.captured') {
      const entity = payload.payload?.payment?.entity;
      if (entity) {
        return this.confirmPayment({
          paymentId: entity.notes?.paymentId || entity.id,
          gatewayTxnId: entity.id,
          gatewayOrderId: entity.order_id,
          status: 'completed',
        }, entity.notes?.tenantId || '', '');
      }
    }
    return { received: true };
  }
}

export const billingService = new BillingService();
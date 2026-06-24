import { getPrisma } from '../../database/prisma.service';
import { NotFoundError, ConflictError, ValidationError } from '../common/errors/AppError';
import { Prisma } from '@prisma/client';
import { publishBillingEvent } from '../../events/producers/billingEvents';
import { auditService } from '../common/utils/audit';

export class SupplementService {
  // ==================== SUPPLEMENT COMPANIES ====================

  async listCompanies(tenantId: string, filters?: { isActive?: boolean }) {
    const prisma = getPrisma();
    const where: any = { tenantId };
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    return prisma.supplementCompany.findMany({ where, orderBy: { name: 'asc' } });
  }

  async getCompany(companyId: string, tenantId: string) {
    const prisma = getPrisma();
    const company = await prisma.supplementCompany.findFirst({
      where: { id: companyId, tenantId },
      include: { supplements: { where: { isActive: true } } },
    });
    if (!company) throw new NotFoundError('Supplement company not found');
    return company;
  }

  async createCompany(input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    let company;
    try {
      company = await prisma.supplementCompany.create({
        data: {
          tenantId,
          name: input.name,
          slug: input.slug,
          email: input.email,
          phone: input.phone,
          address: input.address,
          city: input.city,
          state: input.state,
          pincode: input.pincode,
          logoUrl: input.logoUrl,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictError('A company with this slug already exists');
      }
      throw err;
    }
    await publishBillingEvent('supplement.company.created', { companyId: company.id, name: company.name }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'CREATE', entityType: 'supplement_company', entityId: company.id, description: `Created supplement company: ${company.name}` });
    return company;
  }

  async updateCompany(companyId: string, input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const existing = await this.getCompany(companyId, tenantId);
    const company = await prisma.supplementCompany.update({
      where: { id: companyId },
      data: {
        name: input.name ?? existing.name,
        email: input.email ?? existing.email,
        phone: input.phone ?? existing.phone,
        address: input.address ?? existing.address,
        city: input.city ?? existing.city,
        state: input.state ?? existing.state,
        pincode: input.pincode ?? existing.pincode,
        logoUrl: input.logoUrl ?? existing.logoUrl,
        isActive: input.isActive ?? existing.isActive,
      },
    });
    await publishBillingEvent('supplement.company.updated', { companyId, changes: Object.keys(input) }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'UPDATE', entityType: 'supplement_company', entityId: companyId, description: `Updated supplement company: ${company.name}` });
    return company;
  }

  // ==================== SUPPLEMENTS ====================

  async listSupplements(tenantId: string, filters?: { companyId?: string; category?: string; isActive?: boolean }) {
    const prisma = getPrisma();
    const where: any = { tenantId };
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.category) where.category = filters.category;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    return prisma.supplement.findMany({
      where,
      include: { company: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async getSupplement(supplementId: string, tenantId: string) {
    const prisma = getPrisma();
    const supplement = await prisma.supplement.findFirst({
      where: { id: supplementId, tenantId },
      include: { company: { select: { id: true, name: true, logoUrl: true } } },
    });
    if (!supplement) throw new NotFoundError('Supplement not found');
    return supplement;
  }

  async createSupplement(input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const company = await prisma.supplementCompany.findFirst({ where: { id: input.companyId, tenantId } });
    if (!company) throw new NotFoundError('Supplement company not found');
    if (!company.isActive) throw new ConflictError('Company is not active');
    const supplement = await prisma.supplement.create({
      data: {
        tenantId,
        companyId: input.companyId,
        name: input.name,
        slug: input.slug,
        category: input.category,
        description: input.description,
        price: input.price,
        mrp: input.mrp,
        unit: input.unit,
        unitValue: input.unitValue,
        stock: input.stock,
        images: input.images || [],
        isActive: input.isActive,
      },
    });
    await publishBillingEvent('supplement.created', { supplementId: supplement.id, name: supplement.name, companyId: supplement.companyId }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'CREATE', entityType: 'supplement', entityId: supplement.id, description: `Created supplement: ${supplement.name}` });
    return supplement;
  }

  async updateSupplement(supplementId: string, input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const existing = await this.getSupplement(supplementId, tenantId);
    const supplement = await prisma.supplement.update({
      where: { id: supplementId },
      data: {
        name: input.name ?? existing.name,
        category: input.category ?? existing.category,
        description: input.description ?? existing.description,
        price: input.price ?? existing.price,
        mrp: input.mrp ?? existing.mrp,
        unit: input.unit ?? existing.unit,
        unitValue: input.unitValue ?? existing.unitValue,
        stock: input.stock ?? existing.stock,
        images: input.images ?? existing.images,
        isActive: input.isActive ?? existing.isActive,
      },
    });
    await publishBillingEvent('supplement.updated', { supplementId, changes: Object.keys(input) }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'UPDATE', entityType: 'supplement', entityId: supplementId, description: `Updated supplement: ${supplement.name}` });
    return supplement;
  }

  // ==================== SUPPLEMENT ORDERS ====================

  async listOrders(tenantId: string, filters?: { gymId?: string; status?: string; userId?: string }) {
    const prisma = getPrisma();
    const where: any = { tenantId };
    if (filters?.gymId) where.gymId = filters.gymId;
    if (filters?.status) where.status = filters.status;
    if (filters?.userId) where.userId = filters.userId;
    return prisma.supplementOrder.findMany({
      where,
      include: {
        supplement: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrder(orderId: string, tenantId: string) {
    const prisma = getPrisma();
    const order = await prisma.supplementOrder.findFirst({
      where: { id: orderId, tenantId },
      include: {
        supplement: { select: { id: true, name: true, images: true } },
        company: { select: { id: true, name: true } },
      },
    });
    if (!order) throw new NotFoundError('Order not found');
    return order;
  }

  async createOrder(input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const supplement = await prisma.supplement.findFirst({
      where: { id: input.supplementId, tenantId, isActive: true },
      include: { company: true },
    });
    if (!supplement) throw new NotFoundError('Supplement not found or inactive');
    if (supplement.stock < input.quantity) throw new ConflictError('Insufficient stock');
    const totalAmount = Number(supplement.price) * input.quantity;
    const order = await prisma.supplementOrder.create({
      data: {
        tenantId,
        gymId: input.gymId,
        userId,
        companyId: supplement.companyId,
        supplementId: supplement.id,
        quantity: input.quantity,
        unitPrice: supplement.price,
        totalAmount,
        notes: input.notes,
      },
    });
    await prisma.supplement.update({
      where: { id: supplement.id },
      data: { stock: { decrement: input.quantity } },
    });
    await publishBillingEvent('supplement.order.created', { orderId: order.id, supplementId: supplement.id, quantity: input.quantity, totalAmount }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'CREATE', entityType: 'supplement_order', entityId: order.id, description: `Created order for ${supplement.name} x${input.quantity}` });
    return order;
  }

  async updateOrder(orderId: string, input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const order = await this.getOrder(orderId, tenantId);
    if (order.status === 'cancelled' || order.status === 'delivered') {
      throw new ConflictError(`Order is already ${order.status}`);
    }
    const data: any = {};
    if (input.status) data.status = input.status;
    if (input.trackingId) data.trackingId = input.trackingId;
    if (input.returnReason) data.returnReason = input.returnReason;
    if (input.status === 'delivered') data.deliveredAt = new Date();
    if (input.status === 'cancelled') data.cancelledAt = new Date();
    const updated = await prisma.supplementOrder.update({ where: { id: orderId }, data });
    await publishBillingEvent('supplement.order.updated', { orderId, status: updated.status, changes: Object.keys(input) }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'UPDATE', entityType: 'supplement_order', entityId: orderId, description: `Order ${orderId} status → ${updated.status}` });
    return updated;
  }
}

export const supplementService = new SupplementService();

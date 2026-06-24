import { getPrisma } from '../../database/prisma.service';
import { NotFoundError, ConflictError } from '../common/errors/AppError';
import { publishBillingEvent } from '../../events/producers/billingEvents';
import { auditService } from '../common/utils/audit';

const VALID_TRANSITIONS: Record<string, string[]> = {
  scheduled: ['checked_in', 'cancelled'],
  checked_in: ['completed'],
  completed: [],
  cancelled: [],
};

export class PtSessionService {
  async list(tenantId: string, filters?: { trainerId?: string; clientId?: string; status?: string; gymId?: string }) {
    const prisma = getPrisma();
    const where: any = { tenantId };
    if (filters?.trainerId) where.trainerId = filters.trainerId;
    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.status) where.status = filters.status;
    if (filters?.gymId) where.gymId = filters.gymId;
    return prisma.ptSession.findMany({
      where,
      include: {
        trainer: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } } },
        client: { select: { id: true, email: true, firstName: true, lastName: true } },
        package: { select: { id: true, name: true, totalSessions: true } },
        gym: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async getById(id: string, tenantId: string) {
    const prisma = getPrisma();
    const session = await prisma.ptSession.findFirst({
      where: { id, tenantId },
      include: {
        trainer: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } } },
        client: { select: { id: true, email: true, firstName: true, lastName: true } },
        package: { select: { id: true, name: true, totalSessions: true } },
        gym: { select: { id: true, name: true } },
      },
    });
    if (!session) throw new NotFoundError('PT Session not found');
    return session;
  }

  async create(input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    if (input.packageId) {
      const pkg = await prisma.ptPackage.findFirst({ where: { id: input.packageId, tenantId, isActive: true } });
      if (!pkg) throw new NotFoundError('PT Package not found or inactive');
    }
    const trainer = await prisma.trainer.findFirst({ where: { id: input.trainerId, tenantId, isActive: true } });
    if (!trainer) throw new NotFoundError('Trainer not found or inactive');
    const client = await prisma.user.findFirst({ where: { id: input.clientId, tenantId } });
    if (!client) throw new NotFoundError('Client not found');

    const session = await prisma.ptSession.create({
      data: {
        tenantId,
        trainerId: input.trainerId,
        clientId: input.clientId,
        packageId: input.packageId || null,
        gymId: input.gymId || null,
        scheduledAt: new Date(input.scheduledAt),
        notes: input.notes,
        status: 'scheduled',
      },
    });
    await publishBillingEvent('pt.session.created', { sessionId: session.id, trainerId: input.trainerId, clientId: input.clientId }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'CREATE', entityType: 'pt_session', entityId: session.id, description: `Created PT session for trainer ${input.trainerId}` });
    return session;
  }

  async update(id: string, input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const existing = await this.getById(id, tenantId);
    if (existing.status !== 'scheduled') throw new ConflictError('Can only update scheduled sessions');

    const session = await prisma.ptSession.update({
      where: { id },
      data: {
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        notes: input.notes,
        gymId: input.gymId,
      },
    });
    await auditService.log({ tenantId, userId, action: 'UPDATE', entityType: 'pt_session', entityId: id, description: `Updated PT session` });
    return session;
  }

  async transitionStatus(id: string, newStatus: string, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const session = await this.getById(id, tenantId);
    const allowed = VALID_TRANSITIONS[session.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new ConflictError(`Cannot transition from ${session.status} to ${newStatus}`);
    }

    const updateData: any = { status: newStatus };
    if (newStatus === 'checked_in') updateData.startedAt = new Date();
    if (newStatus === 'completed') updateData.completedAt = new Date();
    if (newStatus === 'cancelled') updateData.cancelledAt = new Date();

    const updated = await prisma.ptSession.update({ where: { id }, data: updateData });

    const eventMap: Record<string, string> = {
      checked_in: 'pt.session.started',
      completed: 'pt.session.completed',
      cancelled: 'pt.session.cancelled',
    };
    const eventName = eventMap[newStatus];
    if (eventName) {
      await publishBillingEvent(eventName, { sessionId: id, status: newStatus }, { tenantId, userId });
    }
    await auditService.log({ tenantId, userId, action: 'UPDATE', entityType: 'pt_session', entityId: id, description: `PT session ${newStatus}` });
    return updated;
  }
}

export const ptSessionService = new PtSessionService();

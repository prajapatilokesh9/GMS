import { getPrisma } from '../../database/prisma.service';
import { NotFoundError, ConflictError } from '../common/errors/AppError';
import { publishBillingEvent } from '../../events/producers/billingEvents';
import { auditService } from '../common/utils/audit';

export class TrainerService {
  async list(tenantId: string, filters?: { gymId?: string; isActive?: boolean }) {
    const prisma = getPrisma();
    const where: any = { tenantId };
    if (filters?.gymId) where.gymId = filters.gymId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    return prisma.trainer.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true } },
        gym: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string, tenantId: string) {
    const prisma = getPrisma();
    const trainer = await prisma.trainer.findFirst({
      where: { id, tenantId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true } },
        gym: { select: { id: true, name: true } },
      },
    });
    if (!trainer) throw new NotFoundError('Trainer not found');
    return trainer;
  }

  async create(input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const user = await prisma.user.findFirst({ where: { id: input.userId, tenantId } });
    if (!user) throw new NotFoundError('User not found');
    const gym = await prisma.gym.findFirst({ where: { id: input.gymId, tenantId } });
    if (!gym) throw new NotFoundError('Gym not found');
    const existing = await prisma.trainer.findUnique({ where: { userId: input.userId } });
    if (existing) throw new ConflictError('User is already a trainer');
    const trainer = await prisma.trainer.create({
      data: {
        tenantId,
        userId: input.userId,
        gymId: input.gymId,
        specialization: input.specialization,
        certifications: input.certifications || [],
        bio: input.bio,
      },
    });
    await publishBillingEvent('pt.trainer.created', { trainerId: trainer.id, userId: input.userId }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'CREATE', entityType: 'trainer', entityId: trainer.id, description: `Created trainer profile for user ${input.userId}` });
    return trainer;
  }

  async update(id: string, input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const existing = await this.getById(id, tenantId);
    const trainer = await prisma.trainer.update({
      where: { id },
      data: {
        specialization: input.specialization ?? existing.specialization,
        certifications: input.certifications ?? existing.certifications,
        bio: input.bio ?? existing.bio,
        isActive: input.isActive ?? existing.isActive,
      },
    });
    await publishBillingEvent('pt.trainer.updated', { trainerId: id, changes: Object.keys(input) }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'UPDATE', entityType: 'trainer', entityId: id, description: `Updated trainer profile for user ${existing.userId}` });
    return trainer;
  }
}

export const trainerService = new TrainerService();

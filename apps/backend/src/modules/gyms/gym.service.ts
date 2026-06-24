import { getPrisma } from '../../database/prisma.service';
import { ConflictError, NotFoundError, ForbiddenError } from '../common/errors/AppError';
import { auditService } from '../common/utils/audit';
import { publishGymVerificationStatusChangedEvent, publishGymStaffAddedEvent, publishGymStaffRemovedEvent } from '../../events/producers/gymEvents';
import type { CreateGymInput, UpdateGymInput } from './gym.validation';

const ONBOARDING_TRANSITIONS: Record<string, string[]> = {
  pending: ['documents'],
  documents: ['review'],
  review: ['active', 'rejected'],
  active: [],
  rejected: ['pending'],
};

export class GymService {
  async create(input: CreateGymInput, tenantId: string, ownerId: string) {
    const prisma = getPrisma();

    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const existing = await prisma.gym.findFirst({
      where: { tenantId, slug },
    });
    if (existing) throw new ConflictError('A gym with this name already exists in your tenant');

    const gym = await prisma.gym.create({
      data: {
        tenantId,
        ownerId,
        name: input.name,
        slug,
        email: input.email,
        phone: input.phone,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        state: input.state,
        country: input.country || 'IN',
        pincode: input.pincode,
        timezone: input.timezone || 'Asia/Kolkata',
        openingTime: input.openingTime,
        closingTime: input.closingTime,
        operatingDays: input.operatingDays,
        onboardingStatus: 'pending',
        isActive: false,
      },
    });

    return gym;
  }

  async findById(id: string, tenantId: string) {
    const prisma = getPrisma();
    const gym = await prisma.gym.findFirst({
      where: { id, tenantId },
    });
    if (!gym) throw new NotFoundError('Gym');
    return gym;
  }

  async update(id: string, tenantId: string, input: UpdateGymInput) {
    const prisma = getPrisma();
    const gym = await prisma.gym.findFirst({ where: { id, tenantId } });
    if (!gym) throw new NotFoundError('Gym');

    const updated = await prisma.gym.update({
      where: { id },
      data: input,
    });
    return updated;
  }

  async findByTenant(tenantId: string, page = 1, limit = 20) {
    const prisma = getPrisma();
    const skip = (page - 1) * limit;

    const [gyms, total] = await Promise.all([
      prisma.gym.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.gym.count({ where: { tenantId } }),
    ]);

    return {
      gyms,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByOwner(ownerId: string, tenantId: string) {
    const prisma = getPrisma();
    return prisma.gym.findMany({
      where: { ownerId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOnboardingStatus(
    id: string,
    tenantId: string,
    status: string,
    rejectionReason?: string,
    verifiedBy?: string,
  ) {
    const prisma = getPrisma();
    const gym = await prisma.gym.findFirst({ where: { id, tenantId } });
    if (!gym) throw new NotFoundError('Gym');

    const allowed = ONBOARDING_TRANSITIONS[gym.onboardingStatus];
    if (!allowed || !allowed.includes(status)) {
      throw new ForbiddenError(
        `Cannot transition from ${gym.onboardingStatus} to ${status}. Allowed: ${(allowed || []).join(', ')}`,
      );
    }

    const isActive = status === 'active';
    const updateData: any = { onboardingStatus: status, isActive };

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    if (status === 'active' && verifiedBy) {
      updateData.verifiedAt = new Date();
      updateData.verifiedBy = verifiedBy;
    }

    const updated = await prisma.gym.update({
      where: { id },
      data: updateData,
    });

    await auditService.log({
      tenantId,
      userId: verifiedBy,
      action: 'UPDATE',
      entityType: 'gym',
      entityId: id,
      description: `Onboarding status changed from ${gym.onboardingStatus} to ${status}`,
      oldValue: { onboardingStatus: gym.onboardingStatus },
      newValue: { onboardingStatus: status },
    });

    await publishGymVerificationStatusChangedEvent(id, tenantId, gym.onboardingStatus, status, verifiedBy || '', rejectionReason).catch(() => {});

    return updated;
  }

  async addStaff(gymId: string, userId: string, roleId: string, tenantId: string) {
    const prisma = getPrisma();

    const gym = await prisma.gym.findFirst({ where: { id: gymId, tenantId } });
    if (!gym) throw new NotFoundError('Gym');

    const existing = await prisma.userRole.findFirst({
      where: { userId, roleId, gymId },
    });
    if (existing) throw new ConflictError('User already has this role at this gym');

    const userRole = await prisma.userRole.create({
      data: { tenantId, userId, roleId, gymId },
      include: { role: true, user: true },
    });

    await publishGymStaffAddedEvent(gymId, tenantId, userId, userRole.role.slug, userId).catch(() => {});

    return userRole;
  }

  async listStaff(gymId: string, tenantId: string) {
    const prisma = getPrisma();
    const gym = await prisma.gym.findFirst({ where: { id: gymId, tenantId } });
    if (!gym) throw new NotFoundError('Gym');

    return prisma.userRole.findMany({
      where: { gymId },
      include: { role: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async removeStaff(userRoleId: string, tenantId?: string, gymId?: string) {
    const prisma = getPrisma();
    const userRole = await prisma.userRole.findUnique({ where: { id: userRoleId } });
    if (!userRole) throw new NotFoundError('Staff assignment');
    await prisma.userRole.delete({ where: { id: userRoleId } });
    if (tenantId && gymId) {
      await publishGymStaffRemovedEvent(gymId, tenantId, userRole.userId, '').catch(() => {});
    }
  }
}

export const gymService = new GymService();

import { getPrisma } from '../../database/prisma.service';
import { NotFoundError, ConflictError } from '../common/errors/AppError';
import { publishBillingEvent } from '../../events/producers/billingEvents';
import { auditService } from '../common/utils/audit';

export class PtPackageService {
  async list(tenantId: string, filters?: { gymId?: string; isActive?: boolean }) {
    const prisma = getPrisma();
    const where: any = { tenantId };
    if (filters?.gymId) where.gymId = filters.gymId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    return prisma.ptPackage.findMany({
      where,
      include: { gym: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: string, tenantId: string) {
    const prisma = getPrisma();
    const pkg = await prisma.ptPackage.findFirst({
      where: { id, tenantId },
      include: { gym: { select: { id: true, name: true } } },
    });
    if (!pkg) throw new NotFoundError('PT Package not found');
    return pkg;
  }

  async create(input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    try {
      const pkg = await prisma.ptPackage.create({
        data: {
          tenantId,
          gymId: input.gymId || null,
          name: input.name,
          description: input.description,
          totalSessions: input.totalSessions,
          price: input.price,
          validityDays: input.validityDays,
          isActive: input.isActive,
        },
      });
      await publishBillingEvent('pt.package.created', { packageId: pkg.id, name: pkg.name }, { tenantId, userId });
      await auditService.log({ tenantId, userId, action: 'CREATE', entityType: 'pt_package', entityId: pkg.id, description: `Created PT package: ${pkg.name}` });
      return pkg;
    } catch (err: any) {
      if (err?.code === 'P2002') throw new ConflictError('A package with this name already exists');
      throw err;
    }
  }

  async update(id: string, input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const existing = await this.getById(id, tenantId);
    const pkg = await prisma.ptPackage.update({
      where: { id },
      data: {
        name: input.name ?? existing.name,
        description: input.description ?? existing.description,
        totalSessions: input.totalSessions ?? existing.totalSessions,
        price: input.price ?? existing.price,
        validityDays: input.validityDays ?? existing.validityDays,
        gymId: input.gymId !== undefined ? input.gymId || null : existing.gymId,
        isActive: input.isActive ?? existing.isActive,
      },
    });
    await publishBillingEvent('pt.package.updated', { packageId: id, changes: Object.keys(input) }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'UPDATE', entityType: 'pt_package', entityId: id, description: `Updated PT package: ${pkg.name}` });
    return pkg;
  }
}

export const ptPackageService = new PtPackageService();

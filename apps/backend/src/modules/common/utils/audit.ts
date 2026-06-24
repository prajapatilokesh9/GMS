import { getPrisma } from '../../../database/prisma.service';

export interface AuditLogInput {
  tenantId?: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  description?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
  metadata?: unknown;
}

export class AuditService {
  async log(input: AuditLogInput): Promise<void> {
    const prisma = getPrisma();
    await prisma.auditLog.create({
      data: {
        tenantId: input.tenantId || null,
        userId: input.userId || null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || null,
        description: input.description,
        oldValue: input.oldValue as any,
        newValue: input.newValue as any,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        metadata: input.metadata as any,
      },
    });
  }

  async findByTenant(
    tenantId: string,
    options?: {
      userId?: string;
      action?: string;
      entityType?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const prisma = getPrisma();
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (options?.userId) where.userId = options.userId;
    if (options?.action) where.action = options.action;
    if (options?.entityType) where.entityType = options.entityType;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export const auditService = new AuditService();

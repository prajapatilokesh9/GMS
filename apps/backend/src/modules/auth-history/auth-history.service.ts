import { getPrisma } from '../../database/prisma.service';

export type LoginEventType = 'LOGIN' | 'LOGOUT' | 'FAILED';

export interface LoginHistoryInput {
  tenantId: string;
  userId: string;
  eventType: LoginEventType;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export class AuthHistoryService {
  async log(input: LoginHistoryInput): Promise<void> {
    const prisma = getPrisma();
    await prisma.loginHistory.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        eventType: input.eventType,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
        metadata: (input.metadata || {}) as any,
      },
    });
  }

  async findByUser(userId: string, tenantId: string, page = 1, limit = 20) {
    const prisma = getPrisma();
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      prisma.loginHistory.findMany({
        where: { userId, tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.loginHistory.count({ where: { userId, tenantId } }),
    ]);

    return {
      entries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export const authHistoryService = new AuthHistoryService();

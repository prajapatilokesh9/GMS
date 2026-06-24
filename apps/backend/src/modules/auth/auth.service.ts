import crypto from 'crypto';
import { getPrisma } from '../../database/prisma.service';
import { hashPassword, comparePassword } from '../common/utils/crypto';
import { generateTokenPair, verifyRefreshToken } from '../common/utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../common/errors/AppError';
import { authHistoryService } from '../auth-history/auth-history.service';
import { publishUserRegisteredEvent, publishUserLoggedInEvent, publishPasswordResetEvent } from '../../events/producers/authEvents';
import type { RegisterInput, LoginInput } from './auth.validation';

export class AuthService {
  async register(input: RegisterInput) {
    const prisma = getPrisma();

    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const tenant = input.tenantSlug
      ? await prisma.tenant.findUnique({ where: { slug: input.tenantSlug } })
      : await prisma.tenant.findFirst({ where: { isActive: true } });

    if (!tenant) {
      throw new NotFoundError('Tenant');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
    });

    const customerRole = await prisma.role.findFirst({
      where: { tenantId: tenant.id, slug: 'customer' },
    });

    if (customerRole) {
      await prisma.userRole.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          roleId: customerRole.id,
        },
      });
    }

    const tokenPayload = { userId: user.id, tenantId: tenant.id, roles: [customerRole?.slug || 'customer'] };
    const tokens = generateTokenPair(tokenPayload);

    if (customerRole) {
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });
    }

    await publishUserRegisteredEvent(user.id, input.email, tenant.id).catch(() => {});

    return { user: this.sanitizeUser(user), tokens, tenant };
  }

  async login(input: LoginInput, context?: { ipAddress?: string; userAgent?: string }) {
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      await authHistoryService.log({
        tenantId: user.tenantId,
        userId: user.id,
        eventType: 'FAILED',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      }).catch(() => {});
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: true },
    });

    const roleSlugs = userRoles.map((ur) => ur.role.slug);
    const tokenPayload = { userId: user.id, tenantId: user.tenantId, roles: roleSlugs };
    const tokens = generateTokenPair(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), refreshToken: tokens.refreshToken },
    });

    await Promise.allSettled([
      publishUserLoggedInEvent(user.id, user.tenantId),
      authHistoryService.log({
        tenantId: user.tenantId,
        userId: user.id,
        eventType: 'LOGIN',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      }),
    ]);

    return { user: this.sanitizeUser(user), tokens };
  }

  async refreshToken(token: string) {
    const prisma = getPrisma();

    let payload: { userId: string; tenantId: string };
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.refreshToken !== token) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: true },
    });

    const roleSlugs = userRoles.map((ur) => ur.role.slug);
    const tokenPayload = { userId: user.id, tenantId: user.tenantId, roles: roleSlugs };
    const tokens = generateTokenPair(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return { tokens };
  }

  async forgotPassword(email: string) {
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await publishPasswordResetEvent(user.id, email, user.tenantId).catch(() => {});
  }

  async resetPassword(token: string, password: string) {
    const prisma = getPrisma();

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken) {
      throw new UnauthorizedError('Invalid reset token');
    }

    if (resetToken.usedAt) {
      throw new UnauthorizedError('Reset token already used');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Reset token has expired');
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);
  }

  private sanitizeUser(user: any) {
    const { passwordHash, refreshToken, ...sanitized } = user;
    return sanitized;
  }
}

export const authService = new AuthService();

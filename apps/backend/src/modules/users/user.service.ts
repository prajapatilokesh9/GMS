import { getPrisma } from '../../database/prisma.service';
import { hashPassword, comparePassword } from '../common/utils/crypto';
import { ConflictError, NotFoundError, UnauthorizedError } from '../common/errors/AppError';
import type { CreateUserInput, UpdateUserInput, UpdateProfileInput, ChangePasswordInput } from './user.validation';

export class UserService {
  async create(input: CreateUserInput, tenantId: string) {
    const prisma = getPrisma();

    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictError('Email already registered');

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        tenantId,
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
    });

    if (input.roleSlug) {
      const role = await prisma.role.findFirst({
        where: { tenantId, slug: input.roleSlug },
      });
      if (role) {
        await prisma.userRole.create({
          data: { tenantId, userId: user.id, roleId: role.id },
        });
      }
    }

    return this.sanitize(user);
  }

  async findById(id: string, tenantId: string) {
    const prisma = getPrisma();
    const user = await prisma.user.findFirst({
      where: { id, tenantId },
      include: {
        userRoles: { include: { role: true } },
      },
    });
    if (!user) throw new NotFoundError('User');
    return this.sanitize(user);
  }

  async findByEmail(email: string, tenantId: string) {
    const prisma = getPrisma();
    const user = await prisma.user.findFirst({
      where: { email, tenantId },
    });
    return user ? this.sanitize(user) : null;
  }

  async update(id: string, tenantId: string, input: UpdateUserInput) {
    const prisma = getPrisma();
    const user = await prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundError('User');

    const updated = await prisma.user.update({
      where: { id },
      data: input,
    });
    return this.sanitize(updated);
  }

  async findByTenant(tenantId: string, page = 1, limit = 20) {
    const prisma = getPrisma();
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { tenantId },
        skip,
        take: limit,
        include: { userRoles: { include: { role: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: { tenantId } }),
    ]);

    return {
      users: users.map((u) => this.sanitize(u)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateProfile(userId: string, tenantId: string, input: UpdateProfileInput) {
    const prisma = getPrisma();
    const user = await prisma.user.findFirst({ where: { id: userId, tenantId } });
    if (!user) throw new NotFoundError('User');

    const updated = await prisma.user.update({
      where: { id: userId },
      data: input,
    });
    return this.sanitize(updated);
  }

  async changePassword(userId: string, tenantId: string, input: ChangePasswordInput) {
    const prisma = getPrisma();
    const user = await prisma.user.findFirst({ where: { id: userId, tenantId } });
    if (!user) throw new NotFoundError('User');

    const valid = await comparePassword(input.oldPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Current password is incorrect');

    const passwordHash = await hashPassword(input.newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  private sanitize(user: any) {
    const { passwordHash, refreshToken, ...rest } = user;
    return rest;
  }
}

export const userService = new UserService();

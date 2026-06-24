import { getPrisma } from '../../database/prisma.service';
import { ConflictError, NotFoundError } from '../common/errors/AppError';
import type { CreateRoleInput } from './role.validation';

export class RoleService {
  async create(input: CreateRoleInput, tenantId?: string) {
    const prisma = getPrisma();

    if (tenantId) {
      const existing = await prisma.role.findFirst({
        where: { tenantId, slug: input.slug },
      });
      if (existing) throw new ConflictError('Role with this slug already exists in this tenant');
    }

    return prisma.role.create({
      data: {
        tenantId: tenantId || null,
        name: input.name,
        slug: input.slug,
        description: input.description,
        dataScope: input.dataScope || 'TENANT',
        priority: input.priority || 0,
      },
    });
  }

  async findById(id: string, tenantId?: string) {
    const prisma = getPrisma();
    const role = await prisma.role.findFirst({
      where: {
        id,
        OR: [
          { tenantId: tenantId || undefined },
          { tenantId: null },
        ],
      },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });
    if (!role) throw new NotFoundError('Role');
    return role;
  }

  async findByTenant(tenantId: string) {
    const prisma = getPrisma();
    return prisma.role.findMany({
      where: {
        OR: [
          { tenantId },
          { tenantId: null },
        ],
      },
      orderBy: { priority: 'asc' },
    });
  }

  async assignRole(userId: string, roleId: string, tenantId: string, gymId?: string) {
    const prisma = getPrisma();

    const existing = await prisma.userRole.findFirst({
      where: { userId, roleId, gymId: gymId || null },
    });
    if (existing) throw new ConflictError('User already has this role');

    return prisma.userRole.create({
      data: { tenantId, userId, roleId, gymId: gymId || null },
      include: { role: true, user: true },
    });
  }

  async removeRole(userRoleId: string) {
    const prisma = getPrisma();
    const userRole = await prisma.userRole.findUnique({ where: { id: userRoleId } });
    if (!userRole) throw new NotFoundError('UserRole');
    await prisma.userRole.delete({ where: { id: userRoleId } });
  }

  async getUserRoles(userId: string, tenantId: string) {
    const prisma = getPrisma();
    return prisma.userRole.findMany({
      where: { userId, tenantId },
      include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
    });
  }

  async getUserPermissions(userId: string, tenantId: string): Promise<string[]> {
    const userRoles = await this.getUserRoles(userId, tenantId);
    const permissionSet = new Set<string>();

    for (const ur of userRoles) {
      for (const rp of ur.role.rolePermissions) {
        permissionSet.add(rp.permission.name);
      }
    }

    return Array.from(permissionSet);
  }

  async assignPermission(roleId: string, permissionId: string) {
    const prisma = getPrisma();
    const existing = await prisma.rolePermission.findFirst({
      where: { roleId, permissionId },
    });
    if (existing) throw new ConflictError('Permission already assigned to this role');

    return prisma.rolePermission.create({
      data: { roleId, permissionId },
      include: { permission: true },
    });
  }

  async removePermission(roleId: string, permissionId: string) {
    const prisma = getPrisma();
    const rp = await prisma.rolePermission.findFirst({
      where: { roleId, permissionId },
    });
    if (!rp) throw new NotFoundError('RolePermission');
    await prisma.rolePermission.delete({ where: { id: rp.id } });
  }
}

export const roleService = new RoleService();

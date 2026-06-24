import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  dataScope: z.enum(['GLOBAL', 'TENANT', 'GYM', 'SELF']).optional().default('TENANT'),
  priority: z.number().int().min(0).optional().default(0),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  dataScope: z.enum(['GLOBAL', 'TENANT', 'GYM', 'SELF']).optional(),
  priority: z.number().int().min(0).optional(),
});

export const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
  gymId: z.string().uuid().optional(),
});

export const assignPermissionSchema = z.object({
  permissionId: z.string().uuid(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;

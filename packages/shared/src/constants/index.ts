export const ROLES = {
  SUPER_ADMIN: 'super_admin' as const,
  PLATFORM_ADMIN: 'platform_admin' as const,
  GYM_OWNER: 'gym_owner' as const,
  GYM_ADMIN: 'gym_admin' as const,
  TRAINER: 'trainer' as const,
  NUTRITIONIST: 'nutritionist' as const,
  STAFF: 'staff' as const,
  CUSTOMER: 'customer' as const,
  GUEST: 'guest' as const,
} as const;

export const PERMISSIONS = {
  // Tenant
  TENANT_READ: 'tenant:read',
  TENANT_UPDATE: 'tenant:update',
  TENANT_DELETE: 'tenant:delete',

  // User
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Role
  ROLE_CREATE: 'role:create',
  ROLE_READ: 'role:read',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',

  // Permission
  PERMISSION_READ: 'permission:read',
  PERMISSION_ASSIGN: 'permission:assign',

  // Gym
  GYM_CREATE: 'gym:create',
  GYM_READ: 'gym:read',
  GYM_UPDATE: 'gym:update',
  GYM_DELETE: 'gym:delete',

  // Membership
  MEMBERSHIP_CREATE: 'membership:create',
  MEMBERSHIP_READ: 'membership:read',
  MEMBERSHIP_UPDATE: 'membership:update',
  MEMBERSHIP_DELETE: 'membership:delete',

  // Audit
  AUDIT_READ: 'audit:read',
  AUDIT_EXPORT: 'audit:export',

  // Settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',
} as const;

export const DATA_SCOPES = {
  GLOBAL: 'GLOBAL',
  TENANT: 'TENANT',
  GYM: 'GYM',
  SELF: 'SELF',
} as const;

export const EVENT_CATEGORIES = {
  AUTH: 'auth',
  USER: 'user',
  GYM: 'gym',
  ROLE: 'role',
  MEMBERSHIP: 'membership',
  PAYMENT: 'payment',
  TRAINER: 'trainer',
  WORKOUT: 'workout',
  NOTIFICATION: 'notification',
  AUDIT: 'audit',
  SYSTEM: 'system',
} as const;

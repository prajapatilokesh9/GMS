export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  pagination?: IPaginatedResponse<unknown>['pagination'];
}

export interface IRequestWithTenant {
  tenantId: string;
  userId: string;
  userRoles: string[];
}

export type RoleSlug = 'super_admin' | 'platform_admin' | 'gym_owner' | 'gym_admin' | 'trainer' | 'nutritionist' | 'staff' | 'customer' | 'guest';

export type EntityType = 'user' | 'role' | 'permission' | 'gym' | 'tenant' | 'membership' | 'payment' | 'session' | 'workout' | 'diet_plan' | 'supplement' | 'equipment';

export type ActionType = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT' | 'APPROVE' | 'REJECT';

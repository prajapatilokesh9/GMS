import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/AppError';

export function authorize(...allowedPermissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }

    if (!allowedPermissions || allowedPermissions.length === 0) {
      next();
      return;
    }

    const userPermissions = (req as any).permissions || [];
    const hasPermission = allowedPermissions.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
}

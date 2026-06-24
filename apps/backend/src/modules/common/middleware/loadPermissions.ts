import { Request, Response, NextFunction } from 'express';
import { roleService } from '../../roles/role.service';

export async function loadPermissions(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    next();
    return;
  }

  try {
    const permissions = await roleService.getUserPermissions(req.user.userId, req.user.tenantId);
    (req as any).permissions = permissions;
  } catch {
    (req as any).permissions = [];
  }

  next();
}

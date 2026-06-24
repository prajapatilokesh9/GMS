import { Request, Response, NextFunction } from 'express';
import logger from '../../../core/logger';

export function tenantContext(req: Request, _res: Response, next: NextFunction): void {
  const tenantId = req.headers['x-tenant-id'] as string || req.user?.tenantId;

  if (tenantId) {
    (req as any).tenantId = tenantId;
    logger.debug(`Tenant context: ${tenantId}`);
  }

  next();
}

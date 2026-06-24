import type { Request, Response, NextFunction } from 'express';
import { ptPackageService } from './ptPackage.service';
import { HttpStatusCode } from '../common/errors/HttpStatusCode';

export class PtPackageController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { gymId, isActive } = req.query as any;
      const data = await ptPackageService.list(req.user!.tenantId, {
        gymId,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ptPackageService.getById(req.params.id, req.user!.tenantId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ptPackageService.create(req.body, req.user!.tenantId, req.user!.userId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ptPackageService.update(req.params.id, req.body, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
}

export const ptPackageController = new PtPackageController();

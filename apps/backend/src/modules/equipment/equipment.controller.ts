import type { Request, Response, NextFunction } from 'express';
import { equipmentService } from './equipment.service';
import { HttpStatusCode } from '../common/errors/HttpStatusCode';

export class EquipmentController {
  async listCatalogue(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, brand, isActive, includeInactive } = req.query as any;
      const data = await equipmentService.listCatalogue(req.user!.tenantId, {
        category, brand,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        includeInactive: includeInactive === 'true',
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getCatalogue(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await equipmentService.getCatalogue(req.params.id, req.user!.tenantId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async createCatalogue(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await equipmentService.createCatalogue(req.body, req.user!.tenantId, req.user!.userId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async updateCatalogue(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await equipmentService.updateCatalogue(req.params.id, req.body, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async deleteCatalogue(req: Request, res: Response, next: NextFunction) {
    try {
      await equipmentService.deleteCatalogue(req.params.id, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data: null });
    } catch (err) { next(err); }
  }

  async restoreCatalogue(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await equipmentService.restoreCatalogue(req.params.id, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
}

export const equipmentController = new EquipmentController();

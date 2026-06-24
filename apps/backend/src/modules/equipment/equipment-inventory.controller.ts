import type { Request, Response, NextFunction } from 'express';
import { equipmentInventoryService } from './equipment-inventory.service';
import { HttpStatusCode } from '../common/errors/HttpStatusCode';

export class EquipmentInventoryController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { gymId, catalogueItemId, status, includeInactive } = req.query as any;
      const data = await equipmentInventoryService.list(req.user!.tenantId, {
        gymId, catalogueItemId, status,
        includeInactive: includeInactive === 'true',
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await equipmentInventoryService.getById(req.params.id, req.user!.tenantId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await equipmentInventoryService.create(req.body, req.user!.tenantId, req.user!.userId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await equipmentInventoryService.update(req.params.id, req.body, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await equipmentInventoryService.delete(req.params.id, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data: null });
    } catch (err) { next(err); }
  }

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await equipmentInventoryService.restore(req.params.id, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
}

export const equipmentInventoryController = new EquipmentInventoryController();

import type { Request, Response, NextFunction } from 'express';
import { equipmentMaintenanceService } from './equipment-maintenance.service';
import { HttpStatusCode } from '../common/errors/HttpStatusCode';

export class EquipmentMaintenanceController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, inventoryId, assignedTo, type, scheduledDateFrom, scheduledDateTo, includeInactive } = req.query as any;
      const data = await equipmentMaintenanceService.list(req.user!.tenantId, {
        status, inventoryId, assignedTo, type, scheduledDateFrom, scheduledDateTo,
        includeInactive: includeInactive === 'true',
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await equipmentMaintenanceService.getById(req.params.id, req.user!.tenantId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await equipmentMaintenanceService.create(req.body, req.user!.tenantId, req.user!.userId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await equipmentMaintenanceService.update(req.params.id, req.body, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await equipmentMaintenanceService.delete(req.params.id, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data: null });
    } catch (err) { next(err); }
  }

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await equipmentMaintenanceService.restore(req.params.id, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
}

export const equipmentMaintenanceController = new EquipmentMaintenanceController();

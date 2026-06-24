import type { Request, Response, NextFunction } from 'express';
import { trainerService } from './trainer.service';
import { HttpStatusCode } from '../common/errors/HttpStatusCode';

export class TrainerController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { gymId, isActive } = req.query as any;
      const data = await trainerService.list(req.user!.tenantId, {
        gymId,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await trainerService.getById(req.params.id, req.user!.tenantId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await trainerService.create(req.body, req.user!.tenantId, req.user!.userId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await trainerService.update(req.params.id, req.body, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
}

export const trainerController = new TrainerController();

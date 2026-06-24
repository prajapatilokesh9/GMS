import type { Request, Response, NextFunction } from 'express';
import { ptSessionService } from './ptSession.service';
import { HttpStatusCode } from '../common/errors/HttpStatusCode';

export class PtSessionController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { trainerId, clientId, status, gymId } = req.query as any;
      const data = await ptSessionService.list(req.user!.tenantId, { trainerId, clientId, status, gymId });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ptSessionService.getById(req.params.id, req.user!.tenantId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ptSessionService.create(req.body, req.user!.tenantId, req.user!.userId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ptSessionService.update(req.params.id, req.body, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ptSessionService.transitionStatus(req.params.id, 'checked_in', req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ptSessionService.transitionStatus(req.params.id, 'completed', req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ptSessionService.transitionStatus(req.params.id, 'cancelled', req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
}

export const ptSessionController = new PtSessionController();

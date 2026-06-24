import type { Request, Response, NextFunction } from 'express';
import { commissionService } from './commission.service';
import { HttpStatusCode } from '../common/errors/HttpStatusCode';

export class CommissionController {
  async listRules(req: Request, res: Response, next: NextFunction) {
    try {
      const { gymId, trainerId, status } = req.query as any;
      const data = await commissionService.listRules(req.user!.tenantId, { gymId, trainerId, status });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getRuleById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await commissionService.getRuleById(req.params.id, req.user!.tenantId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async createRule(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await commissionService.createRule(req.body, req.user!.tenantId, req.user!.userId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async updateRule(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await commissionService.updateRule(req.params.id, req.body, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async activateRule(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await commissionService.activateRule(req.params.id, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async deactivateRule(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await commissionService.deactivateRule(req.params.id, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async listPayouts(req: Request, res: Response, next: NextFunction) {
    try {
      const { trainerId, payoutStatus } = req.query as any;
      const data = await commissionService.listPayouts(req.user!.tenantId, { trainerId, payoutStatus });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getPayoutById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await commissionService.getPayoutById(req.params.id, req.user!.tenantId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async generatePayout(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await commissionService.generatePayout(req.body, req.user!.tenantId, req.user!.userId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async approvePayout(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await commissionService.approvePayout(req.params.id, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async markPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await commissionService.markPaid(req.params.id, req.body, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
}

export const commissionController = new CommissionController();

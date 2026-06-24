import { Request, Response, NextFunction } from 'express';
import { authHistoryService } from './auth-history.service';

export class AuthHistoryController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const tenantId = req.user!.tenantId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await authHistoryService.findByUser(userId, tenantId, page, limit);
      res.json({ success: true, data: result.entries, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  }
}

export const authHistoryController = new AuthHistoryController();

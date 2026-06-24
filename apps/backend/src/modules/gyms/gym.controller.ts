import { Request, Response, NextFunction } from 'express';
import { gymService } from './gym.service';
import { HttpStatusCode } from '../common/errors/HttpStatusCode';

export class GymController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const ownerId = req.user!.userId;
      const result = await gymService.create(req.body, tenantId, ownerId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const result = await gymService.findById(req.params.id, tenantId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const result = await gymService.update(req.params.id, tenantId, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await gymService.findByTenant(tenantId, page, limit);
      res.json({ success: true, data: result.gyms, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  }

  async myGyms(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const ownerId = req.user!.userId;
      const result = await gymService.findByOwner(ownerId, tenantId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async verifyGym(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const verifiedBy = req.user!.userId;
      const { onboardingStatus, rejectionReason } = req.body;
      const result = await gymService.updateOnboardingStatus(
        req.params.id,
        tenantId,
        onboardingStatus,
        rejectionReason,
        verifiedBy,
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async addStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const { userId, roleId } = req.body;
      const result = await gymService.addStaff(req.params.id, userId, roleId, tenantId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async listStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const result = await gymService.listStaff(req.params.id, tenantId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async removeStaff(req: Request, res: Response, next: NextFunction) {
    try {
      await gymService.removeStaff(req.params.userRoleId, req.user!.tenantId, req.params.id);
      res.status(HttpStatusCode.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  }
}

export const gymController = new GymController();

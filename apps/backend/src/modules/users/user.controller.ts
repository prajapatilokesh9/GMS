import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { HttpStatusCode } from '../common/errors/HttpStatusCode';

export class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const result = await userService.create(req.body, tenantId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const result = await userService.findById(req.params.id, tenantId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const result = await userService.update(req.params.id, tenantId, req.body);
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
      const result = await userService.findByTenant(tenantId, page, limit);
      res.json({ success: true, data: result.users, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const result = await userService.findById(req.user!.userId, tenantId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const result = await userService.updateProfile(req.user!.userId, tenantId, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      await userService.changePassword(req.user!.userId, tenantId, req.body);
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();

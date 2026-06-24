import { Request, Response, NextFunction } from 'express';
import { roleService } from './role.service';
import { HttpStatusCode } from '../common/errors/HttpStatusCode';

export class RoleController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const result = await roleService.create(req.body, tenantId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const result = await roleService.findById(req.params.id, tenantId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const result = await roleService.findByTenant(tenantId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async assignRole(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const result = await roleService.assignRole(req.body.userId, req.body.roleId, tenantId, req.body.gymId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async removeRole(req: Request, res: Response, next: NextFunction) {
    try {
      await roleService.removeRole(req.params.id);
      res.status(HttpStatusCode.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  }

  async assignPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await roleService.assignPermission(req.params.roleId, req.body.permissionId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async removePermission(req: Request, res: Response, next: NextFunction) {
    try {
      await roleService.removePermission(req.params.roleId, req.params.permissionId);
      res.status(HttpStatusCode.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  }

  async myPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const tenantId = req.user!.tenantId;
      const permissions = await roleService.getUserPermissions(userId, tenantId);
      res.json({ success: true, data: permissions });
    } catch (err) {
      next(err);
    }
  }
}

export const roleController = new RoleController();

import type { Request, Response, NextFunction } from 'express';
import { supplementService } from './supplement.service';
import { HttpStatusCode } from '../common/errors/HttpStatusCode';

export class SupplementController {
  // ==================== COMPANIES ====================

  async listCompanies(req: Request, res: Response, next: NextFunction) {
    try {
      const { isActive } = req.query as any;
      const data = await supplementService.listCompanies(req.user!.tenantId, { isActive: isActive !== undefined ? isActive === 'true' : undefined });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await supplementService.getCompany(req.params.id, req.user!.tenantId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async createCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await supplementService.createCompany(req.body, req.user!.tenantId, req.user!.userId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async updateCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await supplementService.updateCompany(req.params.id, req.body, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  // ==================== SUPPLEMENTS ====================

  async listSupplements(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, category, isActive } = req.query as any;
      const data = await supplementService.listSupplements(req.user!.tenantId, {
        companyId, category,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getSupplement(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await supplementService.getSupplement(req.params.id, req.user!.tenantId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async createSupplement(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await supplementService.createSupplement(req.body, req.user!.tenantId, req.user!.userId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async updateSupplement(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await supplementService.updateSupplement(req.params.id, req.body, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  // ==================== ORDERS ====================

  async listOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { gymId, status } = req.query as any;
      const data = await supplementService.listOrders(req.user!.tenantId, { gymId, status, userId: req.user!.userId });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await supplementService.getOrder(req.params.id, req.user!.tenantId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await supplementService.createOrder(req.body, req.user!.tenantId, req.user!.userId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async updateOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await supplementService.updateOrder(req.params.id, req.body, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
}

export const supplementController = new SupplementController();

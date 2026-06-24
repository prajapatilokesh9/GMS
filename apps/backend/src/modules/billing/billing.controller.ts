import type { Request, Response, NextFunction } from 'express';
import { billingService } from './billing.service';
import { HttpStatusCode } from '../common/errors/HttpStatusCode';

export class BillingController {
  // ==================== PLANS ====================

  async listPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const { gymId } = req.params;
      const result = await billingService.listPlans(gymId, req.user!.tenantId, { page: req.query.page as string, limit: req.query.limit as string });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (err) { next(err); }
  }

  async getPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await billingService.getPlan(req.params.id, req.user!.tenantId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async createPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { gymId } = req.params;
      const data = await billingService.createPlan(req.body, req.user!.tenantId, gymId, req.user!.userId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async updatePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await billingService.updatePlan(req.params.id, req.body, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  // ==================== MEMBERSHIPS ====================

  async listMemberships(req: Request, res: Response, next: NextFunction) {
    try {
      const { gymId } = req.params;
      const { status, customerId } = req.query as any;
      const result = await billingService.listMemberships(gymId, req.user!.tenantId, { status, customerId, page: req.query.page as string, limit: req.query.limit as string });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (err) { next(err); }
  }

  async getMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await billingService.getMembership(req.params.id, req.user!.tenantId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async createMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const { gymId } = req.params;
      const data = await billingService.createMembership(req.body, req.user!.tenantId, gymId, req.body.customerId || req.user!.userId, req.user!.userId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async updateMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await billingService.updateMembership(req.params.id, req.body, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async renewMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await billingService.renewMembership(req.params.id, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  // ==================== WALLET ====================

  async topUpWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await billingService.topUpWallet(req.params.id, req.body, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  // ==================== PAYMENTS ====================

  async createPaymentIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await billingService.createPaymentIntent(req.body, req.user!.tenantId, req.user!.userId);
      res.status(HttpStatusCode.CREATED).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async confirmPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await billingService.confirmPayment(req.body, req.user!.tenantId, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await billingService.getPayment(req.params.id, req.user!.tenantId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async listPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { entityType, status } = req.query as any;
      const result = await billingService.listPayments(req.user!.tenantId, { entityType, status, page: req.query.page as string, limit: req.query.limit as string });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (err) { next(err); }
  }

  // ==================== WEBHOOKS ====================

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const provider = req.params.provider || 'razorpay';
      const data = await billingService.handlePaymentWebhook(req.body, provider);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
}

export const billingController = new BillingController();
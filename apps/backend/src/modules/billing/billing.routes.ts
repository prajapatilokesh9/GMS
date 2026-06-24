import { Router } from 'express';
import { billingController } from './billing.controller';
import { authenticate } from '../common/middleware/authenticate';
import { authorize } from '../common/middleware/authorize';
import { loadPermissions } from '../common/middleware/loadPermissions';
import { validate } from '../common/middleware/validate';
import {
  createPlanSchema, updatePlanSchema,
  createMembershipSchema, updateMembershipSchema,
  walletTopupSchema, createPaymentIntentSchema, confirmPaymentSchema,
} from './billing.validation';
import rateLimit from 'express-rate-limit';

const router = Router();

const billingMutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many billing requests, please try again later' } },
});

// Public webhook (no auth — signature verified in service)
router.post('/webhooks/:provider', (req, res, next) => billingController.handleWebhook(req, res, next));

// All routes below require auth
router.use(authenticate);
router.use(loadPermissions);

// ---- Plans ----
router.get('/gyms/:gymId/plans', authorize('plan:read'), (req, res, next) => billingController.listPlans(req, res, next));
router.get('/plans/:id', authorize('plan:read'), (req, res, next) => billingController.getPlan(req, res, next));
router.post('/gyms/:gymId/plans', billingMutationLimiter, authorize('plan:create'), validate(createPlanSchema), (req, res, next) => billingController.createPlan(req, res, next));
router.patch('/plans/:id', billingMutationLimiter, authorize('plan:update'), validate(updatePlanSchema), (req, res, next) => billingController.updatePlan(req, res, next));

// ---- Memberships ----
router.get('/gyms/:gymId/memberships', authorize('membership:read'), (req, res, next) => billingController.listMemberships(req, res, next));
router.get('/memberships/:id', authorize('membership:read'), (req, res, next) => billingController.getMembership(req, res, next));
router.post('/gyms/:gymId/memberships', billingMutationLimiter, authorize('payment:write'), validate(createMembershipSchema), (req, res, next) => billingController.createMembership(req, res, next));
router.patch('/memberships/:id', billingMutationLimiter, authorize('payment:write'), validate(updateMembershipSchema), (req, res, next) => billingController.updateMembership(req, res, next));
router.post('/memberships/:id/renew', billingMutationLimiter, authorize('payment:write'), (req, res, next) => billingController.renewMembership(req, res, next));

// ---- Wallet ----
router.post('/memberships/:id/wallet/topup', billingMutationLimiter, authorize('payment:write'), validate(walletTopupSchema), (req, res, next) => billingController.topUpWallet(req, res, next));

// ---- Payments ----
router.post('/payments/create-intent', billingMutationLimiter, authorize('payment:write'), validate(createPaymentIntentSchema), (req, res, next) => billingController.createPaymentIntent(req, res, next));
router.post('/payments/confirm', billingMutationLimiter, authorize('payment:write'), validate(confirmPaymentSchema), (req, res, next) => billingController.confirmPayment(req, res, next));
router.get('/payments/:id', authorize('payment:read'), (req, res, next) => billingController.getPayment(req, res, next));
router.get('/payments', authorize('payment:read'), (req, res, next) => billingController.listPayments(req, res, next));

export default router;
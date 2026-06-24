import { Router } from 'express';
import { commissionController } from './commission.controller';
import { authenticate } from '../common/middleware/authenticate';
import { authorize } from '../common/middleware/authorize';
import { loadPermissions } from '../common/middleware/loadPermissions';
import { validate } from '../common/middleware/validate';
import {
  createCommissionRuleSchema,
  updateCommissionRuleSchema,
  generateCommissionPayoutSchema,
} from './commission.validation';

const router = Router();

router.use(authenticate);
router.use(loadPermissions);

// Commission Rules
router.get('/rules', authorize('commission:read'), (req, res, next) => commissionController.listRules(req, res, next));
router.post('/rules', authorize('commission:manage'), validate(createCommissionRuleSchema), (req, res, next) => commissionController.createRule(req, res, next));
router.get('/rules/:id', authorize('commission:read'), (req, res, next) => commissionController.getRuleById(req, res, next));
router.patch('/rules/:id', authorize('commission:manage'), validate(updateCommissionRuleSchema), (req, res, next) => commissionController.updateRule(req, res, next));
router.post('/rules/:id/activate', authorize('commission:manage'), (req, res, next) => commissionController.activateRule(req, res, next));
router.post('/rules/:id/deactivate', authorize('commission:manage'), (req, res, next) => commissionController.deactivateRule(req, res, next));

// Commission Payouts
router.get('/payouts', authorize('commission:read'), (req, res, next) => commissionController.listPayouts(req, res, next));
router.get('/payouts/:id', authorize('commission:read'), (req, res, next) => commissionController.getPayoutById(req, res, next));
router.post('/payouts/generate', authorize('commission:manage'), validate(generateCommissionPayoutSchema), (req, res, next) => commissionController.generatePayout(req, res, next));
router.post('/payouts/:id/approve', authorize('commission:manage'), (req, res, next) => commissionController.approvePayout(req, res, next));
router.post('/payouts/:id/mark-paid', authorize('commission:manage'), (req, res, next) => commissionController.markPaid(req, res, next));

export default router;

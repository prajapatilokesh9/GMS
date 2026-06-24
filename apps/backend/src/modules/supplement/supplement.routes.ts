import { Router } from 'express';
import { supplementController } from './supplement.controller';
import { authenticate } from '../common/middleware/authenticate';
import { authorize } from '../common/middleware/authorize';
import { loadPermissions } from '../common/middleware/loadPermissions';
import { validate } from '../common/middleware/validate';
import {
  createCompanySchema, updateCompanySchema,
  createSupplementSchema, updateSupplementSchema,
  createOrderSchema, updateOrderSchema,
} from './supplement.validation';

const router = Router();

router.use(authenticate);
router.use(loadPermissions);

// ---- Companies ----
router.get('/companies', (req, res, next) => supplementController.listCompanies(req, res, next));
router.get('/companies/:id', (req, res, next) => supplementController.getCompany(req, res, next));
router.post('/companies', authorize('supplement:manage'), validate(createCompanySchema), (req, res, next) => supplementController.createCompany(req, res, next));
router.patch('/companies/:id', authorize('supplement:manage'), validate(updateCompanySchema), (req, res, next) => supplementController.updateCompany(req, res, next));

// ---- Orders (must be before /:id wildcard) ----
router.get('/orders', authorize('supplement:order'), (req, res, next) => supplementController.listOrders(req, res, next));
router.get('/orders/:id', authorize('supplement:order'), (req, res, next) => supplementController.getOrder(req, res, next));
router.post('/orders', authorize('supplement:order'), validate(createOrderSchema), (req, res, next) => supplementController.createOrder(req, res, next));
router.patch('/orders/:id', authorize('supplement:order'), validate(updateOrderSchema), (req, res, next) => supplementController.updateOrder(req, res, next));

// ---- Supplements ----
router.get('/', authorize('supplement:read'), (req, res, next) => supplementController.listSupplements(req, res, next));
router.post('/', authorize('supplement:manage'), validate(createSupplementSchema), (req, res, next) => supplementController.createSupplement(req, res, next));
router.get('/:id', authorize('supplement:read'), (req, res, next) => supplementController.getSupplement(req, res, next));
router.patch('/:id', authorize('supplement:manage'), validate(updateSupplementSchema), (req, res, next) => supplementController.updateSupplement(req, res, next));

export default router;

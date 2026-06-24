import { Router } from 'express';
import { ptSessionController } from './ptSession.controller';
import { authenticate } from '../common/middleware/authenticate';
import { authorize } from '../common/middleware/authorize';
import { loadPermissions } from '../common/middleware/loadPermissions';
import { validate } from '../common/middleware/validate';
import { createPtSessionSchema, updatePtSessionSchema } from './ptSession.validation';

const router = Router();

router.use(authenticate);
router.use(loadPermissions);

router.get('/', authorize('session:read'), (req, res, next) => ptSessionController.list(req, res, next));
router.post('/', authorize('session:manage'), validate(createPtSessionSchema), (req, res, next) => ptSessionController.create(req, res, next));
router.get('/:id', authorize('session:read'), (req, res, next) => ptSessionController.getById(req, res, next));
router.patch('/:id', authorize('session:manage'), validate(updatePtSessionSchema), (req, res, next) => ptSessionController.update(req, res, next));
router.post('/:id/check-in', authorize('session:manage'), (req, res, next) => ptSessionController.checkIn(req, res, next));
router.post('/:id/complete', authorize('session:manage'), (req, res, next) => ptSessionController.complete(req, res, next));
router.post('/:id/cancel', authorize('session:manage'), (req, res, next) => ptSessionController.cancel(req, res, next));

export default router;

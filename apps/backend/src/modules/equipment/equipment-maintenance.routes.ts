import { Router } from 'express';
import { equipmentMaintenanceController } from './equipment-maintenance.controller';
import { authenticate } from '../common/middleware/authenticate';
import { authorize } from '../common/middleware/authorize';
import { loadPermissions } from '../common/middleware/loadPermissions';
import { validate } from '../common/middleware/validate';
import { createMaintenanceSchema, updateMaintenanceSchema } from './equipment-maintenance.validation';

const router = Router();

router.use(authenticate);
router.use(loadPermissions);

router.get('/maintenance-jobs', authorize('equipment:read'), (req, res, next) => equipmentMaintenanceController.list(req, res, next));
router.get('/maintenance-jobs/:id', authorize('equipment:read'), (req, res, next) => equipmentMaintenanceController.getById(req, res, next));
router.post('/maintenance-jobs', authorize('equipment:manage'), validate(createMaintenanceSchema), (req, res, next) => equipmentMaintenanceController.create(req, res, next));
router.patch('/maintenance-jobs/:id', authorize('equipment:manage'), validate(updateMaintenanceSchema), (req, res, next) => equipmentMaintenanceController.update(req, res, next));
router.delete('/maintenance-jobs/:id', authorize('equipment:manage'), (req, res, next) => equipmentMaintenanceController.delete(req, res, next));
router.post('/maintenance-jobs/:id/restore', authorize('equipment:manage'), (req, res, next) => equipmentMaintenanceController.restore(req, res, next));

export default router;

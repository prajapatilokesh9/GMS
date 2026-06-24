import { Router } from 'express';
import { equipmentInventoryController } from './equipment-inventory.controller';
import { authenticate } from '../common/middleware/authenticate';
import { authorize } from '../common/middleware/authorize';
import { loadPermissions } from '../common/middleware/loadPermissions';
import { validate } from '../common/middleware/validate';
import { createInventorySchema, updateInventorySchema } from './equipment-inventory.validation';

const router = Router();

router.use(authenticate);
router.use(loadPermissions);

router.get('/inventory', authorize('equipment:read'), (req, res, next) => equipmentInventoryController.list(req, res, next));
router.get('/inventory/:id', authorize('equipment:read'), (req, res, next) => equipmentInventoryController.getById(req, res, next));
router.post('/inventory', authorize('equipment:manage'), validate(createInventorySchema), (req, res, next) => equipmentInventoryController.create(req, res, next));
router.patch('/inventory/:id', authorize('equipment:manage'), validate(updateInventorySchema), (req, res, next) => equipmentInventoryController.update(req, res, next));
router.delete('/inventory/:id', authorize('equipment:manage'), (req, res, next) => equipmentInventoryController.delete(req, res, next));
router.post('/inventory/:id/restore', authorize('equipment:manage'), (req, res, next) => equipmentInventoryController.restore(req, res, next));

export default router;

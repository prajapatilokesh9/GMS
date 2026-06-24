import { Router } from 'express';
import { equipmentController } from './equipment.controller';
import { authenticate } from '../common/middleware/authenticate';
import { authorize } from '../common/middleware/authorize';
import { loadPermissions } from '../common/middleware/loadPermissions';
import { validate } from '../common/middleware/validate';
import { createCatalogueSchema, updateCatalogueSchema } from './equipment.validation';

const router = Router();

router.use(authenticate);
router.use(loadPermissions);

// Public (read)
router.get('/catalogue', authorize('equipment:read'), (req, res, next) => equipmentController.listCatalogue(req, res, next));
router.get('/catalogue/:id', authorize('equipment:read'), (req, res, next) => equipmentController.getCatalogue(req, res, next));

// Admin (mutations)
router.post('/catalogue', authorize('equipment:manage'), validate(createCatalogueSchema), (req, res, next) => equipmentController.createCatalogue(req, res, next));
router.patch('/catalogue/:id', authorize('equipment:manage'), validate(updateCatalogueSchema), (req, res, next) => equipmentController.updateCatalogue(req, res, next));
router.delete('/catalogue/:id', authorize('equipment:manage'), (req, res, next) => equipmentController.deleteCatalogue(req, res, next));

// Restore deleted items
router.post('/catalogue/:id/restore', authorize('equipment:manage'), (req, res, next) => equipmentController.restoreCatalogue(req, res, next));

export default router;

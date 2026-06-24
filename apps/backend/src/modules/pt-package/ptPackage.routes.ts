import { Router } from 'express';
import { ptPackageController } from './ptPackage.controller';
import { authenticate } from '../common/middleware/authenticate';
import { authorize } from '../common/middleware/authorize';
import { loadPermissions } from '../common/middleware/loadPermissions';
import { validate } from '../common/middleware/validate';
import { createPtPackageSchema, updatePtPackageSchema } from './ptPackage.validation';

const router = Router();

router.use(authenticate);
router.use(loadPermissions);

router.get('/', authorize('pt-package:read'), (req, res, next) => ptPackageController.list(req, res, next));
router.post('/', authorize('pt-package:manage'), validate(createPtPackageSchema), (req, res, next) => ptPackageController.create(req, res, next));
router.get('/:id', authorize('pt-package:read'), (req, res, next) => ptPackageController.getById(req, res, next));
router.patch('/:id', authorize('pt-package:manage'), validate(updatePtPackageSchema), (req, res, next) => ptPackageController.update(req, res, next));

export default router;

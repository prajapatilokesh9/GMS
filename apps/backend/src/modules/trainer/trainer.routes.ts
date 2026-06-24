import { Router } from 'express';
import { trainerController } from './trainer.controller';
import { authenticate } from '../common/middleware/authenticate';
import { authorize } from '../common/middleware/authorize';
import { loadPermissions } from '../common/middleware/loadPermissions';
import { validate } from '../common/middleware/validate';
import { createTrainerSchema, updateTrainerSchema } from './trainer.validation';

const router = Router();

router.use(authenticate);
router.use(loadPermissions);

router.get('/', authorize('trainer:read'), (req, res, next) => trainerController.list(req, res, next));
router.post('/', authorize('trainer:manage'), validate(createTrainerSchema), (req, res, next) => trainerController.create(req, res, next));
router.get('/:id', authorize('trainer:read'), (req, res, next) => trainerController.getById(req, res, next));
router.patch('/:id', authorize('trainer:manage'), validate(updateTrainerSchema), (req, res, next) => trainerController.update(req, res, next));

export default router;

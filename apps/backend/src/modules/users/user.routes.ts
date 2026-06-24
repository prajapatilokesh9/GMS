import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../common/middleware/authenticate';
import { validate } from '../common/middleware/validate';
import { createUserSchema, updateUserSchema, updateProfileSchema, changePasswordSchema } from './user.validation';

const router = Router();

router.use(authenticate);

router.get('/me', (req, res, next) => userController.getProfile(req, res, next));
router.patch('/me', validate(updateProfileSchema), (req, res, next) => userController.updateProfile(req, res, next));
router.patch('/me/change-password', validate(changePasswordSchema), (req, res, next) => userController.changePassword(req, res, next));

router.get('/', (req, res, next) => userController.list(req, res, next));
router.post('/', validate(createUserSchema), (req, res, next) => userController.create(req, res, next));
router.get('/:id', (req, res, next) => userController.findById(req, res, next));
router.patch('/:id', validate(updateUserSchema), (req, res, next) => userController.update(req, res, next));

export default router;

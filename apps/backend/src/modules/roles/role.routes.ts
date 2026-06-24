import { Router } from 'express';
import { roleController } from './role.controller';
import { authenticate } from '../common/middleware/authenticate';
import { validate } from '../common/middleware/validate';
import { createRoleSchema, assignRoleSchema, assignPermissionSchema } from './role.validation';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => roleController.list(req, res, next));
router.get('/my-permissions', (req, res, next) => roleController.myPermissions(req, res, next));
router.post('/', validate(createRoleSchema), (req, res, next) => roleController.create(req, res, next));
router.get('/:id', (req, res, next) => roleController.findById(req, res, next));

router.post('/assign', validate(assignRoleSchema), (req, res, next) => roleController.assignRole(req, res, next));
router.delete('/assign/:id', (req, res, next) => roleController.removeRole(req, res, next));

router.post('/:roleId/permissions', validate(assignPermissionSchema), (req, res, next) => roleController.assignPermission(req, res, next));
router.delete('/:roleId/permissions/:permissionId', (req, res, next) => roleController.removePermission(req, res, next));

export default router;

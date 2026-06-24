import { Router } from 'express';
import { authenticate } from '../common/middleware/authenticate';
import { authorize } from '../common/middleware/authorize';
import { loadPermissions } from '../common/middleware/loadPermissions';
import { eventsController } from './events.controller';

const router = Router();

router.use(authenticate);
router.use(loadPermissions);

router.get('/', authorize('admin:events'), (req, res, next) => eventsController.listAllQueues(req, res, next));
router.get('/:queue/dlq', authorize('admin:events'), (req, res, next) => eventsController.listDLQ(req, res, next));
router.post('/:queue/dlq/:jobId/requeue', authorize('admin:events'), (req, res, next) => eventsController.requeue(req, res, next));

export default router;

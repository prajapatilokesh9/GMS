import { Router } from 'express';
import { authenticate } from '../common/middleware/authenticate';
import { authHistoryController } from './auth-history.controller';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => authHistoryController.list(req, res, next));

export default router;

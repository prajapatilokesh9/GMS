import { Router } from 'express';
import { authenticate } from '../common/middleware/authenticate';
import { gymDocumentController } from './gym-document.controller';
import multer from 'multer';
import rateLimit from 'express-rate-limit';

const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

const docMutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many document requests, please try again later' } },
});

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', docMutationLimiter, upload.single('file'), (req, res, next) => gymDocumentController.upload(req, res, next));
router.get('/', (req, res, next) => gymDocumentController.list(req, res, next));
router.patch('/:docId/status', docMutationLimiter, (req, res, next) => gymDocumentController.updateStatus(req, res, next));
router.delete('/:docId', docMutationLimiter, (req, res, next) => gymDocumentController.delete(req, res, next));

export default router;

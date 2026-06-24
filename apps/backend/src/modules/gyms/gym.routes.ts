import { Router } from 'express';
import { gymController } from './gym.controller';
import { authenticate } from '../common/middleware/authenticate';
import { authorize } from '../common/middleware/authorize';
import { loadPermissions } from '../common/middleware/loadPermissions';
import { validate } from '../common/middleware/validate';
import { createGymSchema, updateGymSchema, updateOnboardingSchema, addStaffSchema } from './gym.validation';
import gymDocumentRoutes from '../gym-documents/gym-document.routes';
import rateLimit from 'express-rate-limit';

const router = Router();

const gymMutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many gym requests, please try again later' } },
});

router.use(authenticate);
router.use(loadPermissions);

router.get('/', (req, res, next) => gymController.list(req, res, next));
router.get('/my', (req, res, next) => gymController.myGyms(req, res, next));
router.post('/', gymMutationLimiter, validate(createGymSchema), (req, res, next) => gymController.create(req, res, next));
router.get('/:id', (req, res, next) => gymController.findById(req, res, next));
router.patch('/:id', gymMutationLimiter, validate(updateGymSchema), (req, res, next) => gymController.update(req, res, next));

router.patch('/:id/verify', gymMutationLimiter, authorize('gym:verify'), validate(updateOnboardingSchema), (req, res, next) => gymController.verifyGym(req, res, next));

router.post('/:id/staff', gymMutationLimiter, validate(addStaffSchema), (req, res, next) => gymController.addStaff(req, res, next));
router.get('/:id/staff', (req, res, next) => gymController.listStaff(req, res, next));
router.delete('/:id/staff/:userRoleId', gymMutationLimiter, (req, res, next) => gymController.removeStaff(req, res, next));

router.use('/:id/documents', gymDocumentRoutes);

export default router;

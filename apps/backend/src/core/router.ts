import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/users/user.routes';
import gymRoutes from '../modules/gyms/gym.routes';
import gymDocumentRoutes from '../modules/gym-documents/gym-document.routes';
import roleRoutes from '../modules/roles/role.routes';
import authHistoryRoutes from '../modules/auth-history/auth-history.routes';
import eventsRoutes from '../modules/events/events.routes';
import billingRoutes from '../modules/billing/billing.routes';
import supplementRoutes from '../modules/supplement/supplement.routes';
import trainerRoutes from '../modules/trainer/trainer.routes';
import ptPackageRoutes from '../modules/pt-package/ptPackage.routes';
import ptSessionRoutes from '../modules/pt-session/ptSession.routes';
import commissionRoutes from '../modules/commission/commission.routes';
import equipmentRoutes from '../modules/equipment';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/gyms', gymRoutes);
router.use('/gyms/:id/documents', gymDocumentRoutes);
router.use('/roles', roleRoutes);
router.use('/auth/login-history', authHistoryRoutes);
router.use('/admin/events', eventsRoutes);
router.use('/billing', billingRoutes);
router.use('/supplements', supplementRoutes);
router.use('/trainers', trainerRoutes);
router.use('/pt-packages', ptPackageRoutes);
router.use('/pt-sessions', ptSessionRoutes);
router.use('/commissions', commissionRoutes);
router.use('/equipment', equipmentRoutes);

export { router };

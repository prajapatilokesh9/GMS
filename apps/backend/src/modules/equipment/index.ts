import { Router } from 'express';
import catalogueRoutes from './equipment.routes';
import inventoryRoutes from './equipment-inventory.routes';
import maintenanceRoutes from './equipment-maintenance.routes';

const router = Router();
router.use(catalogueRoutes);
router.use(inventoryRoutes);
router.use(maintenanceRoutes);

export default router;

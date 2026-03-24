import { Router } from 'express';
import { getAdminStats } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/stats', authorize('admin'), getAdminStats);

export default router;

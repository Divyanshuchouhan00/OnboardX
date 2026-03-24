import { Router } from 'express';
import { listAssignedEmployees } from '../controllers/managerController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('manager'));
router.get('/employees', listAssignedEmployees);

export default router;

import { Router } from 'express';
import {
  listEmployees,
  listEligibleManagers,
  getMyProfile,
  getEmployee,
  createEmployeeProfile,
  updateEmployee,
  assignManager,
  assignManagerViaHR,
  deleteEmployee,
} from '../controllers/employeeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/me', authorize('employee'), getMyProfile);
router.patch('/me', authorize('employee'), updateEmployee);
router.get('/', authorize('hr', 'admin'), listEmployees);
router.get('/manager-candidates', authorize('hr', 'admin'), listEligibleManagers);
router.patch('/:id/assign-manager', authorize('hr', 'admin'), assignManagerViaHR);
router.get('/:id', authorize('hr', 'admin'), getEmployee);
router.post('/', authorize('admin'), createEmployeeProfile);
router.patch('/:id', authorize('employee', 'hr', 'admin'), updateEmployee);
router.patch('/:id/manager', authorize('admin'), assignManager);
router.delete('/:id', authorize('admin'), deleteEmployee);

export default router;

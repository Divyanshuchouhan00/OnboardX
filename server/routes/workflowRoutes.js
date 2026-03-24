import { Router } from 'express';
import {
  getMyWorkflow,
  getWorkflow,
  postCompleteIt,
  patchCompleteItSetup,
  postSync,
} from '../controllers/workflowController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/me', authorize('employee'), getMyWorkflow);
router.patch('/:employeeId/complete-it-setup', authorize('hr', 'admin'), patchCompleteItSetup);
router.get('/:employeeId', authorize('hr', 'admin'), getWorkflow);
router.post('/:employeeId/complete-it', authorize('hr', 'admin'), postCompleteIt);
router.post('/:employeeId/sync', authorize('hr', 'admin'), postSync);

export default router;

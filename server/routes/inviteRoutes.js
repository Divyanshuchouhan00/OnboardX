import { Router } from 'express';
import { createInvite, getInviteByToken } from '../controllers/inviteController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, authorize('hr', 'admin'), createInvite);
router.get('/:token', getInviteByToken);

export default router;

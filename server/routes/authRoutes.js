import { Router } from 'express';
import { signup, signupWithInvite, login, me } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/signup-with-invite', signupWithInvite);
router.post('/login', login);
router.get('/me', authenticate, me);

export default router;

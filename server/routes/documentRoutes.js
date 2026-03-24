import { Router } from 'express';
import { uploadDocument, listDocuments, listMyDocuments, reviewDocument } from '../controllers/documentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadDocumentMiddleware as uploadMw } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.post('/upload', authorize('employee'), uploadMw.single('file'), uploadDocument);
router.get('/me', authorize('employee'), listMyDocuments);
router.get('/employee/:employeeId', authorize('hr', 'admin'), listDocuments);
router.patch('/:id/review', authorize('hr', 'admin'), reviewDocument);

export default router;

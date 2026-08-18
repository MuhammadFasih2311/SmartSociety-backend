import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  generateReport,
  exportReport,
  getReportStats
} from '../../controllers/guard/guardReportController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/generate', authorize('guard', 'admin'), generateReport);
router.get('/export', authorize('guard', 'admin'), exportReport);
router.get('/stats', authorize('guard', 'admin'), getReportStats);

export default router;
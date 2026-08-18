import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getResidentNotices,
  getResidentNoticeById,
  getResidentNoticeStats
} from '../../controllers/resident/residentNoticeController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('resident'));

router.get('/notices', getResidentNotices);
router.get('/notices/stats', getResidentNoticeStats);
router.get('/notices/:id', getResidentNoticeById);

export default router;
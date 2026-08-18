import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getAllNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  updateNoticeStatus,
  shareNotice
} from '../../controllers/admin/adminNoticeController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/', getAllNotices);
router.get('/:id', getNoticeById);
router.post('/', createNotice);
router.put('/:id', updateNotice);
router.delete('/:id', deleteNotice);
router.patch('/:id/status', updateNoticeStatus);
router.post('/:id/share', shareNotice);

export default router;
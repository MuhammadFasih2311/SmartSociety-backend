import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getMyPasses,
  getPassById,
  createPass,
  cancelPass,
  getAllPasses,
  updatePassStatus,
  verifyPass
} from '../../controllers/resident/residentPassController.js';

const router = express.Router();

router.get('/resident/passes', authMiddleware, authorize('resident'), getMyPasses);
router.get('/resident/passes/:id', authMiddleware, authorize('resident'), getPassById);
router.post('/resident/passes', authMiddleware, authorize('resident'), createPass);
router.put('/resident/passes/:id/cancel', authMiddleware, authorize('resident'), cancelPass);

router.get('/admin/passes', authMiddleware, authorize('admin'), getAllPasses);
router.patch('/admin/passes/:id/status', authMiddleware, authorize('admin'), updatePassStatus);

router.post('/guard/verify-pass', authMiddleware, authorize('guard'), verifyPass);

export default router;
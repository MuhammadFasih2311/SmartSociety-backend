import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getGates,
  getGateById,
  updateGateStatus,
  updateGate,
  createGate,
  deleteGate,
  getGateStats,
  getAvailableGuards,
  getAllGuards
} from '../../controllers/guard/guardGateController.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/gates', authorize('guard', 'admin'), getGates);
router.get('/gates/:id', authorize('guard', 'admin'), getGateById);
router.patch('/gates/:id/status', authorize('guard', 'admin'), updateGateStatus);
router.put('/gates/:id', authorize('guard', 'admin'), updateGate);
router.delete('/gates/:id', authorize('guard', 'admin'), deleteGate);
router.get('/gates/stats', authorize('guard', 'admin'), getGateStats);

router.get('/available-guards', authorize('guard', 'admin'), getAvailableGuards);
router.get('/all-guards', authorize('guard', 'admin'), getAllGuards);

router.post('/gates', authorize('guard', 'admin'), createGate);

router.post('/admin/gates', authorize('admin'), createGate);

export default router;
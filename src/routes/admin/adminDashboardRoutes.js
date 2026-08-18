import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import { 
  getDashboardStats,
  getResidentDashboardStats,
  getGuardDashboardStats
} from '../../controllers/admin/adminDashboardController.js';

const router = express.Router();

router.get('/stats', authMiddleware, authorize('admin'), getDashboardStats);

router.get('/resident/stats', authMiddleware, authorize('resident'), getResidentDashboardStats);

router.get('/guard/stats', authMiddleware, authorize('guard'), getGuardDashboardStats);

export default router;
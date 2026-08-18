import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  deleteVisitor,
  updateVisitorStatus,
  getDashboardStats,
  verifyVisitor,
  allowEntry,
  denyEntry,
  getGateLogs,
  exportGateLogs
} from '../../controllers/guard/guardVisitorController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('guard'));

router.get('/dashboard', getDashboardStats);

router.get('/gate-logs', getGateLogs);
router.get('/gate-logs/export', exportGateLogs);

router.get('/visitors', getVisitors);
router.get('/visitors/:id', getVisitorById);
router.post('/visitors', createVisitor);
router.put('/visitors/:id', updateVisitor);
router.delete('/visitors/:id', deleteVisitor);
router.patch('/visitors/:id/status', updateVisitorStatus);

router.post('/verify', verifyVisitor);
router.post('/allow-entry/:id', allowEntry);
router.post('/deny-entry/:id', denyEntry);

export default router;
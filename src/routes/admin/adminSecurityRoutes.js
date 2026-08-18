import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getAllLogs,
  getLogById,
  createLog,
  updateLog,
  deleteLog,
  updateLogStatus,
  exportLogs
} from '../../controllers/admin/adminSecurityController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/', getAllLogs);
router.get('/export', exportLogs);
router.get('/:id', getLogById);
router.post('/', createLog);
router.put('/:id', updateLog);
router.delete('/:id', deleteLog);
router.patch('/:id/status', updateLogStatus);

export default router;
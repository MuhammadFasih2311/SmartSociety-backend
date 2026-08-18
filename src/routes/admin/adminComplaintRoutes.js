import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  updateComplaintStatus,
  assignComplaint
} from '../../controllers/admin/adminComplaintController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/', getAllComplaints);
router.get('/:id', getComplaintById);
router.post('/', createComplaint);
router.put('/:id', updateComplaint);
router.delete('/:id', deleteComplaint);
router.patch('/:id/status', updateComplaintStatus);
router.patch('/:id/assign', assignComplaint);

export default router;
import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getResidentComplaints,
  getResidentComplaintById,
  createResidentComplaint,
  updateResidentComplaint,
  deleteResidentComplaint,
  getResidentComplaintStats
} from '../../controllers/resident/residentComplaintController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('resident'));

router.get('/complaints/stats', getResidentComplaintStats);

router.get('/complaints', getResidentComplaints);
router.get('/complaints/:id', getResidentComplaintById);
router.post('/complaints', createResidentComplaint);
router.put('/complaints/:id', updateResidentComplaint);
router.delete('/complaints/:id', deleteResidentComplaint);

export default router;
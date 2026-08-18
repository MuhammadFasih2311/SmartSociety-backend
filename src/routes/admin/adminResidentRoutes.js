import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getAllResidents,
  getResidentById,
  getResidentWithPassword,
  createResident,
  updateResident,
  deleteResident,
  updateResidentStatus,
  resetResidentPassword
} from '../../controllers/admin/admiResidentController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/', getAllResidents);
router.get('/:id', getResidentById);
router.get('/:id/with-password', getResidentWithPassword);
router.post('/', createResident);
router.put('/:id', updateResident);
router.delete('/:id', deleteResident);
router.patch('/:id/status', updateResidentStatus);
router.post('/:id/reset-password', resetResidentPassword);

export default router;
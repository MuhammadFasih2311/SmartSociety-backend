import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getAllGuards,
  getGuardById,
  createGuard,
  updateGuard,
  deleteGuard,
  updateGuardStatus,
  resetGuardPassword
} from '../../controllers/admin/adminGuardController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/', getAllGuards);
router.get('/:id', getGuardById);
router.post('/', createGuard);
router.put('/:id', updateGuard);
router.delete('/:id', deleteGuard);
router.patch('/:id/status', updateGuardStatus);
router.post('/:id/reset-password', resetGuardPassword);

export default router;
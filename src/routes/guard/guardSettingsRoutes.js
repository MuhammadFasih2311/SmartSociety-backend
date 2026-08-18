import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getGuardProfile,
  updateGuardProfile,
  changePassword,
  getGuardStats,
  uploadProfileImage
} from '../../controllers/guard/guardSettingsController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('guard'));

router.get('/profile', getGuardProfile);
router.put('/profile', updateGuardProfile);

router.put('/change-password', changePassword);

router.post('/profile-image', uploadProfileImage);
router.get('/stats', getGuardStats);

export default router;
import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getSettings,
  updateSettings,
  getProfile,
  updateProfile,
  changePassword
} from '../../controllers/admin/adminSettingsController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/', getSettings);
router.put('/', updateSettings);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);

export default router;
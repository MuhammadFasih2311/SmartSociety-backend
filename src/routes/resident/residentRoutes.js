import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getResidentProfile,
  updateResidentProfile,
  changePassword,
  getSocietySettings,
  getResidentStats
} from '../../controllers/resident/residentController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('resident'));

router.get('/profile', getResidentProfile);
router.put('/profile', updateResidentProfile);
router.post('/change-password', changePassword);

router.get('/settings/society', getSocietySettings);

router.get('/stats', getResidentStats);

export default router;
import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getResidentAmenities,
  getResidentAmenityById,
  getResidentAmenityStats,
  getAmenities,
  getAmenityById
} from '../../controllers/resident/residentAmenityController.js';

const router = express.Router();

router.get('/amenities', getAmenities);
router.get('/amenities/:id', getAmenityById);

router.get('/resident/amenities', authMiddleware, authorize('resident'), getResidentAmenities);
router.get('/resident/amenities/stats', authMiddleware, authorize('resident'), getResidentAmenityStats);
router.get('/resident/amenities/:id', authMiddleware, authorize('resident'), getResidentAmenityById);

export default router;
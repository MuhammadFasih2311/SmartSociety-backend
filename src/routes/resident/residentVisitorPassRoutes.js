import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getMyPasses,
  createPass,
  cancelPass
} from '../../controllers/resident/residentVisitorPassController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('resident'));

router.get('/passes', getMyPasses);
router.post('/passes', createPass);
router.put('/passes/:id/cancel', cancelPass);

export default router;
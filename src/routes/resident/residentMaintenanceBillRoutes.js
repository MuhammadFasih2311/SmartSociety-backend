import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getResidentBills,
  getResidentBillById,
  getResidentBillStats,
  payResidentBill
} from '../../controllers/resident/residentMaintenanceBillController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('resident'));

router.get('/bills', getResidentBills);
router.get('/bills/stats', getResidentBillStats);
router.get('/bills/:id', getResidentBillById);
router.put('/bills/:id/pay', payResidentBill);

export default router;
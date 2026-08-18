import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getMyBills,
  getBillById,
  payBill,
  getBillSummary
} from '../../controllers/resident/residentBillController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('resident'));

router.get('/resident/bills', getMyBills);
router.get('/resident/bills/summary', getBillSummary);
router.get('/resident/bills/:id', getBillById);
router.put('/resident/bills/:id/pay', payBill);

export default router;
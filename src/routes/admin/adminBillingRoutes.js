import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getAllBills,
  getBillById,
  generateBills,
  updateBill,
  deleteBill,
  updateBillStatus
} from '../../controllers/admin/adminBillingController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/', getAllBills);
router.get('/:id', getBillById);
router.post('/generate', generateBills);
router.put('/:id', updateBill);
router.delete('/:id', deleteBill);
router.patch('/:id/status', updateBillStatus);

export default router;
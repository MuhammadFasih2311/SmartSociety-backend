import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getBookingStats
} from '../../controllers/admin/adminAmenityBookingController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/stats', getBookingStats);    
router.get('/', getAllBookings);              
router.get('/:id', getBookingById);           
router.put('/:id/status', updateBookingStatus);  
router.delete('/:id', deleteBooking);        

export default router;
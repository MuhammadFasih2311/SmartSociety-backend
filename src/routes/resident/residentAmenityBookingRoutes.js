import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getResidentBookings,
  createBooking,
  cancelBooking,
  getBookingStats
} from '../../controllers/resident/residentAmenityBookingController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('resident'));

router.get('/amenities/bookings/stats', getBookingStats);
router.get('/amenities/bookings', getResidentBookings);
router.post('/amenities/book', createBooking);

router.put('/amenities/booking/:id/cancel', cancelBooking);

export default router;
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getStationBookings
} from '../controllers/booking.controller.js';

const router = Router();

// All booking routes require authentication
router.use(requireAuth);

// User booking routes
router.post('/', createBooking);
router.get('/my-bookings', getUserBookings);
router.get('/:bookingId', getBookingById);
router.patch('/:bookingId/cancel', cancelBooking);

// Station booking routes (for managers/owners)
router.get('/station/:stationId', getStationBookings);

export default router;

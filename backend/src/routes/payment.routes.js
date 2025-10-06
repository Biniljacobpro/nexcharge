import express from 'express';
import { 
  createPaymentOrder, 
  verifyPayment, 
  getPaymentStatus 
} from '../controllers/payment.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

// All payment routes require authentication
router.use(requireAuth);

// Create Razorpay order for booking payment
router.post('/create-order', createPaymentOrder);

// Verify payment after successful payment
router.post('/verify', verifyPayment);

// Get payment status for a booking
router.get('/status/:bookingId', getPaymentStatus);

export default router;

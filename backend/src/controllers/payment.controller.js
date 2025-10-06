import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/booking.model.js';
import Station from '../models/station.model.js';
import { createBookingNotification } from './notification.controller.js';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order for booking payment
export const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const {
      stationId,
      chargerType,
      startTime,
      endTime,
      vehicleId,
      currentCharge,
      targetCharge,
      notes
    } = req.body;

    console.log('=== Creating payment order ===');
    console.log('User ID:', userId);
    console.log('Request body:', req.body);

    // Validate required fields
    const missing = (
      !stationId ||
      !chargerType ||
      !startTime ||
      !endTime ||
      !vehicleId ||
      (currentCharge === null || currentCharge === undefined) ||
      (targetCharge === null || targetCharge === undefined)
    );
    if (missing) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: stationId, chargerType, startTime, endTime, vehicleId, currentCharge, targetCharge'
      });
    }

    // Check if station exists
    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    // Calculate duration and pricing
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.round((end - start) / (1000 * 60)); // minutes
    
    // Ensure station has pricing
    if (!station.pricing?.pricePerMinute) {
      if (!station.pricing) station.pricing = {};
      station.pricing.pricePerMinute = 10;
      await station.save();
    }
    
    const pricePerMinute = Number(station.pricing.pricePerMinute);
    const estimatedCost = duration * pricePerMinute;

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(estimatedCost * 100), // Amount in paise (multiply by 100)
      currency: 'INR',
      receipt: `booking_${Date.now()}`,
      notes: {
        stationId,
        chargerType,
        startTime,
        endTime,
        vehicleId,
        currentCharge: currentCharge.toString(),
        targetCharge: targetCharge.toString(),
        duration: duration.toString(),
        pricePerMinute: pricePerMinute.toString(),
        userId,
        notes: notes || ''
      }
    };

    const order = await razorpay.orders.create(orderOptions);
    console.log('Razorpay order created:', order.id);

    // Create a pending booking with payment info
    const booking = new Booking({
      userId,
      stationId,
      chargerId: 'pending_payment', // Will be assigned after payment
      chargerType,
      startTime: start,
      endTime: end,
      duration,
      vehicleId,
      currentCharge,
      targetCharge,
      pricing: {
        basePrice: pricePerMinute,
        estimatedEnergy: 0,
        estimatedCost
      },
      payment: {
        razorpayOrderId: order.id,
        paymentStatus: 'pending',
        paidAmount: 0
      },
      notes,
      status: 'pending' // Will be confirmed after payment
    });

    await booking.save();
    console.log('Pending booking created:', booking._id);

    res.status(201).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        bookingId: booking._id,
        keyId: process.env.RAZORPAY_KEY_ID,
        estimatedCost,
        duration,
        stationName: station.name
      }
    });

  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify payment and confirm booking
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = req.body;

    console.log('=== Verifying payment ===');
    console.log('Order ID:', razorpay_order_id);
    console.log('Payment ID:', razorpay_payment_id);
    console.log('Booking ID:', bookingId);

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.log('Payment signature verification failed');
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    console.log('Payment details:', payment.status, payment.method);

    // Find and allocate charger
    const station = await Station.findById(booking.stationId);
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    // Ensure chargers array exists
    if (!Array.isArray(station.capacity?.chargers) || station.capacity.chargers.length === 0) {
      station.capacity.chargers = [];
      const types = Array.isArray(station.capacity?.chargerTypes) ? station.capacity.chargerTypes : [];
      const total = Number(station.capacity?.totalChargers || 0);
      const perType = types.length > 0 ? Math.ceil(total / types.length) : total;
      types.forEach((type, typeIndex) => {
        for (let i = 0; i < perType && station.capacity.chargers.length < total; i++) {
          station.capacity.chargers.push({
            chargerId: `${type}_${typeIndex}_${i}`,
            type,
            power: station.capacity?.maxPowerPerCharger || 7,
            isAvailable: true,
            currentBooking: null
          });
        }
      });
      if (station.capacity.chargers.length === 0 && total > 0) {
        station.capacity.chargers.push({
          chargerId: `${booking.chargerType}_0_0`,
          type: booking.chargerType,
          power: station.capacity?.maxPowerPerCharger || 7,
          isAvailable: true,
          currentBooking: null
        });
      }
    }

    // Find available charger
    const availableCharger = station.capacity.chargers.find(
      charger => charger.type === booking.chargerType && charger.isAvailable
    );

    if (!availableCharger) {
      // Payment successful but no charger available - need to refund
      console.log('No available charger, booking cannot be confirmed');
      booking.status = 'cancelled';
      booking.cancellationReason = 'No available charger after payment';
      booking.payment.paymentStatus = 'completed'; // Payment was successful
      booking.payment.razorpayPaymentId = razorpay_payment_id;
      booking.payment.razorpaySignature = razorpay_signature;
      booking.payment.paymentMethod = payment.method;
      booking.payment.paidAmount = payment.amount / 100; // Convert from paise
      booking.payment.paymentDate = new Date();
      await booking.save();

      // Create notification for booking cancellation
      try {
        await createBookingNotification(booking.userId, 'booking_cancelled', booking, station);
      } catch (notificationError) {
        console.error('Error creating cancellation notification:', notificationError);
      }

      return res.status(400).json({
        success: false,
        message: 'No available chargers. Payment will be refunded.',
        bookingId: booking._id
      });
    }

    // Allocate charger and update booking
    availableCharger.isAvailable = false;
    availableCharger.currentBooking = booking._id;
    booking.chargerId = availableCharger.chargerId;
    
    // Update available slots
    const slots = station?.capacity?.availableSlots;
    if (typeof slots === 'number' && Number.isFinite(slots)) {
      station.capacity.availableSlots = Math.max(0, slots - 1);
    } else if (Array.isArray(station?.capacity?.chargers)) {
      station.capacity.availableSlots = station.capacity.chargers.filter(c => c.isAvailable).length;
    } else {
      const total = Number(station?.capacity?.totalChargers || 0);
      station.capacity.availableSlots = Math.max(0, total - 1);
    }

    // Update payment info
    booking.payment.razorpayPaymentId = razorpay_payment_id;
    booking.payment.razorpaySignature = razorpay_signature;
    booking.payment.paymentStatus = 'completed';
    booking.payment.paymentMethod = payment.method;
    booking.payment.paidAmount = payment.amount / 100; // Convert from paise
    booking.payment.paymentDate = new Date();
    booking.status = 'confirmed';

    // Save both booking and station
    await booking.save();
    await station.save();

    console.log('Payment verified and booking confirmed:', booking._id);

    // Create notifications for successful booking
    try {
      await createBookingNotification(booking.userId, 'payment_success', booking, station);
      await createBookingNotification(booking.userId, 'booking_confirmed', booking, station);
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Don't fail the payment verification if notification fails
    }

    // Populate booking details
    try {
      await booking.populate([
        { path: 'userId', select: 'personalInfo.firstName personalInfo.lastName personalInfo.email' },
        { path: 'stationId', select: 'name location' }
      ]);
    } catch (_) {}

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed successfully',
      data: booking
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get payment status for a booking
export const getPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.sub || req.user.id;

    const booking = await Booking.findOne({ _id: bookingId, userId })
      .populate('stationId', 'name location');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        bookingId: booking._id,
        paymentStatus: booking.payment?.paymentStatus || 'pending',
        paidAmount: booking.payment?.paidAmount || 0,
        paymentMethod: booking.payment?.paymentMethod,
        paymentDate: booking.payment?.paymentDate,
        bookingStatus: booking.status,
        estimatedCost: booking.pricing?.estimatedCost || 0
      }
    });

  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

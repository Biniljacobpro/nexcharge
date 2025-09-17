import Booking from '../models/booking.model.js';
import Station from '../models/station.model.js';
import User from '../models/user.model.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const {
      stationId,
      chargerType,
      startTime,
      endTime,
      vehicleInfo,
      notes
    } = req.body;

    // Validate required fields
    if (!stationId || !chargerType || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: stationId, chargerType, startTime, endTime'
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

    // Check if station is active
    if (station.operational?.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Station is not available for booking'
      });
    }

    // Find available charger of the requested type
    const availableCharger = station.capacity?.chargers?.find(
      charger => charger.type === chargerType && charger.isAvailable
    );

    if (!availableCharger) {
      return res.status(400).json({
        success: false,
        message: `No available ${chargerType} chargers at this station`
      });
    }

    // Validate time slots
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start <= now) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be in the future'
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      stationId,
      chargerId: availableCharger.chargerId,
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        {
          startTime: { $lt: end },
          endTime: { $gt: start }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is already booked'
      });
    }

    // Calculate duration and pricing
    const duration = Math.round((end - start) / (1000 * 60)); // minutes
    const estimatedEnergy = vehicleInfo?.batteryCapacity ? 
      (vehicleInfo.batteryCapacity * (vehicleInfo.targetCharge - vehicleInfo.currentCharge) / 100) : 0;
    const estimatedCost = estimatedEnergy * (station.pricing?.basePrice || 0);

    // Create booking
    const booking = new Booking({
      userId,
      stationId,
      chargerId: availableCharger.chargerId,
      chargerType,
      startTime: start,
      endTime: end,
      duration,
      vehicleInfo,
      pricing: {
        basePrice: station.pricing?.basePrice || 0,
        estimatedEnergy,
        estimatedCost
      },
      notes,
      status: 'confirmed'
    });

    await booking.save();

    // Update station charger availability
    availableCharger.isAvailable = false;
    availableCharger.currentBooking = booking._id;
    station.capacity.availableSlots = station.capacity.availableSlots - 1;
    await station.save();

    // Populate booking details
    await booking.populate([
      { path: 'userId', select: 'personalInfo.firstName personalInfo.lastName personalInfo.email' },
      { path: 'stationId', select: 'name location' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { status, limit = 10, page = 1 } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('stationId', 'name location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error getting user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.sub || req.user.id;

    const booking = await Booking.findOne({ _id: bookingId, userId })
      .populate('stationId', 'name location')
      .populate('userId', 'personalInfo.firstName personalInfo.lastName personalInfo.email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Error getting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.sub || req.user.id;
    const { reason } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    booking.cancelledBy = userId;
    await booking.save();

    // Update station charger availability
    const station = await Station.findById(booking.stationId);
    if (station) {
      const charger = station.capacity?.chargers?.find(
        c => c.chargerId === booking.chargerId
      );
      if (charger) {
        charger.isAvailable = true;
        charger.currentBooking = null;
        station.capacity.availableSlots = station.capacity.availableSlots + 1;
        await station.save();
      }
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get station bookings (for station managers/franchise owners)
export const getStationBookings = async (req, res) => {
  try {
    const { stationId } = req.params;
    const { status, limit = 20, page = 1 } = req.query;

    const query = { stationId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'personalInfo.firstName personalInfo.lastName personalInfo.email')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error getting station bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

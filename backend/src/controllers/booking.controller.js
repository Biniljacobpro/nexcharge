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
      vehicleId,
      currentCharge,
      targetCharge,
      notes
    } = req.body;

    // Validate required fields
    if (!stationId || !chargerType || !startTime || !endTime || !vehicleId || !currentCharge || !targetCharge) {
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

    // Check if station is active
    if (station.operational?.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Station is not available for booking'
      });
    }

    // Check if vehicle exists and is active
    const Vehicle = (await import('../models/vehicle.model.js')).default;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || !vehicle.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found or not available'
      });
    }

    // Validate charge levels
    if (currentCharge < 0 || currentCharge > 100 || targetCharge < 0 || targetCharge > 100) {
      return res.status(400).json({
        success: false,
        message: 'Charge levels must be between 0 and 100'
      });
    }

    if (currentCharge >= targetCharge) {
      return res.status(400).json({
        success: false,
        message: 'Target charge must be higher than current charge'
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
    const estimatedEnergy = vehicle.batteryCapacity ? 
      (vehicle.batteryCapacity * (targetCharge - currentCharge) / 100) : 0;
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
      vehicleId,
      currentCharge,
      targetCharge,
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

// Update booking (time window and/or charger type)
export const updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.sub || req.user.id;
    const { startTime, endTime, chargerType } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (['cancelled', 'completed', 'no_show'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot edit a cancelled or completed booking' });
    }

    const now = new Date();
    const newStart = startTime ? new Date(startTime) : new Date(booking.startTime);
    const newEnd = endTime ? new Date(endTime) : new Date(booking.endTime);
    const desiredType = chargerType || booking.chargerType;

    if (!(newStart instanceof Date) || isNaN(newStart) || !(newEnd instanceof Date) || isNaN(newEnd)) {
      return res.status(400).json({ success: false, message: 'Invalid start or end time' });
    }
    if (newStart <= now) {
      return res.status(400).json({ success: false, message: 'Start time must be in the future' });
    }
    if (newEnd <= newStart) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    const station = await Station.findById(booking.stationId);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    // Find an available charger of desiredType that does not overlap
    const candidateChargers = (station.capacity?.chargers || []).filter(c => c.type === desiredType);
    let chosenCharger = null;
    for (const c of candidateChargers) {
      const overlap = await Booking.findOne({
        stationId: booking.stationId,
        chargerId: c.chargerId,
        _id: { $ne: booking._id },
        status: { $in: ['pending', 'confirmed', 'active'] },
        $or: [{ startTime: { $lt: newEnd }, endTime: { $gt: newStart } }]
      });
      if (!overlap) { chosenCharger = c; break; }
    }

    if (!chosenCharger) {
      return res.status(400).json({ success: false, message: `No available ${desiredType} chargers for the selected time window` });
    }

    // Free previously held charger (if any) and occupy the new one immediately (consistent with createBooking behavior)
    const prevCharger = station.capacity?.chargers?.find(c => c.chargerId === booking.chargerId);
    if (prevCharger && !prevCharger.isAvailable) {
      prevCharger.isAvailable = true;
      prevCharger.currentBooking = null;
      if (typeof station.capacity.availableSlots === 'number') {
        station.capacity.availableSlots = station.capacity.availableSlots + 1;
      }
    }

    chosenCharger.isAvailable = false;
    chosenCharger.currentBooking = booking._id;
    if (typeof station.capacity.availableSlots === 'number') {
      station.capacity.availableSlots = station.capacity.availableSlots - 1;
    }
    await station.save();

    // Update booking
    booking.chargerType = desiredType;
    booking.chargerId = chosenCharger.chargerId;
    booking.startTime = newStart;
    booking.endTime = newEnd;
    booking.duration = Math.round((newEnd - newStart) / (1000 * 60));
    await booking.save();

    await booking.populate([
      { path: 'stationId', select: 'name location' },
      { path: 'userId', select: 'personalInfo.firstName personalInfo.lastName personalInfo.email' }
    ]);

    res.json({ success: true, message: 'Booking updated successfully', data: booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { status, limit = 10, page = 1 } = req.query;

    // Auto-complete expired bookings and free chargers
    const now = new Date();
    const expiring = await Booking.find({
      userId,
      status: { $in: ['pending', 'confirmed', 'active'] },
      endTime: { $lt: now }
    });
    if (expiring.length > 0) {
      await Promise.all(expiring.map(async (b) => {
        try {
          b.status = 'completed';
          await b.save();
          const station = await Station.findById(b.stationId);
          if (station) {
            const charger = station.capacity?.chargers?.find(c => c.chargerId === b.chargerId);
            if (charger && !charger.isAvailable) {
              charger.isAvailable = true;
              charger.currentBooking = null;
              if (typeof station.capacity.availableSlots === 'number') {
                station.capacity.availableSlots = station.capacity.availableSlots + 1;
              }
              await station.save();
            }
          }
        } catch (e) {
          // swallow errors to not block response
        }
      }));
    }

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('stationId', 'name location')
      .populate('vehicleId', 'make model vehicleType batteryCapacity specifications')
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

    // Only allow cancellation if at least 2 hours before start time
    const now = new Date();
    const start = new Date(booking.startTime);
    const twoHoursMs = 2 * 60 * 60 * 1000;
    if (start.getTime() - now.getTime() < twoHoursMs) {
      return res.status(400).json({
        success: false,
        message: 'Cancellations are only allowed up to 2 hours before the start time'
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

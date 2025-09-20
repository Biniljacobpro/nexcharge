import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  // User who made the booking
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Station and charger details
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  chargerId: {
    type: String,
    required: true
  },
  chargerType: {
    type: String,
    enum: ['ac_type2', 'dc_ccs', 'dc_chademo', 'dc_gbt', 'ac_3pin'],
    required: true
  },
  
  // Booking timing
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  
  // Vehicle information
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  currentCharge: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  targetCharge: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  
  // Pricing and payment
  pricing: {
    basePrice: { type: Number, required: true }, // per kWh
    estimatedEnergy: { type: Number, default: 0 }, // kWh
    estimatedCost: { type: Number, default: 0 }, // total cost
    actualEnergy: { type: Number, default: 0 }, // actual kWh used
    actualCost: { type: Number, default: 0 } // actual cost
  },
  
  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  
  // Additional information
  notes: String,
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Check-in/out tracking
  checkedInAt: Date,
  checkedOutAt: Date,
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
BookingSchema.index({ stationId: 1, startTime: 1, endTime: 1 });
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ status: 1 });

// Virtual for booking duration in hours
BookingSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

// Pre-save middleware to update timestamps
BookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Booking', BookingSchema);
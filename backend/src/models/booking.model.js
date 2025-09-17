import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  corporateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Corporate', required: true },
  franchiseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slotNumber: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'expired'], 
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['card', 'upi', 'wallet', 'cash'], 
    default: 'card' 
  },
  paymentId: { type: String },
  vehicleInfo: {
    type: { type: String, enum: ['car', 'bike', 'scooter', 'bus', 'truck'] },
    model: String,
    batteryCapacity: Number,
    chargingPort: String
  },
  chargingDetails: {
    initialBattery: Number,
    finalBattery: Number,
    energyConsumed: Number, // in kWh
    chargingSpeed: Number // in kW
  },
  cancellationReason: String,
  refundAmount: Number,
  notes: String,
  metadata: { type: Object }
}, { timestamps: true });

// Indexes for better query performance
BookingSchema.index({ userId: 1 });
BookingSchema.index({ stationId: 1 });
BookingSchema.index({ corporateId: 1 });
BookingSchema.index({ franchiseId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ startTime: 1, endTime: 1 });

// Virtual for booking duration in hours
BookingSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

// Pre-save middleware to calculate duration
BookingSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // in minutes
  }
  next();
});

export default mongoose.model('Booking', BookingSchema);

import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['car', 'two_wheeler', 'three_wheeler', 'bus', 'other'],
    default: 'car'
  },
  batteryCapacity: {
    type: Number,
    required: true,
    min: 1,
    max: 500,
    description: 'Battery capacity in kWh'
  },
  chargingAC: {
    type: {
      supported: {
        type: Boolean,
        default: true
      },
      maxPower: {
        type: Number,
        min: 20,
        max: 500,
        description: 'Maximum AC charging power in kW'
      },
      connectorTypes: [{
        type: String,
        enum: ['type1', 'type2', 'bharat_ac_001', 'bharat_dc_001', 'ccs2', 'chademo', 'gbt_type6', 'type7_leccs', 'mcs', 'chaoji', 'other']
      }]
    },
    required: true
  },
  chargingDC: {
    type: {
      supported: {
        type: Boolean,
        default: true
      },
      maxPower: {
        type: Number,
        min: 20,
        max: 500,
        description: 'Maximum DC charging power in kW'
      },
      connectorTypes: [{
        type: String,
        enum: ['type1', 'type2', 'bharat_ac_001', 'bharat_dc_001', 'ccs2', 'chademo', 'gbt_type6', 'type7_leccs', 'mcs', 'chaoji', 'other']
      }]
    },
    required: true
  },
  compatibleChargingStations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station'
  }],
  specifications: {
    year: {
      type: Number,
      min: 2015,
      max: 2025
    },
    range: {
      type: Number,
      min: 20,
      max: 2000,
      description: 'Vehicle range in kilometers'
    },
    chargingTime: {
      ac: {
        type: Number,
        min: 0,
        description: 'AC charging time in hours (0-100%)'
      },
      dc: {
        type: Number,
        min: 0,
        description: 'DC charging time in hours (0-80%)'
      }
    },
    weight: {
      type: Number,
      min: 0,
      description: 'Vehicle weight in kg'
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    }
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full vehicle name
VehicleSchema.virtual('fullName').get(function() {
  return `${this.make} ${this.model}`;
});

// Virtual for display name with year
VehicleSchema.virtual('displayName').get(function() {
  const year = this.specifications?.year;
  return year ? `${this.make} ${this.model} (${year})` : `${this.make} ${this.model}`;
});

// Index for efficient searching
VehicleSchema.index({ make: 1, model: 1 });
VehicleSchema.index({ vehicleType: 1 });
VehicleSchema.index({ isActive: 1 });
VehicleSchema.index({ 'chargingAC.supported': 1, 'chargingDC.supported': 1 });

// Pre-save middleware to update version
VehicleSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  next();
});

// Static method to get vehicles by charging compatibility
VehicleSchema.statics.getCompatibleVehicles = function(chargerTypes) {
  return this.find({
    isActive: true,
    $or: [
      { 'chargingAC.supported': true, 'chargingAC.connectorTypes': { $in: chargerTypes } },
      { 'chargingDC.supported': true, 'chargingDC.connectorTypes': { $in: chargerTypes } }
    ]
  });
};

export default mongoose.model('Vehicle', VehicleSchema);


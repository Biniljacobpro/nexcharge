const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nexcharge';
console.log('Connecting to MongoDB:', mongoUri);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  // Vehicle schema
  const VehicleSchema = new mongoose.Schema({
    make: String,
    model: String,
    vehicleType: String,
    batteryCapacity: Number,
    chargingAC: {
      supported: Boolean,
      maxPower: Number,
      connectorTypes: [String]
    },
    chargingDC: {
      supported: Boolean,
      maxPower: Number,
      connectorTypes: [String]
    },
    specifications: {
      year: Number,
      range: Number,
      weight: Number
    }
  }, {
    timestamps: true
  });

  const Vehicle = mongoose.model('Vehicle', VehicleSchema);

  try {
    // Get all vehicles
    const vehicles = await Vehicle.find({});
    console.log(`Found ${vehicles.length} vehicles:`);
    
    vehicles.forEach((vehicle, index) => {
      console.log(`\n--- Vehicle ${index + 1} ---`);
      console.log(`ID: ${vehicle._id}`);
      console.log(`Make: ${vehicle.make}`);
      console.log(`Model: ${vehicle.model}`);
      console.log(`Vehicle Type: ${vehicle.vehicleType}`);
      console.log(`Battery Capacity: ${vehicle.batteryCapacity} kWh`);
      
      console.log(`AC Charging:`);
      console.log(`  Supported: ${vehicle.chargingAC?.supported}`);
      console.log(`  Max Power: ${vehicle.chargingAC?.maxPower} kW`);
      console.log(`  Connector Types: ${JSON.stringify(vehicle.chargingAC?.connectorTypes)}`);
      
      console.log(`DC Charging:`);
      console.log(`  Supported: ${vehicle.chargingDC?.supported}`);
      console.log(`  Max Power: ${vehicle.chargingDC?.maxPower} kW`);
      console.log(`  Connector Types: ${JSON.stringify(vehicle.chargingDC?.connectorTypes)}`);
      
      console.log(`Specifications:`);
      console.log(`  Year: ${vehicle.specifications?.year}`);
      console.log(`  Range: ${vehicle.specifications?.range} km`);
      console.log(`  Weight: ${vehicle.specifications?.weight} kg`);
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
});
import mongoose from 'mongoose';
import Station from './src/models/station.model.js';

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexcharge';
await mongoose.connect(mongoUri);

console.log('Connected to MongoDB');

// Find stations without pricing.pricePerMinute and update them
const stationsWithoutPricing = await Station.find({
  $or: [
    { 'pricing.pricePerMinute': { $exists: false } },
    { 'pricing.pricePerMinute': null },
    { 'pricing.pricePerMinute': 0 }
  ]
});

console.log(`Found ${stationsWithoutPricing.length} stations without proper pricing`);

for (const station of stationsWithoutPricing) {
  console.log(`Updating station: ${station.name} (${station._id})`);
  
  if (!station.pricing) {
    station.pricing = {};
  }
  
  station.pricing.pricePerMinute = 10; // Default ₹10 per minute
  
  await station.save();
  console.log(`Updated station ${station.name} with pricePerMinute: 10`);
}

console.log('All stations updated successfully');
await mongoose.disconnect();

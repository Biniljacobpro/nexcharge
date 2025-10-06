import mongoose from 'mongoose';
import Station from './src/models/station.model.js';

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexcharge';
await mongoose.connect(mongoUri);

console.log('Connected to MongoDB');

// Find all stations and check their pricing
const stations = await Station.find({});

console.log(`Found ${stations.length} stations`);

for (const station of stations) {
  console.log(`\nStation: ${station.name} (${station._id})`);
  console.log('Pricing:', JSON.stringify(station.pricing, null, 2));
  
  // If station has old basePrice but no pricePerMinute, convert it
  if (station.pricing?.basePrice && !station.pricing?.pricePerMinute) {
    console.log(`Converting basePrice ${station.pricing.basePrice} to pricePerMinute`);
    station.pricing.pricePerMinute = station.pricing.basePrice;
    await station.save();
    console.log('Updated successfully');
  }
  
  // If station has no pricing at all, add default
  if (!station.pricing || (!station.pricing.pricePerMinute && !station.pricing.basePrice)) {
    console.log('Adding default pricing');
    if (!station.pricing) station.pricing = {};
    station.pricing.pricePerMinute = 10;
    await station.save();
    console.log('Added default pricePerMinute: 10');
  }
}

console.log('\nAll stations processed');
await mongoose.disconnect();

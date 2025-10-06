import mongoose from 'mongoose';
import Station from './src/models/station.model.js';

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexcharge';
await mongoose.connect(mongoUri);

console.log('Connected to MongoDB');

// Find the specific station that's failing
const stationId = '68d611343c8201ff7a0c8818';
const station = await Station.findById(stationId);

if (station) {
  console.log('Station found:');
  console.log('Name:', station.name);
  console.log('Pricing object:', JSON.stringify(station.pricing, null, 2));
  console.log('pricePerMinute value:', station.pricing?.pricePerMinute);
  console.log('pricePerMinute type:', typeof station.pricing?.pricePerMinute);
  
  // Check if it has the old basePrice field
  if (station.pricing?.basePrice) {
    console.log('Found old basePrice:', station.pricing.basePrice);
    console.log('Converting to pricePerMinute...');
    station.pricing.pricePerMinute = station.pricing.basePrice;
    await station.save();
    console.log('Updated station with pricePerMinute:', station.pricing.pricePerMinute);
  }
} else {
  console.log('Station not found');
}

await mongoose.disconnect();

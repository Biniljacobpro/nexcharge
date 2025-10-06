import mongoose from 'mongoose';

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexcharge';
await mongoose.connect(mongoUri);

console.log('Connected to MongoDB');

// Check vehicles collection
const vehiclesCollection = mongoose.connection.db.collection('vehicles');
const vehicleCount = await vehiclesCollection.countDocuments();
console.log('Vehicles count:', vehicleCount);

if (vehicleCount > 0) {
  const vehicles = await vehiclesCollection.find({}).limit(3).toArray();
  console.log('Sample vehicles:');
  vehicles.forEach(v => {
    console.log(`- ${v.make} ${v.model} (${v._id}) - Active: ${v.isActive}`);
  });
}

// Check if there are any stations at all
const stationsCollection = mongoose.connection.db.collection('stations');
const allStations = await stationsCollection.find({}).toArray();
console.log('All stations:', allStations.length);

if (allStations.length > 0) {
  console.log('Station IDs:');
  allStations.forEach(s => {
    console.log(`- ${s.name} (${s._id})`);
  });
}

await mongoose.disconnect();

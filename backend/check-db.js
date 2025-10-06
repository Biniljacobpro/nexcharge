import mongoose from 'mongoose';

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexcharge';
await mongoose.connect(mongoUri);

console.log('Connected to MongoDB');
console.log('Database name:', mongoose.connection.db.databaseName);

// List all collections
const collections = await mongoose.connection.db.listCollections().toArray();
console.log('Collections:', collections.map(c => c.name));

// Check stations collection directly
const stationsCollection = mongoose.connection.db.collection('stations');
const stationCount = await stationsCollection.countDocuments();
console.log('Stations count:', stationCount);

if (stationCount > 0) {
  const sampleStation = await stationsCollection.findOne();
  console.log('Sample station:', JSON.stringify(sampleStation, null, 2));
}

await mongoose.disconnect();

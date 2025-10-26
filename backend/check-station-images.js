import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Station from './src/models/station.model.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    // Find a station with images
    const station = await Station.findOne({ images: { $exists: true, $ne: [] } });
    if (station) {
      console.log('Station ID:', station._id);
      console.log('Station Code:', station.code);
      console.log('Station Images:', station.images);
    } else {
      console.log('No station with images found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
});
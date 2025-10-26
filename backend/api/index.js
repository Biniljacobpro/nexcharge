import app from '../src/index.js';
import mongoose from 'mongoose';

// Vercel serverless function handler
export default async function handler(request, response) {
  // Connect to MongoDB if not already connected
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected for Vercel function');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return response.status(500).json({ error: 'Database connection failed' });
    }
  }

  // Pass the request to Express app
  return new Promise((resolve) => {
    // Create a mock response object that will call resolve when finished
    const mockResponse = {
      ...response,
      status: (code) => {
        response.status(code);
        return mockResponse;
      },
      json: (data) => {
        response.json(data);
        resolve();
      },
      send: (data) => {
        response.send(data);
        resolve();
      }
    };

    // Let Express handle the request
    app(request, mockResponse);
  });
}
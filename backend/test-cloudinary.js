import cloudinary from './config/cloudinary.js';
import dotenv from 'dotenv';

dotenv.config();

// Test Cloudinary configuration
console.log('Testing Cloudinary configuration...');

const testCloudinary = async () => {
  try {
    // Test configuration by pinging Cloudinary
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection successful:', result);
    
    // List uploaded files as a test
    const files = await cloudinary.api.resources({ 
      type: 'upload', 
      prefix: 'NexCharge/uploads',
      max_results: 10 
    });
    console.log('Files in NexCharge/uploads folder:', files.resources.length);
    
  } catch (error) {
    console.error('Cloudinary test failed:', error.message);
  }
};

testCloudinary();
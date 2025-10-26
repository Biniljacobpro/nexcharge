// Test script to verify profile image update functionality
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// Test Cloudinary configuration
console.log('Testing Cloudinary configuration for profile images...');

const testCloudinary = async () => {
  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      // Don't log api_secret for security
    });
    
    // Test configuration by pinging Cloudinary
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection successful:', result);
    
    // Test uploading a sample image
    const sampleImage = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    const uploadResult = await cloudinary.uploader.upload(sampleImage, {
      folder: 'NexCharge/uploads',
      public_id: 'test_profile_image_' + Date.now(),
      transformation: [{ width: 200, height: 200, crop: 'limit' }]
    });
    
    console.log('Sample image uploaded successfully:', uploadResult.secure_url);
    console.log('Profile image functionality should now work correctly with Cloudinary');
    
  } catch (error) {
    console.error('Cloudinary test failed:', error.message);
    console.error('Error stack:', error.stack);
  }
};

testCloudinary();
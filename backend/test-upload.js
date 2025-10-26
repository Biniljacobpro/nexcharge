// Simple test to verify upload middleware works
import express from 'express';
import uploadMiddleware from './middleware/upload.js';

const app = express();

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Test route
app.post('/test-upload', uploadMiddleware, (req, res) => {
  console.log('Files received:', req.files);
  console.log('Single image URL:', req.imageUrl);
  console.log('Multiple images URLs:', req.imageUrls);
  
  res.json({
    success: true,
    message: 'Upload test completed',
    files: req.files,
    imageUrl: req.imageUrl,
    imageUrls: req.imageUrls
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Upload test server running on port ${PORT}`);
  console.log('Use POST /test-upload with form-data to test image uploads');
  console.log('Fields: image (single) or images (multiple)');
});
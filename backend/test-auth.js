import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import jwt from 'jsonwebtoken';

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexcharge');

console.log('Connected to MongoDB');

// Find the franchise owner
const franchiseOwner = await User.findOne({ role: 'franchise_owner' });
console.log('Franchise Owner:', franchiseOwner);

if (franchiseOwner) {
  // Create a JWT token for testing
  const token = jwt.sign(
    { 
      sub: franchiseOwner._id.toString(),
      role: franchiseOwner.role,
      email: franchiseOwner.personalInfo?.email
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
  
  console.log('\nGenerated JWT Token:');
  console.log(token);
  
  // Decode the token to verify
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  console.log('\nDecoded Token:');
  console.log(decoded);
  
  // Test the franchise ID retrieval
  const franchiseId = franchiseOwner.roleSpecificData?.franchiseOwnerInfo?.franchiseId;
  console.log('\nFranchise ID from user:', franchiseId);
}

await mongoose.disconnect();
console.log('\nDisconnected from MongoDB');


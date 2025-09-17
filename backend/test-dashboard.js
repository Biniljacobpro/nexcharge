import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import Franchise from './src/models/franchise.model.js';
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
  
  // Test the franchise ID retrieval logic
  const franchiseId = franchiseOwner.roleSpecificData?.franchiseOwnerInfo?.franchiseId;
  console.log('\nFranchise ID from user:', franchiseId);
  
  if (franchiseId) {
    // Check if franchise exists
    const franchise = await Franchise.findById(franchiseId);
    console.log('Franchise found:', franchise ? 'Yes' : 'No');
    if (franchise) {
      console.log('Franchise name:', franchise.name);
      console.log('Franchise status:', franchise.status);
    }
  } else {
    console.log('❌ No franchise ID found in user data');
  }
  
  // Test the getFranchiseIdFromUser function logic
  console.log('\n=== Testing getFranchiseIdFromUser logic ===');
  const user = await User.findById(franchiseOwner._id);
  console.log('User found:', user ? 'Yes' : 'No');
  console.log('User role:', user?.role);
  console.log('Franchise owner info:', user?.roleSpecificData?.franchiseOwnerInfo);
  const retrievedFranchiseId = user?.roleSpecificData?.franchiseOwnerInfo?.franchiseId;
  console.log('Retrieved franchise ID:', retrievedFranchiseId);
  
  if (!retrievedFranchiseId) {
    console.log('❌ ERROR: Franchise ID not found in user data');
  } else {
    console.log('✅ Franchise ID found successfully');
  }
}

await mongoose.disconnect();
console.log('\nDisconnected from MongoDB');


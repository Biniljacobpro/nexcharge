import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import bcrypt from 'bcryptjs';

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexcharge');

console.log('Connected to MongoDB');

// Find the franchise owner
const franchiseOwner = await User.findOne({ role: 'franchise_owner' });
console.log('Franchise Owner:', franchiseOwner?.personalInfo?.email);

if (franchiseOwner) {
  // Set a known password
  const newPassword = 'password123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await User.findByIdAndUpdate(franchiseOwner._id, {
    'credentials.passwordHash': hashedPassword,
    'credentials.mustChangePassword': false
  });
  
  console.log(`✅ Password reset for ${franchiseOwner.personalInfo.email} to: ${newPassword}`);
  console.log('Must change password set to: false');
} else {
  console.log('❌ No franchise owner found');
}

await mongoose.disconnect();
console.log('Disconnected from MongoDB');


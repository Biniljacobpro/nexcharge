import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import Franchise from './src/models/franchise.model.js';

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexcharge');

console.log('Connected to MongoDB');

// Find all franchise owners
const franchiseOwners = await User.find({ role: 'franchise_owner' });
console.log('\n=== FRANCHISE OWNERS ===');
console.log(`Found ${franchiseOwners.length} franchise owners`);

for (const owner of franchiseOwners) {
  console.log('\n--- Franchise Owner ---');
  console.log('ID:', owner._id);
  console.log('Name:', `${owner.personalInfo?.firstName} ${owner.personalInfo?.lastName}`);
  console.log('Email:', owner.personalInfo?.email);
  console.log('Role:', owner.role);
  console.log('Franchise Owner Info:', owner.roleSpecificData?.franchiseOwnerInfo);
  console.log('Must Change Password:', owner.credentials?.mustChangePassword);
}

// Find all franchises
const franchises = await Franchise.find();
console.log('\n=== FRANCHISES ===');
console.log(`Found ${franchises.length} franchises`);

for (const franchise of franchises) {
  console.log('\n--- Franchise ---');
  console.log('ID:', franchise._id);
  console.log('Name:', franchise.name);
  console.log('Owner ID:', franchise.ownerId);
  console.log('Corporate ID:', franchise.corporateId);
  console.log('Status:', franchise.status);
}

// Check if franchise owners have franchise IDs
console.log('\n=== FRANCHISE OWNER - FRANCHISE MAPPING ===');
for (const owner of franchiseOwners) {
  const franchiseId = owner.roleSpecificData?.franchiseOwnerInfo?.franchiseId;
  if (franchiseId) {
    const franchise = await Franchise.findById(franchiseId);
    console.log(`${owner.personalInfo?.firstName} ${owner.personalInfo?.lastName} -> ${franchise?.name || 'Franchise not found'}`);
  } else {
    console.log(`${owner.personalInfo?.firstName} ${owner.personalInfo?.lastName} -> NO FRANCHISE ID`);
  }
}

await mongoose.disconnect();
console.log('\nDisconnected from MongoDB');


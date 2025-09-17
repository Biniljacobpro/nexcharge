import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

console.log('🔍 Checking NexCharge Environment Variables...');
console.log('');

// Check required variables
const requiredVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'EMAIL_USER',
  'EMAIL_APP_PASSWORD',
  'FRONTEND_URL'
];

console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('PASSWORD') || varName.includes('SECRET') ? '***SET***' : value}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

console.log('');

// Check optional variables
const optionalVars = [
  'PORT',
  'NODE_ENV',
  'CORS_ORIGIN'
];

console.log('📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚠️  ${varName}: NOT SET (using default)`);
  }
});

console.log('');

// Check email configuration specifically
console.log('📧 Email Configuration:');
if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
  console.log('✅ Email service is properly configured');
  console.log(`   From: ${process.env.EMAIL_USER}`);
  console.log(`   App Password: ***SET***`);
} else {
  console.log('❌ Email service is NOT properly configured');
  if (!process.env.EMAIL_USER) {
    console.log('   Missing: EMAIL_USER');
  }
  if (!process.env.EMAIL_APP_PASSWORD) {
    console.log('   Missing: EMAIL_APP_PASSWORD');
  }
}

console.log('');
console.log('🌐 Frontend URL:', process.env.FRONTEND_URL || 'NOT SET');
console.log('🔌 Port:', process.env.PORT || '4000 (default)');
console.log('🏗️  Environment:', process.env.NODE_ENV || 'development (default)');




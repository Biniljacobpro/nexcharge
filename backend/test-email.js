import dotenv from 'dotenv';
import { testEmailService } from './src/utils/emailService.js';

// Load environment variables
dotenv.config();

console.log('🧪 Testing NexCharge Email Service...');
console.log('📧 Email User:', process.env.EMAIL_USER);
console.log('🔑 Email App Password:', process.env.EMAIL_APP_PASSWORD ? '***SET***' : '❌ NOT SET');
console.log('🌐 Frontend URL:', process.env.FRONTEND_URL);
console.log('');

if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
  console.error('❌ Missing required environment variables!');
  console.error('Please set EMAIL_USER and EMAIL_APP_PASSWORD in your .env file');
  process.exit(1);
}

console.log('🚀 Attempting to send test email...');

testEmailService()
  .then((success) => {
    if (success) {
      console.log('✅ Test email sent successfully!');
      console.log('📬 Check your inbox for the test email');
    } else {
      console.log('❌ Failed to send test email');
    }
  })
  .catch((error) => {
    console.error('💥 Error testing email service:', error.message);
  })
  .finally(() => {
    process.exit(0);
  });


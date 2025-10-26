# NexCharge Deployment Guide

This guide explains how to deploy the NexCharge application on Vercel with separate frontend and backend deployments while maintaining local development capabilities.

## Prerequisites

1. Vercel account
2. MongoDB Atlas account
3. Cloudinary account
4. Razorpay account (for payment processing)
5. Google OAuth credentials
6. Email service credentials (SMTP or Gmail OAuth2)

## Environment Variables Setup

### Backend Environment Variables (.env.production)

Create the following environment variables in your Vercel project settings:

```env
# MongoDB Atlas Connection
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Secret
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_TTL=20m
JWT_REFRESH_TTL=7d

# CORS Configuration for Production
CORS_ORIGIN=https://nexcharge.vercel.app

# Port Configuration
PORT=3000

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

# Email Configuration
EMAIL_USER=your_email_user
EMAIL_APP_PASSWORD=your_email_app_password

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=your_cloudinary_url
```

### Frontend Environment Variables (.env.production)

```env
# API Base URL for Production
REACT_APP_API_BASE=https://nexcharge-qu9o.vercel.app

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id

# Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Deployment Steps

### 1. Backend Deployment (Vercel Serverless Functions)

1. Log in to your Vercel account
2. Create a new project
3. Import your repository
4. Configure the project:
   - Framework Preset: Other
   - Root Directory: backend
   - Build Command: `npm install`
   - Output Directory: `.`
5. Add environment variables in the "Environment Variables" section using the values from your [backend/.env](file:///d:/ajce_projects/NexCharge/backend/.env) file
6. Deploy the project

### 2. Frontend Deployment (Vercel Static Site)

1. Log in to your Vercel account
2. Create a new project
3. Import your repository
4. Configure the project:
   - Framework Preset: Create React App
   - Root Directory: frontend
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Add environment variables in the "Environment Variables" section using the values from your [frontend/.env](file:///d:/ajce_projects/NexCharge/frontend/.env) file
6. Deploy the project

## Local Development Configuration

### Backend Local Development

1. Ensure your [backend/.env](file:///d:/ajce_projects/NexCharge/backend/.env) file contains your local configuration
2. Run the backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

### Frontend Local Development

1. Ensure your [frontend/.env](file:///d:/ajce_projects/NexCharge/frontend/.env) file contains:
   ```env
   REACT_APP_API_BASE=http://localhost:4000
   ```
2. Run the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Domain Configuration

Your applications are hosted at:
- Frontend: https://nexcharge.vercel.app
- Backend: https://nexcharge-qu9o.vercel.app

The CORS configuration in the backend has been set to allow requests from both localhost (for development) and your production frontend domain.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS_ORIGIN includes your frontend domain
2. **Database Connection**: Verify MONGODB_URI is correctly set
3. **Image Uploads**: Check Cloudinary credentials
4. **Payments**: Verify Razorpay keys are correct

### Environment Variables Not Loading

1. Ensure environment variables are added in Vercel project settings, not just in .env files
2. Redeploy your application after adding environment variables

## Post-Deployment Verification

1. Test user registration and login
2. Verify Google OAuth integration
3. Test image uploads
4. Check payment processing
5. Validate email notifications
6. Confirm admin dashboard functionality

## Maintenance

1. Regularly update dependencies
2. Monitor error logs in Vercel dashboard
3. Check MongoDB Atlas performance
4. Review Cloudinary storage usage
5. Update SSL certificates for custom domains

This deployment strategy allows you to:
- Run separate frontend and backend deployments on Vercel
- Maintain full local development capabilities
- Scale independently
- Keep environment-specific configurations separate
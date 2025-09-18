import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import corporateRoutes from './routes/corporate.routes.js';
import franchiseOwnerRoutes from './routes/franchiseOwner.routes.js';
import stationManagerRoutes from './routes/stationManager.routes.js';
import publicRoutes from './routes/public.routes.js';
import bookingRoutes from './routes/booking.routes.js';
// Removed deprecated corporate application routes

// Ensure env is loaded from backend/.env or projectRoot/.env
const backendEnv = path.resolve(process.cwd(), '.env');
const projectRootEnv = path.resolve(process.cwd(), '..', '.env');
for (const p of [backendEnv, projectRootEnv]) {
	if (fs.existsSync(p)) {
		const content = fs.readFileSync(p, 'utf8');
		content.split('\n').forEach((line) => {
			const m = line.match(/^([A-Z0-9_]+)=(.*)$/i);
			if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
		});
	}
}

const app = express();

// CORS
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: corsOrigin, credentials: true }));

// Security & utils
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/corporate', corporateRoutes);
app.use('/api/franchise-owner', franchiseOwnerRoutes);
app.use('/api/station-manager', stationManagerRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/bookings', bookingRoutes);
// app.use('/api/corporates', corporateApplicationRoutes); // deprecated

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
	console.error(err);
	const status = err.status || 500;
	res.status(status).json({ error: err.message || 'Internal Server Error' });
});

// DB & server
const PORT = process.env.PORT || 4000;
(async () => {
	try {
		if (!process.env.MONGODB_URI) {
			throw new Error('MONGODB_URI is not set. Please add it to backend/.env or project root .env');
		}
		await mongoose.connect(process.env.MONGODB_URI);
		console.log('MongoDB connected');
		app.listen(PORT, () => console.log(`API listening on :${PORT}`));
	} catch (e) {
		console.error('Failed to start server', e);
		process.exit(1);
	}
})();


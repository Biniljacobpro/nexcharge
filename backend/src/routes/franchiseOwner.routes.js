import express from 'express';
import {
  testEndpoint,
  getDashboardData,
  getAnalytics,
  getStations,
  addStation,
  updateStation,
  deleteStation,
  getComplianceStatus,
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  changePassword,
  updateProfile
} from '../controllers/franchiseOwner.controller.js';
import { requireAuth, requireRole, enforcePasswordChange } from '../middlewares/auth.js';

const router = express.Router();

// Apply authentication and role middleware to all routes
router.use(requireAuth);
router.use(requireRole(['franchise_owner']));
router.use(enforcePasswordChange);

// Test route
router.get('/test', testEndpoint);

// Dashboard routes
router.get('/dashboard', getDashboardData);
router.get('/analytics', getAnalytics);

// Station management routes
router.get('/stations', getStations);
router.post('/stations', addStation);
router.put('/stations/:stationId', updateStation);
router.delete('/stations/:stationId', deleteStation);

// Station manager routes
import { getStationManagers, addStationManager, updateStationManager, deleteStationManager } from '../controllers/franchiseOwner.controller.js';
router.get('/managers', getStationManagers);
router.post('/managers', addStationManager);
router.put('/managers/:managerId', updateStationManager);
router.delete('/managers/:managerId', deleteStationManager);

// Compliance routes
router.get('/compliance', getComplianceStatus);

// Promotion management routes
router.get('/promotions', getPromotions);
router.post('/promotions', createPromotion);
router.put('/promotions/:promotionId', updatePromotion);
router.delete('/promotions/:promotionId', deletePromotion);

// Profile management routes
router.post('/change-password', changePassword);
router.put('/profile', updateProfile);

export default router;

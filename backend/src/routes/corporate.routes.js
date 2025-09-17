import { Router } from 'express';
import { requireAuth, enforcePasswordChange } from '../middlewares/auth.js';
import {
  getDashboardData,
  getAnalytics,
  getRecentBookings,
  getFranchiseOwners,
  addFranchiseOwner,
  updateFranchiseOwner,
  deleteFranchiseOwner
} from '../controllers/corporate.controller.js';

const router = Router();

// All routes require authentication and no pending password reset
router.use(requireAuth, enforcePasswordChange);

// Dashboard routes
router.get('/dashboard', getDashboardData);
router.get('/analytics', getAnalytics);
router.get('/bookings/recent', getRecentBookings);

// Franchise management routes
router.get('/franchises', getFranchiseOwners);
router.post('/franchises', addFranchiseOwner);
router.put('/franchises/:franchiseId', updateFranchiseOwner);
router.delete('/franchises/:franchiseId', deleteFranchiseOwner);


export default router;

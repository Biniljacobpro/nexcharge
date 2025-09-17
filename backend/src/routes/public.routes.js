import { Router } from 'express';
import { getPublicStations, getPublicStationById } from '../controllers/public.controller.js';

const router = Router();

// Public stations endpoint (no auth)
router.get('/stations', getPublicStations);
router.get('/stations/:id', getPublicStationById);

export default router;



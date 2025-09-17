import { Router } from 'express';
import { getPublicStations } from '../controllers/public.controller.js';

const router = Router();

// Public stations endpoint (no auth)
router.get('/stations', getPublicStations);

export default router;



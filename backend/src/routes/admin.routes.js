import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { overview, listUsers, addCorporateAdmin, listCorporateAdmins } from '../controllers/admin.controller.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/overview', overview);
router.get('/users', listUsers);
router.get('/corporate-admins', listCorporateAdmins);
router.post('/add-corporate-admin', addCorporateAdmin);

export default router;



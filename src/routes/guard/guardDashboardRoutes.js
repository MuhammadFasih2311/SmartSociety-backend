import express from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { getGuardDashboardStats } from '../../controllers/guard/guardDashboardController.js';

const router = express.Router();

router.get('/dashboard', authMiddleware, getGuardDashboardStats);

export default router;
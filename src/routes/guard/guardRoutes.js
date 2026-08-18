import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import guardSettingsRoutes from './guardSettingsRoutes.js';
import guardVisitorRoutes from './guardVisitorRoutes.js';
import guardGateRoutes from './guardGateRoutes.js';

const router = express.Router();

// ✅ All routes require authentication and guard role
router.use(authMiddleware);
router.use(authorize('guard'));

// ============================================
// GUARD SETTINGS ROUTES
// ============================================
router.use('/settings', guardSettingsRoutes);

// ============================================
// GUARD VISITOR ROUTES
// ============================================
router.use('/', guardVisitorRoutes);

// ============================================
// GUARD GATE ROUTES
// ============================================
router.use('/', guardGateRoutes);

export default router;
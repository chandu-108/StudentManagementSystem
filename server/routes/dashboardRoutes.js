import express from 'express';
import {
  getDashboardStats,
  getDashboardCharts
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorize('Admin'), getDashboardStats);
router.get('/charts', protect, authorize('Admin'), getDashboardCharts);

export default router;

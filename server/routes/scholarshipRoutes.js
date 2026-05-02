import express from 'express';
import {
  getScholarships,
  assignScholarship,
  updateStatus,
  sanctionScholarship,
  markReimbursed,
  getScholarshipStats,
} from '../controllers/scholarshipController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Dashboard stats — admin only
router.get('/dashboard/stats', protect, authorize('Admin'), getScholarshipStats);

// All scholarships (admin: all, others: own)
router.route('/')
  .get(protect, getScholarships)
  .post(protect, authorize('Admin'), assignScholarship);

// Change status (Selected / Not Selected) — admin only
router.patch('/:id/status', protect, authorize('Admin'), updateStatus);

// Sanction / reject — admin only
router.patch('/:id/sanction', protect, authorize('Admin'), sanctionScholarship);

// Mark reimbursed — admin only
router.patch('/:id/reimburse', protect, authorize('Admin'), markReimbursed);

export default router;

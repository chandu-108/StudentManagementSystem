import express from 'express';
import {
  markAttendance,
  getStudentAttendance,
  getDailyAttendance,
  bulkMarkAttendance,
  getOverallAttendance
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/overall', protect, authorize('Admin', 'Teacher'), getOverallAttendance);
router.get('/daily', protect, authorize('Admin', 'Teacher'), getDailyAttendance);
router.post('/bulk', protect, authorize('Admin', 'Teacher'), bulkMarkAttendance);
router.post('/mark', protect, authorize('Admin', 'Teacher'), markAttendance);
router.get('/:studentId', protect, getStudentAttendance);

export default router;

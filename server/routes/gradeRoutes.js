import express from 'express';
import {
  addGrade,
  getStudentGrades,
  getClassGrades,
  bulkSaveGrades
} from '../controllers/gradeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/class', protect, authorize('Admin', 'Teacher'), getClassGrades);
router.post('/bulk', protect, authorize('Admin', 'Teacher'), bulkSaveGrades);
router.post('/', protect, authorize('Admin', 'Teacher'), addGrade);
router.get('/:studentId', protect, getStudentGrades);

export default router;

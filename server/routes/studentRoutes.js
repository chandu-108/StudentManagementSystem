import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getStudents)
  .post(protect, authorize('Admin'), createStudent);

router.route('/:id')
  .get(protect, getStudentById)
  .put(protect, authorize('Admin'), updateStudent)
  .delete(protect, authorize('Admin'), deleteStudent);

export default router;

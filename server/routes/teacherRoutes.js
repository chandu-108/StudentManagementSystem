import express from 'express';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../controllers/teacherController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getTeachers);
router.post('/', protect, authorize('Admin'), createTeacher);
router.put('/:id', protect, authorize('Admin'), updateTeacher);
router.delete('/:id', protect, authorize('Admin'), deleteTeacher);

export default router;

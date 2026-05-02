import express from 'express';
import { register, login, refresh, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.put('/password', protect, changePassword);

export default router;

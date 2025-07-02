import express from 'express';
import { authController } from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.use(protect); // All routes after this middleware require authentication

router.get('/me', authController.getMe);
router.put('/change-password', authController.changePassword);
router.post('/logout', authController.logout);

export default router;
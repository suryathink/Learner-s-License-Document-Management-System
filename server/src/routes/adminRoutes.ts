import express from 'express';
import { adminController } from '../controllers/adminController';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

router.use(protect); // all admin routes are protected

// Dashboard and submissions
router.get('/dashboard', adminController.getDashboard);
router.get('/submissions', adminController.getSubmissions);
router.get('/submissions/:id', adminController.getSubmissionById);
router.put('/submissions/:id/status', adminController.updateSubmissionStatus);
router.delete('/submissions/:id', adminController.deleteSubmission);

// Admin management (Super Admin only)
router.get('/admins', authorize('super_admin'), adminController.getAllAdmins);
router.post('/admins', authorize('super_admin'), adminController.createAdmin);
router.put('/admins/:id', authorize('super_admin'), adminController.updateAdmin);
router.delete('/admins/:id', authorize('super_admin'), adminController.deactivateAdmin);

// Statistics
router.get('/stats', adminController.getStats);

export default router;
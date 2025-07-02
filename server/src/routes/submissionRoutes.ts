import express from 'express';
import { submissionController } from '../controllers/submissionController';
import { uploadDocuments } from '../middlewares/upload';

const router = express.Router();

// Public routes
router.post('/', uploadDocuments, submissionController.createSubmission);
router.get('/check/:submissionId', submissionController.checkSubmissionStatus);

export default router;
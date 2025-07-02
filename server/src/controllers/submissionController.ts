import { Request, Response, NextFunction } from 'express';
import { submissionService } from "../services/submissionService";
import { submissionValidationSchema, validateFileUpload } from '../helpers/validation'

class SubmissionController {
  async createSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const { error, value } = submissionValidationSchema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
        return;
      }

      // Validate file uploads
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const fileValidation = validateFileUpload(files);
      
      if (!fileValidation.isValid) {
        res.status(400).json({
          success: false,
          message: 'File validation error',
          errors: fileValidation.errors
        });
        return;
      }

      // Parse date of birth
      const submissionData = {
        ...value,
        dateOfBirth: new Date(value.dateOfBirth)
      };

      // Create submission
      const submission = await submissionService.createSubmission(submissionData, files);

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          submissionId: submission.submissionId,
          status: submission.status,
          submittedAt: submission.submittedAt
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async checkSubmissionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { submissionId } = req.params;

      if (!submissionId) {
        res.status(400).json({
          success: false,
          message: 'Submission ID is required'
        });
        return;
      }

      const submission = await submissionService.getSubmissionBySubmissionId(submissionId);

      if (!submission) {
        res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
        return;
      }

      // Return basic status information (no sensitive data)
      res.status(200).json({
        success: true,
        data: {
          submissionId: submission.submissionId,
          status: submission.status,
          submittedAt: submission.submittedAt,
          reviewedAt: submission.reviewedAt,
          applicantName: submission.fullName
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubmissionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Submission ID is required'
        });
        return;
      }

      const submission = await submissionService.getSubmissionById(id);

      if (!submission) {
        res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { submission }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const submissionController = new SubmissionController();
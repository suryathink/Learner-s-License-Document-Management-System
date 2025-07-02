import { Request, Response, NextFunction } from 'express';
// import { submissionService } from '@/services/submissionService';
import { submissionService } from '../services/submissionService';
import { adminService } from '../services/adminService';
import { statusUpdateSchema, submissionQuerySchema } from '../helpers/validation';
import { AuthRequest } from '../middlewares/auth';

class AdminController {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get statistics for dashboard
      const [submissionStats, adminStats] = await Promise.all([
        submissionService.getSubmissionStats(),
        adminService.getAdminStats()
      ]);

      // Get recent submissions
      const recentSubmissions = await submissionService.getSubmissions({
        page: 1,
        limit: 5,
        sortBy: 'submittedAt',
        sortOrder: 'desc'
      });

      res.status(200).json({
        success: true,
        data: {
          stats: {
            submissions: submissionStats,
            admins: adminStats
          },
          recentSubmissions: recentSubmissions.submissions
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubmissions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate query parameters
      const { error, value } = submissionQuerySchema.validate(req.query);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: error.details.map(detail => detail.message)
        });
        return;
      }

      const result = await submissionService.getSubmissions(value);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubmissionById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

  async updateSubmissionStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Submission ID is required'
        });
        return;
      }

      // Validate request body
      const { error, value } = statusUpdateSchema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
        return;
      }

      const { status, internalNotes } = value;
      const adminId = (req as any).admin!._id.toString();

      const updatedSubmission = await submissionService.updateSubmissionStatus(
        id,
        status,
        adminId,
        internalNotes
      );

      if (!updatedSubmission) {
        res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Submission status updated successfully',
        data: { submission: updatedSubmission }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSubmission(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Submission ID is required'
        });
        return;
      }

      // Only super admins can delete submissions
      if (req.admin!.role !== 'super_admin') {
        res.status(403).json({
          success: false,
          message: 'Only super admins can delete submissions'
        });
        return;
      }

      const success = await submissionService.deleteSubmission(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Submission deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllAdmins(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const admins = await adminService.getAllAdmins();

      res.status(200).json({
        success: true,
        data: { admins }
      });
    } catch (error) {
      next(error);
    }
  }

  async createAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password, role } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Username, email, and password are required'
        });
        return;
      }

      const admin = await adminService.register({
        username,
        email,
        password,
        role: role || 'admin'
      });

      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        data: { admin }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Admin ID is required'
        });
        return;
      }

      // Prevent updating own account role/status
      if (id === (req as any).admin!._id.toString()) {
        delete updateData.role;
        delete updateData.isActive;
      }

      const updatedAdmin = await adminService.updateAdmin(id, updateData);

      if (!updatedAdmin) {
        res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Admin updated successfully',
        data: { admin: updatedAdmin }
      });
    } catch (error) {
      next(error);
    }
  }

  async deactivateAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Admin ID is required'
        });
        return;
      }

      // Prevent deactivating own account
      if (id === (req as any).admin!._id.toString()) {
        res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own account'
        });
        return;
      }

      await adminService.deactivateAdmin(id);

      res.status(200).json({
        success: true,
        message: 'Admin deactivated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const [submissionStats, adminStats] = await Promise.all([
        submissionService.getSubmissionStats(),
        adminService.getAdminStats()
      ]);

      res.status(200).json({
        success: true,
        data: {
          submissions: submissionStats,
          admins: adminStats
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
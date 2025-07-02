import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/adminService';
import { emailService } from '../services/emailService';
import { adminLoginSchema } from '../helpers/validation';
import { AuthRequest } from '../middlewares/auth';
import dotenv from 'dotenv';

dotenv.config()

class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const { error, value } = adminLoginSchema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
        return;
      }

      const { admin, token } = await adminService.login(value);

      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          admin,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if this is the first admin (for initial setup)
      const adminCount = await adminService.getAllAdmins();
      
      if (adminCount.length > 0) {
        res.status(403).json({
          success: false,
          message: 'Admin registration is not allowed. Please contact existing admin.'
        });
        return;
      }

      const admin = await adminService.register({
        ...req.body,
        role: 'super_admin' // First admin should be super admin
      });

      res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        data: { admin }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: { admin: req.admin }
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
        return;
      }

      await adminService.changePassword(
        (req.admin as any)._id.toString(),
        currentPassword,
        newPassword
      );

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }

      const resetToken = await adminService.generatePasswordResetToken(email);
      await emailService.sendPasswordResetEmail(email, resetToken);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Token and new password are required'
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
        return;
      }

      await adminService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Clear the token cookie
      res.clearCookie('token');

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
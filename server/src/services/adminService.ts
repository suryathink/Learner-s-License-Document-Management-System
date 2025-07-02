import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Admin, { IAdmin } from "../models/Admin";
import { generateToken } from "../helpers/utils";
import dotenv from 'dotenv';

dotenv.config()
export interface AdminLoginData {
  username: string;
  password: string;
}

export interface AdminRegistrationData {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'super_admin';
}

class AdminService {
  async login(loginData: AdminLoginData): Promise<{ admin: IAdmin; token: string }> {
    try {
      const { username, password } = loginData;

      // Find admin by username
      const admin = await Admin.findOne({ username, isActive: true }).select('+password');
      
      if (!admin) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isPasswordMatch = await admin.comparePassword(password);
      
      if (!isPasswordMatch) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      // Generate token
      const token = generateToken((admin as any)._id.toString());

      // Remove password from response
      const adminResponse = admin.toJSON();

      return {
        admin: adminResponse as IAdmin,
        token
      };
    } catch (error) {
      console.error('Error during admin login:', error);
      throw error;
    }
  }

  async register(registrationData: AdminRegistrationData): Promise<IAdmin> {
    try {
      const { username, email, password, role = 'admin' } = registrationData;

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({
        $or: [{ username }, { email }]
      });

      if (existingAdmin) {
        throw new Error('Admin with this username or email already exists');
      }

      // Create new admin
      const admin = new Admin({
        username,
        email,
        password,
        role
      });

      await admin.save();

      return admin;
    } catch (error) {
      console.error('Error during admin registration:', error);
      throw error;
    }
  }

  async getAdminById(id: string): Promise<IAdmin | null> {
    try {
      return await Admin.findById(id).select('-password');
    } catch (error) {
      console.error('Error fetching admin:', error);
      throw new Error('Failed to fetch admin');
    }
  }

  async getAllAdmins(): Promise<IAdmin[]> {
    try {
      return await Admin.find({ isActive: true }).select('-password').sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw new Error('Failed to fetch admins');
    }
  }

  async updateAdmin(
    id: string,
    updateData: Partial<Pick<IAdmin, 'username' | 'email' | 'role' | 'isActive'>>
  ): Promise<IAdmin | null> {
    try {
      const admin = await Admin.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!admin) {
        throw new Error('Admin not found');
      }

      return admin;
    } catch (error) {
      console.error('Error updating admin:', error);
      throw new Error('Failed to update admin');
    }
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const admin = await Admin.findById(id).select('+password');
      
      if (!admin) {
        throw new Error('Admin not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      admin.password = newPassword;
      await admin.save();
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  async generatePasswordResetToken(email: string): Promise<string> {
    try {
      const admin = await Admin.findOne({ email, isActive: true });
      
      if (!admin) {
        throw new Error('No admin found with this email address');
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Create JWT token that expires in 1 hour
      const token = jwt.sign(
        { 
          adminId: admin._id,
          resetToken,
          purpose: 'password_reset'
        },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      return token;
    } catch (error) {
      console.error('Error generating password reset token:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      if (decoded.purpose !== 'password_reset') {
        throw new Error('Invalid token purpose');
      }

      const admin = await Admin.findById(decoded.adminId);
      
      if (!admin || !admin.isActive) {
        throw new Error('Invalid token or admin not found');
      }

      // Update password
      admin.password = newPassword;
      await admin.save();
    } catch (error) {
      console.error('Error resetting password:', error);
      
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid or expired token');
      }
      
      throw error;
    }
  }

  async deactivateAdmin(id: string): Promise<void> {
    try {
      const admin = await Admin.findById(id);
      
      if (!admin) {
        throw new Error('Admin not found');
      }

      admin.isActive = false;
      await admin.save();
    } catch (error) {
      console.error('Error deactivating admin:', error);
      throw new Error('Failed to deactivate admin');
    }
  }

  async getAdminStats() {
    try {
      const [totalAdmins, activeAdmins, recentLogins] = await Promise.all([
        Admin.countDocuments(),
        Admin.countDocuments({ isActive: true }),
        Admin.countDocuments({
          isActive: true,
          lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        })
      ]);

      return {
        total: totalAdmins,
        active: activeAdmins,
        recentLogins,
        inactive: totalAdmins - activeAdmins
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw new Error('Failed to fetch admin statistics');
    }
  }

  async verifyToken(token: string): Promise<IAdmin | null> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      const admin = await Admin.findById(decoded.id).select('-password');
      
      if (!admin || !admin.isActive) {
        return null;
      }

      return admin;
    } catch (error) {
      return null;
    }
  }
}

export const adminService = new AdminService();
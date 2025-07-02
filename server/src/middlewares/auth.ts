import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin , {IAdmin} from '../models/Admin';
import dotenv from 'dotenv';

dotenv.config()

export interface AuthRequest extends Request {
  admin?: IAdmin;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies (if using cookie-based auth)
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
      if (tokenCookie) {
        token = tokenCookie.split('=')[1];
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      
      // Get admin from database
      const admin = await Admin.findById(decoded.id).select('-password');
      
      if (!admin || !admin.isActive) {
        res.status(401).json({
          success: false,
          message: 'Not authorized to access this route'
        });
        return;
      }

      req.admin = admin;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
      return;
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to access this route'
      });
      return;
    }
    next();
  };
};
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/user.service';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        throw new AppError('User already exists with this email');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await this.userService.create({
        email,
        password: hashedPassword,
        firstName,
        lastName
      });

      // Generate token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new AppError('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials');
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  logout = (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
      });
    });
  };

  getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Not authenticated', 401);
      }

      const user = await this.userService.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;
      if (!token) {
        throw new AppError('No token provided', 401);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      const user = await this.userService.findById(decoded.userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const newToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(200).json({
        status: 'success',
        data: { token: newToken }
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const user = await this.userService.findByEmail(email);

      if (!user) {
        // Don't reveal whether a user exists
        res.status(200).json({
          status: 'success',
          message: 'If an account exists, a password reset email will be sent'
        });
        return;
      }

      // TODO: Implement email sending logic
      const resetToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      res.status(200).json({
        status: 'success',
        message: 'If an account exists, a password reset email will be sent',
        // In development, return the token
        ...(process.env.NODE_ENV === 'development' && { resetToken })
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      const user = await this.userService.findById(decoded.userId);

      if (!user) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await this.userService.updatePassword(user.id, hashedPassword);

      res.status(200).json({
        status: 'success',
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      next(error);
    }
  };
} 
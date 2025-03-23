import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';
import helmet from 'helmet';

// Rate limiting configuration
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: 'Too many login attempts, please try again after 15 minutes',
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: 'Too many requests from this IP, please try again after a minute',
});

// CSRF protection
export const csrfProtection = csrf({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: true,
  },
});

// CSRF error handler
export const csrfErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  res.status(403).json({ message: 'Invalid CSRF token' });
};

// Security headers middleware using helmet
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: true,
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
});

// Password complexity middleware
export const validatePasswordComplexity = (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.body;
  
  // Password requirements
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (
    password.length < minLength ||
    !hasUpperCase ||
    !hasLowerCase ||
    !hasNumbers ||
    !hasSpecialChar
  ) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters',
    });
  }

  next();
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (str: string) => {
    return str
      .replace(/[<>]/g, '') // Remove < and >
      .trim(); // Remove leading/trailing whitespace
  };

  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitize(req.body[key]);
      }
    });
  }

  next();
}; 
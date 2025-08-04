import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { JWTUtils, JWTError, JWTPayload } from '../utils/jwt';

// Extend Express Request to include user and files
export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  };
  file?: Express.Multer.File;
  files?: {
    [fieldname: string]: Express.Multer.File[];
  };
}

export interface AuthError {
  code: string;
  message: string;
  statusCode: number;
}

export class AuthenticationError extends Error {
  constructor(
    public code: string,
    public statusCode: number = 401,
    message?: string
  ) {
    super(message || 'Authentication failed');
    this.name = 'AuthenticationError';
  }
}

export const auth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      throw new AuthenticationError('NO_TOKEN', 401, 'No authentication token provided');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('INVALID_FORMAT', 401, 'Invalid token format. Use Bearer <token>');
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new AuthenticationError('EMPTY_TOKEN', 401, 'Token is empty');
    }

    // Verify the access token
    const decoded = JWTUtils.verifyAccessToken(token);
    
    // Find the user
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AuthenticationError('USER_NOT_FOUND', 401, 'User not found');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError('ACCOUNT_INACTIVE', 403, 'Account is inactive. Please contact church administration.');
    }

    req.user = {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive
    };
    
    next();
  } catch (error) {
    if (error instanceof JWTError) {
      const statusCode = error.code === 'TOKEN_EXPIRED' ? 401 : 401;
      res.status(statusCode).json({
        error: error.message,
        code: error.code,
        statusCode
      });
      return;
    }
    
    if (error instanceof AuthenticationError) {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.code,
        statusCode: error.statusCode
      });
    return;
  }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Internal server error during authentication',
      code: 'INTERNAL_ERROR',
      statusCode: 500
    });
  }
};

export const requireRole = (role: 'member' | 'admin' | 'pastor') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        statusCode: 401
      });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({ 
        error: `Access denied. This endpoint requires ${role} role`,
        code: 'INSUFFICIENT_PERMISSIONS',
        currentRole: req.user.role,
        requiredRole: role,
        statusCode: 403
      });
      return;
    }
    next();
  };
};

export const requireAdminOrPastor = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
      statusCode: 401
    });
    return;
  }

  if (!['admin', 'pastor'].includes(req.user.role)) {
    res.status(403).json({ 
      error: 'Access denied. This endpoint requires admin or pastor role',
      code: 'INSUFFICIENT_PERMISSIONS',
      currentRole: req.user.role,
      requiredRoles: ['admin', 'pastor'],
      statusCode: 403
    });
    return;
  }
  next();
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      next();
      return;
    }

    const decoded = JWTUtils.verifyAccessToken(token);
    const user = await User.findById(decoded.userId);
    
    if (user && user.isActive) {
      req.user = {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive
      };
    }
    
    next();
  } catch (error) {
    // For optional auth, we just continue without setting req.user
    next();
  }
};

// Rate limiting middleware for auth endpoints
export const authRateLimit = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  // This is a basic implementation. In production, you'd want to use a proper rate limiting library
  // like express-rate-limit or implement Redis-based rate limiting
  
  const clientIP = req.ip || req.connection.remoteAddress;
  const authAttempts = req.session?.authAttempts || 0;
  
  if (authAttempts > 5) {
    res.status(429).json({
      error: 'Too many authentication attempts. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429
    });
    return;
  }
  
  // Increment attempt counter (you'd implement this with proper session management)
  if (req.session) {
    req.session.authAttempts = authAttempts + 1;
  }
  
  next();
};


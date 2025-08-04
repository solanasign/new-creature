import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'member' | 'admin' | 'pastor';
  firstName: string;
  lastName: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JWTError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'JWTError';
  }
}

export class JWTUtils {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_SECRET as string;
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET as string;
  
  private static readonly ACCESS_TOKEN_EXPIRY = '1h'; // Shorter for church members
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';

  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    if (!this.ACCESS_TOKEN_SECRET) {
      throw new JWTError('JWT_SECRET not configured', 'CONFIG_ERROR');
    }

    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      issuer: 'new-creature-church',
      audience: 'church-members'
    });
  }

  static generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    if (!this.REFRESH_TOKEN_SECRET) {
      throw new JWTError('JWT_REFRESH_SECRET not configured', 'CONFIG_ERROR');
    }

    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
      issuer: 'new-creature-church',
      audience: 'church-members'
    });
  }

  static generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }

  static verifyAccessToken(token: string): JWTPayload {
    if (!this.ACCESS_TOKEN_SECRET) {
      throw new JWTError('JWT_SECRET not configured', 'CONFIG_ERROR');
    }

    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
        issuer: 'new-creature-church',
        audience: 'church-members'
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new JWTError('Access token expired', 'TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new JWTError('Invalid access token', 'INVALID_TOKEN');
      }
      throw new JWTError('Token verification failed', 'VERIFICATION_FAILED');
    }
  }

  static verifyRefreshToken(token: string): JWTPayload {
    if (!this.REFRESH_TOKEN_SECRET) {
      throw new JWTError('JWT_REFRESH_SECRET not configured', 'CONFIG_ERROR');
    }

    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
        issuer: 'new-creature-church',
        audience: 'church-members'
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new JWTError('Refresh token expired', 'TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new JWTError('Invalid refresh token', 'INVALID_TOKEN');
      }
      throw new JWTError('Token verification failed', 'VERIFICATION_FAILED');
    }
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }

  static getTokenExpiry(token: string): Date | null {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  }
}

// Convenience functions for backward compatibility
export const generateToken = (userId: string, email: string, role: 'member' | 'admin' | 'pastor', firstName: string, lastName: string): string => {
  return JWTUtils.generateAccessToken({ userId, email, role, firstName, lastName });
};

export const verifyToken = (token: string): JWTPayload => {
  return JWTUtils.verifyAccessToken(token);
};

export const generateTokenPair = (userId: string, email: string, role: 'member' | 'admin' | 'pastor', firstName: string, lastName: string): TokenPair => {
  return JWTUtils.generateTokenPair({ userId, email, role, firstName, lastName });
}; 
import { Response } from 'express';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { JWTUtils, JWTError } from '../utils/jwt';
import { AuthenticatedRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, role = 'member' } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Email, password, first name, and last name are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already registered',
        code: 'EMAIL_EXISTS'
      });
    }

    // Create new user with church-specific ID
    const userId = uuidv4();
    const user = new User({
      _id: userId,
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
    });

    await user.save();

    // Generate token pair
    const tokenPair = JWTUtils.generateTokenPair({
      userId: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Store refresh token
    await RefreshToken.createToken(
      user._id,
      tokenPair.refreshToken,
      7 * 24 * 60 * 60 // 7 days in seconds
    );

    return res.status(201).json({
      message: 'Registration successful. Welcome to New Creature in Christ Church!',
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        joinDate: user.joinDate,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      error: 'Error creating account. Please try again.',
      code: 'REGISTRATION_FAILED'
    });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        error: 'Account is inactive. Please contact church administration.',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate token pair
    const tokenPair = JWTUtils.generateTokenPair({
      userId: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Store refresh token
    await RefreshToken.createToken(
      user._id,
      tokenPair.refreshToken,
      7 * 24 * 60 * 60 // 7 days in seconds
    );

    return res.json({
      message: 'Login successful. Welcome back!',
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        joinDate: user.joinDate,
        baptismDate: user.baptismDate,
        address: user.address,
        ministryInvolvement: user.ministryInvolvement,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Error logging in. Please try again.',
      code: 'LOGIN_FAILED'
    });
  }
};

export const refreshToken = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    const decoded = JWTUtils.verifyRefreshToken(refreshToken);
    
    // Check if refresh token exists in database
    const storedToken = await RefreshToken.findValidToken(decoded.userId, refreshToken);
    if (!storedToken) {
      return res.status(401).json({ 
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'User not found or inactive',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new token pair
    const newTokenPair = JWTUtils.generateTokenPair({
      userId: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Revoke old refresh token and store new one
    await RefreshToken.revokeToken(refreshToken);
    await RefreshToken.createToken(
      user._id,
      newTokenPair.refreshToken,
      7 * 24 * 60 * 60 // 7 days in seconds
    );

    return res.json({
      message: 'Token refreshed successfully',
      accessToken: newTokenPair.accessToken,
      refreshToken: newTokenPair.refreshToken,
    });
  } catch (error) {
    if (error instanceof JWTError) {
      return res.status(401).json({ 
        error: error.message,
        code: error.code
      });
    }
    
    console.error('Refresh token error:', error);
    return res.status(500).json({ 
      error: 'Error refreshing token',
      code: 'REFRESH_FAILED'
    });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Revoke refresh token
      await RefreshToken.revokeToken(refreshToken);
    }

    return res.json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      error: 'Error during logout',
      code: 'LOGOUT_FAILED'
    });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        joinDate: user.joinDate,
        baptismDate: user.baptismDate,
        address: user.address,
        familyMembers: user.familyMembers,
        ministryInvolvement: user.ministryInvolvement,
        prayerRequests: user.prayerRequests,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ 
      error: 'Error retrieving profile',
      code: 'PROFILE_RETRIEVAL_FAILED'
    });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { firstName, lastName, phone, address, familyMembers, ministryInvolvement } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (address) user.address = address;
    if (familyMembers) user.familyMembers = familyMembers;
    if (ministryInvolvement) user.ministryInvolvement = ministryInvolvement;

    await user.save();

    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        joinDate: user.joinDate,
        baptismDate: user.baptismDate,
        address: user.address,
        familyMembers: user.familyMembers,
        ministryInvolvement: user.ministryInvolvement,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ 
      error: 'Error updating profile',
      code: 'PROFILE_UPDATE_FAILED'
    });
  }
};



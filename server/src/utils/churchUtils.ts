import { Request } from 'express';

// Church-specific date formatting
export const formatChurchDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatChurchTime = (time: string): string => {
  // Convert 24-hour format to 12-hour format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Church-specific role checking
export const isAdmin = (role: string): boolean => {
  return role === 'admin';
};

export const isPastor = (role: string): boolean => {
  return role === 'pastor';
};

export const isAdminOrPastor = (role: string): boolean => {
  return role === 'admin' || role === 'pastor';
};

export const isMember = (role: string): boolean => {
  return role === 'member';
};

// Church event type validation
export const isValidEventType = (type: string): boolean => {
  const validTypes = ['service', 'bible-study', 'prayer-meeting', 'youth-group', 'outreach', 'special-event'];
  return validTypes.includes(type);
};

// Church prayer request category validation
export const isValidPrayerCategory = (category: string): boolean => {
  const validCategories = ['personal', 'family', 'church', 'community', 'world'];
  return validCategories.includes(category);
};

// Church user role validation
export const isValidUserRole = (role: string): boolean => {
  const validRoles = ['member', 'admin', 'pastor'];
  return validRoles.includes(role);
};

// Generate church-specific IDs
export const generateChurchId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `church_${timestamp}_${randomStr}`;
};

// Church-specific error messages
export const CHURCH_ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  INVALID_ROLE: 'Invalid user role specified',
  EVENT_FULL: 'This event is at full capacity',
  ALREADY_REGISTERED: 'You are already registered for this event',
  NOT_REGISTERED: 'You are not registered for this event',
  PRAYER_REQUEST_NOT_FOUND: 'Prayer request not found',
  SERMON_NOT_FOUND: 'Sermon not found',
  EVENT_NOT_FOUND: 'Event not found',
  USER_NOT_FOUND: 'User not found',
  ACCOUNT_INACTIVE: 'Your account is inactive. Please contact church administration',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email is already registered',
  MISSING_FIELDS: 'Required fields are missing',
  VALIDATION_ERROR: 'Validation failed',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
  INTERNAL_ERROR: 'Internal server error'
};

// Church-specific success messages
export const CHURCH_SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Registration successful. Welcome to New Creature in Christ Church!',
  LOGIN_SUCCESS: 'Login successful. Welcome back!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  EVENT_CREATED: 'Event created successfully',
  EVENT_UPDATED: 'Event updated successfully',
  EVENT_DELETED: 'Event deleted successfully',
  EVENT_JOINED: 'Successfully joined event',
  EVENT_LEFT: 'Successfully left event',
  SERMON_CREATED: 'Sermon created successfully',
  SERMON_UPDATED: 'Sermon updated successfully',
  SERMON_DELETED: 'Sermon deleted successfully',
  PRAYER_REQUEST_CREATED: 'Prayer request created successfully',
  PRAYER_REQUEST_UPDATED: 'Prayer request updated successfully',
  PRAYER_REQUEST_DELETED: 'Prayer request deleted successfully',
  PRAYER_MARKED: 'Marked as prayed for',
  PRAYER_ANSWERED: 'Prayer request marked as answered',
  TOKEN_REFRESHED: 'Token refreshed successfully'
};

// Church-specific constants
export const CHURCH_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PASSWORD_LENGTH: 8,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_BIO_LENGTH: 500,
  MAX_FAMILY_MEMBERS: 10,
  MAX_MINISTRY_INVOLVEMENT: 5,
  MAX_PRAYER_REQUESTS: 50,
  ACCESS_TOKEN_EXPIRY: '1h',
  REFRESH_TOKEN_EXPIRY: '7d',
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100
};

// Church-specific validation rules
export const CHURCH_VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_REGEX: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE_REGEX: /^\+?1?\s*\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
  TIME_REGEX: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  DATE_REGEX: /^\d{4}-\d{2}-\d{2}$/
};

// Church-specific helper functions
export const sanitizeChurchData = (data: any): any => {
  if (typeof data === 'string') {
    return data.trim();
  }
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeChurchData(value);
    }
    return sanitized;
  }
  return data;
};

export const validateChurchDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && date > new Date('1900-01-01');
};

export const validateChurchTime = (timeString: string): boolean => {
  return CHURCH_VALIDATION_RULES.TIME_REGEX.test(timeString);
};

export const getChurchTimeZone = (): string => {
  return 'America/New_York'; // Default to Eastern Time
};

export const formatChurchDateTime = (date: Date, time?: string): string => {
  const formattedDate = formatChurchDate(date);
  if (time) {
    const formattedTime = formatChurchTime(time);
    return `${formattedDate} at ${formattedTime}`;
  }
  return formattedDate;
};

// Church-specific request helpers
export const getChurchUserFromRequest = (req: Request) => {
  return (req as any).user;
};

export const isChurchUserAuthenticated = (req: Request): boolean => {
  return !!(req as any).user;
};

export const getChurchUserRole = (req: Request): string | null => {
  const user = getChurchUserFromRequest(req);
  return user?.role || null;
};

export const canChurchUserAccess = (req: Request, requiredRole: string): boolean => {
  const userRole = getChurchUserRole(req);
  if (!userRole) return false;
  
  switch (requiredRole) {
    case 'admin':
      return isAdmin(userRole);
    case 'pastor':
      return isPastor(userRole);
    case 'adminOrPastor':
      return isAdminOrPastor(userRole);
    case 'member':
      return isMember(userRole);
    default:
      return false;
  }
}; 
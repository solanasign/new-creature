import { Request, Response, NextFunction } from 'express';

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export class ValidationError extends Error {
  constructor(public errors: ValidationErrorItem[]) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (minimum 8 characters, at least one letter and one number)
export const validatePassword = (password: string): boolean => {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
};

// Phone number validation (basic US format)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?1?\s*\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
  return phoneRegex.test(phone);
};

// Date validation
export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

// Validation middleware for user registration
export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName } = req.body;
  const errors: ValidationErrorItem[] = [];

  if (!email || !validateEmail(email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }

  if (!password || !validatePassword(password)) {
    errors.push({ 
      field: 'password', 
      message: 'Password must be at least 8 characters with at least one letter and one number' 
    });
  }

  if (!firstName || firstName.trim().length < 2) {
    errors.push({ field: 'firstName', message: 'First name must be at least 2 characters' });
  }

  if (!lastName || lastName.trim().length < 2) {
    errors.push({ field: 'lastName', message: 'Last name must be at least 2 characters' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors
    });
  }

  next();
};

// Validation middleware for event creation
export const validateEvent = (req: Request, res: Response, next: NextFunction) => {
  const { title, description, date, startTime, location, type } = req.body;
  const errors: ValidationErrorItem[] = [];

  if (!title || title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
  }

  if (!description || description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
  }

  if (!date || !validateDate(date)) {
    errors.push({ field: 'date', message: 'Valid date is required' });
  }

  if (!startTime || startTime.trim().length === 0) {
    errors.push({ field: 'startTime', message: 'Start time is required' });
  }

  if (!location || location.trim().length < 3) {
    errors.push({ field: 'location', message: 'Location must be at least 3 characters' });
  }

  const validTypes = ['service', 'bible-study', 'prayer-meeting', 'youth-group', 'outreach', 'special-event'];
  if (!type || !validTypes.includes(type)) {
    errors.push({ field: 'type', message: 'Valid event type is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors
    });
  }

  next();
};

// Validation middleware for sermon creation
export const validateSermon = (req: Request, res: Response, next: NextFunction) => {
  const { title, scripture, date, description } = req.body;
  const errors: ValidationErrorItem[] = [];

  if (!title || title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
  }

  if (!scripture || scripture.trim().length < 3) {
    errors.push({ field: 'scripture', message: 'Scripture reference is required' });
  }

  if (!date || !validateDate(date)) {
    errors.push({ field: 'date', message: 'Valid date is required' });
  }

  if (!description || description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors
    });
  }

  next();
};

// Validation middleware for prayer request creation
export const validatePrayerRequest = (req: Request, res: Response, next: NextFunction) => {
  const { title, description, category } = req.body;
  const errors: ValidationErrorItem[] = [];

  if (!title || title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
  }

  if (!description || description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
  }

  const validCategories = ['personal', 'family', 'church', 'community', 'world'];
  if (!category || !validCategories.includes(category)) {
    errors.push({ field: 'category', message: 'Valid category is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors
    });
  }

  next();
}; 
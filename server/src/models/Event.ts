import mongoose from 'mongoose';

export interface IEvent extends mongoose.Document {
  _id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime?: string;
  location: string;
  type: 'service' | 'bible-study' | 'prayer-meeting' | 'youth-group' | 'outreach' | 'special-event';
  isRecurring: boolean;
  recurringPattern?: 'weekly' | 'monthly' | 'yearly';
  recurringDay?: string; // For weekly events
  recurringDate?: number; // For monthly events
  isPublic: boolean; // Whether non-members can see this event
  maxAttendees?: number;
  currentAttendees: string[]; // Array of user IDs
  organizer: string; // User ID of organizer
  imageUrl?: string;
  contactInfo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['service', 'bible-study', 'prayer-meeting', 'youth-group', 'outreach', 'special-event'],
    required: true,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringPattern: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
  },
  recurringDay: {
    type: String,
    enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  },
  recurringDate: {
    type: Number,
    min: 1,
    max: 31,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  maxAttendees: {
    type: Number,
    min: 1,
  },
  currentAttendees: [{
    type: String,
    ref: 'User',
  }],
  organizer: {
    type: String,
    required: true,
    ref: 'User',
  },
  imageUrl: String,
  contactInfo: String,
  notes: String,
}, {
  timestamps: true,
});

// Indexes for efficient queries
eventSchema.index({ date: 1, type: 1 });
eventSchema.index({ isPublic: 1, date: 1 });
eventSchema.index({ organizer: 1 });

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  if (!this.maxAttendees) return false;
  return this.currentAttendees.length >= this.maxAttendees;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  if (!this.maxAttendees) return null;
  return Math.max(0, this.maxAttendees - this.currentAttendees.length);
});

// Method to add attendee
eventSchema.methods.addAttendee = function(userId: string): boolean {
  if (this.isFull) return false;
  if (this.currentAttendees.includes(userId)) return false;
  
  this.currentAttendees.push(userId);
  return true;
};

// Method to remove attendee
eventSchema.methods.removeAttendee = function(userId: string): boolean {
  const index = this.currentAttendees.indexOf(userId);
  if (index === -1) return false;
  
  this.currentAttendees.splice(index, 1);
  return true;
};

// Ensure virtual fields are serialized
eventSchema.set('toJSON', { virtuals: true });

export const Event = mongoose.model<IEvent>('Event', eventSchema); 
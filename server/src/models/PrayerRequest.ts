import mongoose from 'mongoose';

export interface IPrayerRequest extends mongoose.Document {
  _id: string;
  requester: string; // User ID of the person making the request
  title: string;
  description: string;
  category: 'personal' | 'family' | 'church' | 'community' | 'world';
  isAnonymous: boolean;
  isUrgent: boolean;
  isAnswered: boolean;
  answerNotes?: string;
  answeredDate?: Date;
  prayerCount: number; // Number of people praying for this request
  prayedBy: string[]; // Array of user IDs who have prayed
  isPublic: boolean; // Whether other members can see this request
  expiresAt?: Date; // Optional expiration date
  createdAt: Date;
  updatedAt: Date;
}

const prayerRequestSchema = new mongoose.Schema({
  requester: {
    type: String,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['personal', 'family', 'church', 'community', 'world'],
    required: true,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  isUrgent: {
    type: Boolean,
    default: false,
  },
  isAnswered: {
    type: Boolean,
    default: false,
  },
  answerNotes: String,
  answeredDate: Date,
  prayerCount: {
    type: Number,
    default: 0,
  },
  prayedBy: [{
    type: String,
    ref: 'User',
  }],
  isPublic: {
    type: Boolean,
    default: true,
  },
  expiresAt: Date,
}, {
  timestamps: true,
});

// Indexes for efficient queries
prayerRequestSchema.index({ requester: 1, createdAt: -1 });
prayerRequestSchema.index({ isPublic: 1, createdAt: -1 });
prayerRequestSchema.index({ category: 1, isUrgent: 1 });
prayerRequestSchema.index({ isAnswered: 1, createdAt: -1 });
prayerRequestSchema.index({ expiresAt: 1 });

// Method to mark as prayed for by a user
prayerRequestSchema.methods.markAsPrayedFor = function(userId: string): boolean {
  if (this.prayedBy.includes(userId)) return false;
  
  this.prayedBy.push(userId);
  this.prayerCount = this.prayedBy.length;
  return true;
};

// Method to unmark as prayed for by a user
prayerRequestSchema.methods.unmarkAsPrayedFor = function(userId: string): boolean {
  const index = this.prayedBy.indexOf(userId);
  if (index === -1) return false;
  
  this.prayedBy.splice(index, 1);
  this.prayerCount = this.prayedBy.length;
  return true;
};

// Method to mark as answered
prayerRequestSchema.methods.markAsAnswered = function(notes?: string): void {
  this.isAnswered = true;
  this.answeredDate = new Date();
  if (notes) {
    this.answerNotes = notes;
  }
};

// Virtual for checking if request is expired
prayerRequestSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual for days since creation
prayerRequestSchema.virtual('daysSinceCreation').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
prayerRequestSchema.set('toJSON', { virtuals: true });

export const PrayerRequest = mongoose.model<IPrayerRequest>('PrayerRequest', prayerRequestSchema); 
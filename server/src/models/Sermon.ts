import mongoose from 'mongoose';

export interface ISermon extends mongoose.Document {
  _id: string;
  title: string;
  scripture: string;
  preacher: string; // User ID of the preacher
  date: Date;
  description: string;
  videoUrl?: string;
  audioUrl?: string;
  transcript?: string;
  notes?: string;
  tags: string[];
  isPublic: boolean;
  viewCount: number;
  duration?: number; // in minutes
  series?: string; // If part of a sermon series
  seriesPart?: number;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sermonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  scripture: {
    type: String,
    required: true,
    trim: true,
  },
  preacher: {
    type: String,
    required: true,
    ref: 'User',
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  videoUrl: String,
  audioUrl: String,
  transcript: String,
  notes: String,
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number,
    min: 1,
  },
  series: String,
  seriesPart: {
    type: Number,
    min: 1,
  },
  thumbnailUrl: String,
}, {
  timestamps: true,
});

// Indexes for efficient queries
sermonSchema.index({ date: -1 });
sermonSchema.index({ preacher: 1, date: -1 });
sermonSchema.index({ isPublic: 1, date: -1 });
sermonSchema.index({ tags: 1 });
sermonSchema.index({ series: 1, seriesPart: 1 });

// Method to increment view count
sermonSchema.methods.incrementViewCount = function(): void {
  this.viewCount += 1;
};

// Virtual for formatted date
sermonSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for duration in readable format
sermonSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return null;
  
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Ensure virtual fields are serialized
sermonSchema.set('toJSON', { virtuals: true });

export const Sermon = mongoose.model<ISermon>('Sermon', sermonSchema); 
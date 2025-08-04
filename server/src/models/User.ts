import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'member' | 'admin' | 'pastor';
  isActive: boolean;
  joinDate: Date;
  baptismDate?: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  familyMembers?: string[];
  ministryInvolvement?: string[];
  prayerRequests?: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['member', 'admin', 'pastor'],
    default: 'member',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  baptismDate: {
    type: Date,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  familyMembers: [String],
  ministryInvolvement: [String],
  prayerRequests: [String],
}, {
  timestamps: true,
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

export const User = mongoose.model<IUser>('User', userSchema);




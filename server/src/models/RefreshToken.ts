import mongoose from 'mongoose';

export interface IRefreshToken extends mongoose.Document {
  _id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create a new refresh token
refreshTokenSchema.statics.createToken = async function(
  userId: string, 
  token: string, 
  expiresIn: number
): Promise<IRefreshToken> {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  
  return this.create({
    userId,
    token,
    expiresAt
  });
};

// Static method to find valid token
refreshTokenSchema.statics.findValidToken = async function(
  userId: string, 
  token: string
): Promise<IRefreshToken | null> {
  return this.findOne({
    userId,
    token,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });
};

// Static method to revoke all tokens for a user
refreshTokenSchema.statics.revokeAllForUser = async function(userId: string): Promise<void> {
  await this.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true }
  );
};

// Static method to revoke a specific token
refreshTokenSchema.statics.revokeToken = async function(token: string): Promise<void> {
  await this.updateOne(
    { token },
    { isRevoked: true }
  );
};

// Static method to clean up expired tokens
refreshTokenSchema.statics.cleanupExpired = async function(): Promise<number> {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  return result.deletedCount || 0;
};

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema); 
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  emailVerified?: Date;
  favorites: string[];
  recently_viewed: string[];
  preferences: {
    default_mood?: string;
    default_radius?: number;
    preferred_price_levels?: number[];
    location?: { lat: number; lng: number };
    notifications?: boolean;
  };
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    image: { type: String },
    emailVerified: { type: Date },
    favorites: { type: [String], default: [] },
    recently_viewed: { type: [String], default: [] },
    preferences: {
      default_mood: { type: String },
      default_radius: { type: Number, default: 1500 },
      preferred_price_levels: { type: [Number], default: [1, 2, 3] },
      location: {
        lat: { type: Number },
        lng: { type: Number },
      },
      notifications: { type: Boolean, default: true },
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

UserSchema.index({ email: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

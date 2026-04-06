import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISavedCafe extends Document {
  user_id: string;
  place_id: string;
  name: string;
  address: string;
  rating: number;
  photo_url?: string;
  coordinates: { lat: number; lng: number };
  saved_at: Date;
}

const SavedCafeSchema = new Schema<ISavedCafe>(
  {
    user_id: { type: String, required: true, index: true },
    place_id: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    rating: { type: Number, default: 0 },
    photo_url: { type: String },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    saved_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

SavedCafeSchema.index({ user_id: 1, place_id: 1 }, { unique: true });

const SavedCafe: Model<ISavedCafe> =
  mongoose.models.SavedCafe || mongoose.model<ISavedCafe>('SavedCafe', SavedCafeSchema);

export default SavedCafe;

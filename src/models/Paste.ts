import mongoose, { Document, Schema } from 'mongoose';

export interface IPaste extends Document {
  content: string;
  max_views?: number;
  remaining_views?: number; // Can be null/undefined if unlimited
  expires_at?: Date;        // Can be null/undefined if no TTL
  created_at: Date;
}

const PasteSchema: Schema = new Schema({
  content: { type: String, required: true },
  max_views: { type: Number },
  remaining_views: { type: Number }, // We will manage this manually
  expires_at: { type: Date },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<IPaste>('Paste', PasteSchema);

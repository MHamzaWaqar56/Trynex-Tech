import mongoose, { Schema, models, model } from 'mongoose';

// One-time token sent to client via email to submit a testimonial
const ReviewTokenSchema = new Schema(
  {
    token:     { type: String, required: true, unique: true, index: true },
    email:     { type: String, required: true },
    clientName:{ type: String, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true },
    projectTitle: { type: String, required: true },
    used:      { type: Boolean, default: false, index: true },
    expiresAt: { type: Date, required: true, expires: 86400 },
  },
  { timestamps: true },
);

export const ReviewToken = models.ReviewToken || model('ReviewToken', ReviewTokenSchema);
export type ReviewTokenDocument = mongoose.InferSchemaType<typeof ReviewTokenSchema>;
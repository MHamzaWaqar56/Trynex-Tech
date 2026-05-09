import mongoose, { Schema, models, model } from 'mongoose';

const ConsultationSlotSchema = new Schema(
  {
    date: { type: String, required: true },   // "2025-08-15"
    time: { type: String, required: true },   // "10:00"
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    service: { type: String, required: true },
    message: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

// Ensure same date+time cannot be booked twice
ConsultationSlotSchema.index({ date: 1, time: 1 }, { unique: true });

export const ConsultationSlot =
  models.ConsultationSlot || model('ConsultationSlot', ConsultationSlotSchema);

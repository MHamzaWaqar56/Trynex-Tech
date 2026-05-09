import mongoose, { Schema, models, model } from "mongoose";

const NewsletterSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    active: { type: Boolean, default: true, index: true },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const Newsletter = models.Newsletter || model("Newsletter", NewsletterSchema);
export type NewsletterDocument = mongoose.InferSchemaType<typeof NewsletterSchema>;

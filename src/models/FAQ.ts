import mongoose, { Schema, models, model } from "mongoose";

const FAQSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    answer:   { type: String, required: true, trim: true },
    order:    { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const FAQ = models.FAQ || model("FAQ", FAQSchema);
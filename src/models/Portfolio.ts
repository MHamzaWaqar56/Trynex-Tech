import mongoose, { Schema, models, model } from "mongoose";

const PortfolioSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    client: { type: String, required: true },
    service: { type: String, required: true },
    description: { type: String, required: true },
    results: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    images: [{ type: String }],
    tech: [{ type: String }],
    featured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 1, index: true },
  },
  { timestamps: true },
);

export const Portfolio = models.Portfolio || model("Portfolio", PortfolioSchema);
export type PortfolioDocument = mongoose.InferSchemaType<typeof PortfolioSchema>;

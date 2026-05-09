import mongoose, { Schema, models, model } from "mongoose";

const ServicePackageSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Schema.Types.Mixed, required: true },
    period: { type: String, required: true },
    description: { type: String, required: true },
    features: [{ type: String }],
    highlighted: { type: Boolean, default: false },
    cta: { type: String },
  },
  { _id: false },
);

const ServiceSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    coverImage: { type: String, required: true },
    summary: { type: String, required: true },
    bullets: [{ type: String }],
    tags: [{ type: String }],
    details: { type: String, required: true },
    packages: { type: [ServicePackageSchema], default: [] },
    featured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 1, index: true },
  },
  { timestamps: true },
);

export const Service = models.Service || model("Service", ServiceSchema);
export type ServiceDocument = mongoose.InferSchemaType<typeof ServiceSchema>;

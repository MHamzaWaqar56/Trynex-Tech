import mongoose, { Schema, models, model } from "mongoose";

const LeadSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String },
    company: { type: String },
    service: { type: String, required: true },
    budget: { type: String },
    deadline: { type: String },
    message: { type: String, required: true },
    leadType: { type: String, enum: ["consultation", "quote", "custom-pricing"], required: true },
    status: { type: String, enum: ["new", "contacted", "in-progress", "done", "closed"], default: "new", index: true },
  },
  { timestamps: true },
);

export const Lead = models.Lead || model("Lead", LeadSchema);
export type LeadDocument = mongoose.InferSchemaType<typeof LeadSchema>;

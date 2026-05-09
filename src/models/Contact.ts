import mongoose, { Schema, models, model } from "mongoose";

const ContactSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String },
    company: { type: String },
    service: { type: String },
    budget: { type: String },
    deadline: { type: String },
    message: { type: String, required: true },
    subject: { type: String },
    inquiryType: { type: String, enum: ["message", "lead"], default: "message", index: true },
    status: { type: String, default: "new", index: true },
  },
  { timestamps: true },
);

export const Contact = models.Contact || model("Contact", ContactSchema);
export type ContactDocument = mongoose.InferSchemaType<typeof ContactSchema>;

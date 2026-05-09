import mongoose, { Schema, models, model } from "mongoose";

const CareerApplicationSchema = new Schema(
  {
    vacancyId: { type: Schema.Types.ObjectId, ref: "CareerVacancy", required: true, index: true },
    vacancySlug: { type: String, required: true, index: true },
    vacancyTitle: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    linkedin: { type: String },
    portfolioUrl: { type: String },
    yearsOfExperience: { type: String },
    coverLetter: { type: String, required: true },
    cvUrl: { type: String, required: true },
    cvName: { type: String },
    status: { type: String, default: "new", index: true },
  },
  { timestamps: true },
);

export const CareerApplication = models.CareerApplication || model("CareerApplication", CareerApplicationSchema);
export type CareerApplicationDocument = mongoose.InferSchemaType<typeof CareerApplicationSchema>;

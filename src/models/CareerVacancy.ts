import mongoose, { Schema, models, model } from "mongoose";

const CareerVacancySchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    department: { type: String, required: true },
    location: { type: String, required: true },
    employmentType: { type: String, required: true },
    salary: { type: String },
    description: { type: String, required: true },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    perks: [{ type: String }],
    applicationDeadline: { type: String },
    featured: { type: Boolean, default: false, index: true },
    open: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 1, index: true },
  },
  { timestamps: true },
);

export const CareerVacancy = models.CareerVacancy || model("CareerVacancy", CareerVacancySchema);
export type CareerVacancyDocument = mongoose.InferSchemaType<typeof CareerVacancySchema>;

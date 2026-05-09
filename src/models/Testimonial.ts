import mongoose, { Schema, models, model } from "mongoose";

const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    company: { type: String, required: true },
    role: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
    service: { type: String },
    approved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const Testimonial = models.Testimonial || model("Testimonial", TestimonialSchema);
// export const Testimonial = model("Testimonial", TestimonialSchema);
export type TestimonialDocument = mongoose.InferSchemaType<typeof TestimonialSchema>;

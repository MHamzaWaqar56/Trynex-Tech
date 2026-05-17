import mongoose, { Schema, models, model } from "mongoose";

const CourseEnrollRequestSchema = new Schema(
  {
    courseId:    { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    courseTitle: { type: String, required: true },
    courseSlug:  { type: String, required: true },
    name:        { type: String, required: true },
    email:       { type: String, required: true },
    phone:       { type: String },
    city:        { type: String },
    education:   { type: String },
    experience:  { type: String },
    message:     { type: String },
    status:      { type: String, enum: ['new', 'read', 'contacted', 'enrolled', 'rejected'], default: 'new', index: true },
  },
  { timestamps: true },
);

export const CourseEnrollRequest = models.CourseEnrollRequest || model("CourseEnrollRequest", CourseEnrollRequestSchema);
export type CourseEnrollRequestDocument = mongoose.InferSchemaType<typeof CourseEnrollRequestSchema>;
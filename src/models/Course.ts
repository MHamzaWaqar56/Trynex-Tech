import mongoose, { Schema, models, model } from "mongoose";


const CourseFeeSchema = new Schema(
  {
    label:       { type: String, required: true },  // e.g. "One-time", "Monthly"
    amount:      { type: Schema.Types.Mixed, required: true }, // number or "Free"
    currency:    { type: String, default: "PKR" },
    description: { type: String },
  },
  { _id: false },
);

const CourseCurriculumSchema = new Schema(
  {
    week:    { type: String, required: true }, // e.g. "Week 1-2"
    topic:   { type: String, required: true },
    details: { type: String },
  },
  { _id: false },
);

const CourseSchema = new Schema(
  {
    title:          { type: String, required: true, trim: true },
    slug:           { type: String, required: true, unique: true, index: true },
    coverImage:     { type: String, required: true },
    summary:        { type: String, required: true },
    description:    { type: String, required: true },
    category:       { type: String, required: true }, // e.g. "Web Development", "AI"
    level:          { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], default: 'All Levels' },
    language:       { type: String, default: 'English' },
    duration:       { type: String, required: true }, // e.g. "3 Months", "6 Weeks"
    hoursPerWeek:   { type: String },               // e.g. "8-10 hours/week"
    totalLectures:  { type: Number },
    instructor:     { type: Schema.Types.ObjectId, ref: 'TeamMember', required: true },
    fees:           { type: [CourseFeeSchema], default: [] },
    curriculum:     { type: [CourseCurriculumSchema], default: [] },
    learningPoints: [{ type: String }],             // what you will learn
    requirements:   [{ type: String }],             // prerequisites
    tags:           [{ type: String }],
    featured:       { type: Boolean, default: false, index: true },
    isActive:       { type: Boolean, default: true, index: true },
    order:          { type: Number, default: 1, index: true },
    enrollmentLink: { type: String },               // optional external link
  },
  { timestamps: true },
);

export const Course = models.Course || model("Course", CourseSchema);
export type CourseDocument = mongoose.InferSchemaType<typeof CourseSchema>;
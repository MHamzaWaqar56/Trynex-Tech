import mongoose, { Schema, models, model } from "mongoose";

const TeamMemberSchema = new Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    coverText: { type: String, required: true },
    image: { type: String, required: true },
    facebook: { type: String },
    email: { type: String },
    linkedin: { type: String },
    github: { type: String },
    order: { type: Number, default: 1, index: true },
  },
  { timestamps: true },
);

export const TeamMember = models.TeamMember || model("TeamMember", TeamMemberSchema);
export type TeamMemberDocument = mongoose.InferSchemaType<typeof TeamMemberSchema>;

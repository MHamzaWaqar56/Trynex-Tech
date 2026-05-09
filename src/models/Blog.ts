import mongoose, { Schema, models, model } from "mongoose";

const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String },
    content: { type: String, required: true },
    tags: [{ type: String }],
    author: { type: String },
    published: { type: Boolean, default: true, index: true },
    coverImage: { type: String },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Blog = models.Blog || model("Blog", BlogSchema);
export type BlogDocument = mongoose.InferSchemaType<typeof BlogSchema>;

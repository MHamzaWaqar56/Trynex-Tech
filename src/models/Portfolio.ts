import mongoose, { Schema, models, model } from "mongoose";

const PortfolioSchema = new Schema(
  {
    title:        { type: String, required: true },
    slug:         { type: String, required: true, unique: true, index: true },
    client:       { type: String, required: true },
    builtBy:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember' }],
    testimonial:  { type: mongoose.Schema.Types.ObjectId, ref: 'Testimonial', default: null },
    service:      { type: String, required: true },
    description:  { type: String, required: true },
    problem:      { type: String, default: '' },
    solution:     { type: String, default: '' },
    results:      { type: String, default: '' },
    images:       [{ type: String }],
    tech:         [{ type: String }],
    featured:     { type: Boolean, default: false, index: true },
    order:        { type: Number, default: 1, index: true },
  },
  { timestamps: true },
);

// Force clear cached model so schema changes take effect
if (models.Portfolio) {
  delete (mongoose.connection.models as Record<string, unknown>)['Portfolio'];
}

export const Portfolio = model("Portfolio", PortfolioSchema);
export type PortfolioDocument = mongoose.InferSchemaType<typeof PortfolioSchema>;
import mongoose, { Schema, models, model } from "mongoose";

const TrackEventSchema = new Schema(
  {
    event: { type: String, required: true, index: true },
    path: { type: String },
    referrer: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export const TrackEvent = models.TrackEvent || model("TrackEvent", TrackEventSchema);
export type TrackEventDocument = mongoose.InferSchemaType<typeof TrackEventSchema>;

import mongoose, { Schema, models, model } from 'mongoose';

// Singleton document — sirf ek row hogi key='main'
const SiteStatsSchema = new Schema(
  {
    key:              { type: String, required: true, unique: true, default: 'main' },
    happyClients:     { type: Number, required: true, default: 80,  min: 0 },
    projectsCompleted:{ type: Number, required: true, default: 250, min: 0 },
    clientRetention:  { type: Number, required: true, default: 98,  min: 0, max: 100 },
    // Founded year — years experience is auto-calculated: currentYear - foundedYear
    foundedYear:      { type: Number, required: true, default: 2020, min: 2000 },
  },
  { timestamps: true },
);

export const SiteStats = models.SiteStats || model('SiteStats', SiteStatsSchema);
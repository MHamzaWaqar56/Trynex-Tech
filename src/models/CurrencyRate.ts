import mongoose, { Schema, models, model } from 'mongoose';

const CurrencyRateSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'usd-to-pkr' },
    usdToPkrRate: { type: Number, required: true, default: 280, min: 0.01 },
  },
  { timestamps: true },
);

export const CurrencyRate = models.CurrencyRate || model('CurrencyRate', CurrencyRateSchema);

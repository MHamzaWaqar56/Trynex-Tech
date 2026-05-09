import { connectDB } from '@/lib/db';
import { CurrencyRate } from '@/models/CurrencyRate';

export const dynamic = 'force-dynamic';

type CurrencyRateRecord = {
  usdToPkrRate?: number;
  updatedAt?: Date | string | null;
};

export async function GET() {
  try {
    await connectDB();
    const record = await CurrencyRate.findOne({ key: 'usd-to-pkr' }).lean() as CurrencyRateRecord | null;
    return Response.json({ rate: record?.usdToPkrRate || 280, updatedAt: record?.updatedAt || null });
  } catch (error) {
    console.error('/api/currency-rate GET error:', error);
    return Response.json({ rate: 280, updatedAt: null });
  }
}

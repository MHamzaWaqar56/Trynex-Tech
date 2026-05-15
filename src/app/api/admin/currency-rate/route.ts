import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { fail, ok, readJson, requireAdmin } from '@/lib/backend/route-utils';
import { CurrencyRate } from '@/models/CurrencyRate';
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

type CurrencyRateRecord = {
  usdToPkrRate?: number;
  updatedAt?: Date | string | null;
};

const currencyRateSchema = z.object({
  usdToPkrRate: z.coerce.number().positive(),
});

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return fail('Unauthorized', 401);
    }

    await connectDB();
    const record = await CurrencyRate.findOne({ key: 'usd-to-pkr' }).lean() as CurrencyRateRecord | null;
    return ok({ rate: record?.usdToPkrRate || 280, updatedAt: record?.updatedAt || null });
  } catch (error) {
    console.error('/api/admin/currency-rate GET error:', error);
    return fail('Internal Server Error', 500);
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return fail('Unauthorized', 401);
    }

    const body = await readJson<unknown>(request);
    const parsed = currencyRateSchema.safeParse(body);
    if (!parsed.success) {
      return fail('Invalid currency rate payload.', 400, { issues: parsed.error.flatten() });
    }

    await connectDB();
    const record = await CurrencyRate.findOneAndUpdate(
      { key: 'usd-to-pkr' },
      { key: 'usd-to-pkr', usdToPkrRate: parsed.data.usdToPkrRate },
      { new: true, upsert: true },
    ).lean() as CurrencyRateRecord | null;
 
    revalidatePath('/pricing');
    revalidatePath('/services');
    return ok({ rate: record?.usdToPkrRate || parsed.data.usdToPkrRate, updatedAt: record?.updatedAt || null });
  } catch (error) {
    console.error('/api/admin/currency-rate PUT error:', error);
    return fail('Internal Server Error', 500);
  }
}

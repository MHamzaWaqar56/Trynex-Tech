import { connectDB } from '@/lib/db';
import { CareerVacancy } from '@/models/CareerVacancy';
import { ok, fail } from '@/lib/backend/route-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const vacancies = await CareerVacancy.find({ open: true }).sort({ featured: -1, order: 1, createdAt: -1 }).lean();
    return ok({ vacancies });
  } catch (error) {
    console.error('/api/careers GET error:', error);
    return fail('Internal Server Error', 500);
  }
}

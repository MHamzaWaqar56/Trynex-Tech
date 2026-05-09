import { connectDB } from '@/lib/db';
import { CareerVacancy } from '@/models/CareerVacancy';
import { ok, fail } from '@/lib/backend/route-utils';

export const dynamic = 'force-dynamic';

type Params = { slug: string };

export async function GET(_: Request, { params }: { params: Promise<Params> }) {
  try {
    const { slug } = await params;
    await connectDB();
    const vacancy = await CareerVacancy.findOne({ slug, open: true }).lean();

    if (!vacancy) {
      return fail('Vacancy not found.', 404);
    }

    return ok({ vacancy });
  } catch (error) {
    console.error('/api/careers/[slug] GET error:', error);
    return fail('Internal Server Error', 500);
  }
}

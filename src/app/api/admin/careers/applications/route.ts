import { connectDB } from '@/lib/db';
import { fail, ok, requireAdmin } from '@/lib/backend/route-utils';
import { CareerApplication } from '@/models/CareerApplication';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return fail('Unauthorized', 401);
    }

    await connectDB();
    const applications = await CareerApplication.find({}).sort({ createdAt: -1 }).lean();
    return ok({ applications });
  } catch (error) {
    console.error('/api/admin/careers/applications GET error:', error);
    return fail('Internal Server Error', 500);
  }
}

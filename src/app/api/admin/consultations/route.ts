import { connectDB } from '@/lib/db';
import { fail, ok, requireAdmin } from '@/lib/backend/route-utils';
import { ConsultationSlot } from '@/models/ConsultationSlot';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return fail('Unauthorized', 401);
    }

    await connectDB();
    const consultations = await ConsultationSlot.find({}).sort({ date: -1, time: -1, createdAt: -1 }).lean();
    return ok({ consultations });
  } catch (error) {
    console.error('/api/admin/consultations GET error:', error);
    return fail('Internal Server Error', 500);
  }
}

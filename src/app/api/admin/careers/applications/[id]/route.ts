import { connectDB } from '@/lib/db';
import { fail, ok, readJson, requireAdmin } from '@/lib/backend/route-utils';
import { CareerApplication } from '@/models/CareerApplication';
import { buildApplicationStatusEmail, sendEmailIfConfigured } from '@/lib/backend/email';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

type Params = { id: string };

const applicationStatusSchema = z.object({
  status: z.enum(['new', 'reviewed', 'shortlisted', 'rejected', 'hired']),
});

export async function PUT(request: Request, { params }: { params: Promise<Params> }) {
  try {
    if (!(await requireAdmin())) {
      return fail('Unauthorized', 401);
    }

    const body = await readJson<unknown>(request);
    const parsed = applicationStatusSchema.safeParse(body);
    if (!parsed.success) {
      return fail('Invalid application payload.', 400, { issues: parsed.error.flatten() });
    }

    await connectDB();
    const { id } = await params;
    const application = await CareerApplication.findByIdAndUpdate(id, { status: parsed.data.status }, { new: true }).exec();

    if (!application) {
      return fail('Application not found.', 404);
    }

    try {
      const statusLabel = parsed.data.status.replace(/-/g, ' ');
      const { html } = buildApplicationStatusEmail({
  fullName: application.fullName,
  vacancyTitle: application.vacancyTitle,
  status: parsed.data.status,
});

await sendEmailIfConfigured({
  to: application.email,
  replyTo: process.env.CONTACT_TO_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  subject: `Your application status for ${application.vacancyTitle} has been updated`,
  text: `Hi ${application.fullName}, your application status has been updated to ${parsed.data.status}.`,
  html,
});
    } catch (emailError) {
      console.error('/api/admin/careers/applications/[id] status email error:', emailError);
    }

    return ok({ application });
  } catch (error) {
    console.error('/api/admin/careers/applications/[id] PUT error:', error);
    return fail('Internal Server Error', 500);
  }
}



export async function DELETE(_request: Request, { params }: { params: Promise<Params> }) {
  try {
    if (!(await requireAdmin())) {
      return fail('Unauthorized', 401);
    }
 
    await connectDB();
    const { id } = await params;
    const application = await CareerApplication.findByIdAndDelete(id).exec();
 
    if (!application) {
      return fail('Application not found.', 404);
    }
 
    return ok({ deleted: true });
  } catch (error) {
    console.error('/api/admin/careers/applications/[id] DELETE error:', error);
    return fail('Internal Server Error', 500);
  }
}
 




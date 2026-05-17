import { connectDB } from "@/lib/db";
import { ok, fail, readJson, requireAdmin } from "@/lib/backend/route-utils";
import { buildCourseEnrollStatusEmail, sendEmailIfConfigured } from "@/lib/backend/email";
import { CourseEnrollRequest } from "@/models/CourseEnrollRequest";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  try {
    if (!(await requireAdmin())) return fail("Unauthorized", 401);
    const body = await readJson<{ status?: string }>(request);
    if (!body?.status) return fail("Status is required.", 400);

    await connectDB();
    const { id } = await params;
    const existing = await CourseEnrollRequest.findById(id).lean<{ status: string; email: string; name: string; courseTitle: string }>();
    const enroll = await CourseEnrollRequest.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    ).lean();
    if (!enroll) return fail("Request not found.", 404);

    if (existing && existing.status !== body.status) {
      const statusEmail = buildCourseEnrollStatusEmail({
        courseTitle: existing.courseTitle,
        status: body.status as 'new' | 'read' | 'contacted' | 'enrolled' | 'rejected',
        name: existing.name,
        message: `Your request status has been updated to ${body.status}. Please reply to this email if you need any help.`,
      });

      await sendEmailIfConfigured({
        to: existing.email,
        replyTo: process.env.CONTACT_TO_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL,
        subject: statusEmail.subject,
        text: statusEmail.text,
        html: statusEmail.html,
      });
    }

    return ok({ enroll });
  } catch (error) {
    console.error("/api/admin/enroll/[id] PATCH error:", error);
    return fail("Internal Server Error", 500);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<Params> }) {
  try {
    if (!(await requireAdmin())) return fail("Unauthorized", 401);
    await connectDB();
    const { id } = await params;
    const enroll = await CourseEnrollRequest.findByIdAndDelete(id).lean();
    if (!enroll) return fail("Request not found.", 404);
    return ok({ message: "Deleted.", enroll });
  } catch (error) {
    console.error("/api/admin/enroll/[id] DELETE error:", error);
    return fail("Internal Server Error", 500);
  }
}
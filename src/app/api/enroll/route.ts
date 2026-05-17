import { connectDB } from "@/lib/db";
import { ok, fail, readJson } from "@/lib/backend/route-utils";
import { buildCourseEnrollAdminEmail, sendEmailIfConfigured } from "@/lib/backend/email";
import { CourseEnrollRequest } from "@/models/CourseEnrollRequest";
import { Course } from "@/models/Course";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await readJson<{
      courseId: string;
      name: string;
      email: string;
      phone?: string;
      city?: string;
      education?: string;
      experience?: string;
      message?: string;
    }>(request);

    if (!body?.courseId || !body?.name?.trim() || !body?.email?.trim()) {
      return fail("Name, email and course are required.", 400);
    }

    await connectDB();

    const course = await Course.findById(body.courseId).lean<{ title: string; slug: string }>();
    if (!course) return fail("Course not found.", 404);

    const enroll = await CourseEnrollRequest.create({
      courseId:    body.courseId,
      courseTitle: course.title,
      courseSlug:  course.slug,
      name:        body.name.trim(),
      email:       body.email.trim(),
      phone:       body.phone?.trim() || '',
      city:        body.city?.trim() || '',
      education:   body.education?.trim() || '',
      experience:  body.experience?.trim() || '',
      message:     body.message?.trim() || '',
      status:      'new',
    });

    const adminEmailData = buildCourseEnrollAdminEmail({
      courseTitle: course.title,
      courseSlug: course.slug,
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim() || '',
      city: body.city?.trim() || '',
      education: body.education?.trim() || '',
      experience: body.experience?.trim() || '',
      message: body.message?.trim() || '',
    });

    const userAckHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#ffffff;background:#060B18;padding:24px;border-radius:12px;">
        <h2 style="margin:0 0 12px;font-size:20px;color:#ffffff;">Enrollment request received</h2>
        <p style="margin:0 0 12px;color:#8892A4;">Hi ${body.name.trim()},</p>
        <p style="margin:0 0 12px;color:#8892A4;">Thanks for your interest in <strong style="color:#ffffff;">${course.title}</strong>. We have received your request and our team will review it shortly.</p>
        <p style="margin:0;color:#8892A4;">We will contact you soon with the next steps.</p>
      </div>`;

    await Promise.allSettled([
      sendEmailIfConfigured({
        subject: `New Course Enrollment Request — ${course.title}`,
        replyTo: body.email.trim(),
        text: `New course enrollment request from ${body.name.trim()} (${body.email.trim()}) for ${course.title}`,
        html: adminEmailData.html,
      }),
      sendEmailIfConfigured({
        to: body.email.trim(),
        subject: `We received your enrollment request — ${course.title}`,
        text: `Hi ${body.name.trim()}, we received your enrollment request for ${course.title}.`,
        html: userAckHtml,
      }),
    ]);

    return ok({ enroll }, 201);
  } catch (error) {
    console.error("/api/enroll POST error:", error);
    return fail("Internal Server Error", 500);
  }
}
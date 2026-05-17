import { connectDB } from "@/lib/db";
import { ok, fail, requireAdmin } from "@/lib/backend/route-utils";
import { CourseEnrollRequest } from "@/models/CourseEnrollRequest";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await requireAdmin())) return fail("Unauthorized", 401);
    await connectDB();
    const requests = await CourseEnrollRequest.find({})
      .sort({ createdAt: -1 })
      .lean();
    return ok({ requests });
  } catch (error) {
    console.error("/api/admin/enroll GET error:", error);
    return fail("Internal Server Error", 500);
  }
}
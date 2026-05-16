import { connectDB } from "@/lib/db";
import { ok, fail } from "@/lib/backend/route-utils";
import { Course } from "@/models/Course";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function GET(_: Request, { params }: { params: Promise<Params> }) {
  try {
    await connectDB();
    const { slug } = await params;
    const course = await Course.findOne({ slug, isActive: true })
      .populate("instructor", "name designation image email linkedin github facebook")
      .lean();
    if (!course) return fail("Course not found.", 404);
    return ok({ course });
  } catch (error) {
    console.error("/api/courses/[slug] GET error:", error);
    return fail("Internal Server Error", 500);
  }
}
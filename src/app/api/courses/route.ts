import { connectDB } from "@/lib/db";
import { ok, fail } from "@/lib/backend/route-utils";
import { Course } from "@/models/Course";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find({ isActive: true })
      .populate("instructor", "name designation image")
      .sort({ order: 1, createdAt: -1 })
      .select("-curriculum -learningPoints -requirements")
      .lean();
    return ok({ courses });
  } catch (error) {
    console.error("/api/courses GET error:", error);
    return fail("Internal Server Error", 500);
  }
}
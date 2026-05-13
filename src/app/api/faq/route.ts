import { connectDB } from "@/lib/db";
import { ok, fail } from "@/lib/backend/route-utils";
import { FAQ } from "@/models/FAQ";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const faqs = await FAQ.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select("question answer")
      .lean();
    return ok({ faqs });
  } catch (error) {
    console.error("/api/faq GET error:", error);
    return fail("Internal Server Error", 500);
  }
}
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/backend/route-utils";
import { TeamMember } from "@/models/TeamMember";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const members = await TeamMember.find({}).sort({ order: 1, createdAt: -1 }).lean();
    return ok({ members });
  } catch (error) {
    console.error("/api/team GET error:", error);
    return fail("Internal Server Error", 500);
  }
}

import { connectDB } from "@/lib/db";
import { fail, ok, requireAdmin } from "@/lib/backend/route-utils";
import { Lead } from "@/models/Lead";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return fail("Unauthorized", 401);
    }

    await connectDB();
    const leads = await Lead.find({}).sort({ createdAt: -1 }).lean();

    return ok({ leads });
  } catch (error) {
    console.error("/api/admin/leads GET error:", error);
    return fail("Internal Server Error", 500);
  }
}

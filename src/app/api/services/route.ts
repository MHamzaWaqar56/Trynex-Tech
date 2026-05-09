import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/backend/route-utils";
import { Service } from "@/models/Service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const services = await Service.find({}).sort({ order: 1, createdAt: -1 }).lean();
    return ok({ services });
  } catch (error) {
    console.error("/api/services GET error:", error);
    return fail("Internal Server Error", 500);
  }
}

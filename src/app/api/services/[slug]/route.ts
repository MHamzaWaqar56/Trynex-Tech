import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/backend/route-utils";
import { Service } from "@/models/Service";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const { slug } = await params;
    const service = await Service.findOne({ slug }).lean();

    if (!service) {
      return fail("Service not found.", 404);
    }

    return ok({ service });
  } catch (error) {
    console.error("/api/services/[slug] GET error:", error);
    return fail("Internal Server Error", 500);
  }
}

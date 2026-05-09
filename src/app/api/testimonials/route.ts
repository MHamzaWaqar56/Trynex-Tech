import { connectDB } from "@/lib/db";
import { fail, ok, readJson, requireAdmin } from "@/lib/backend/route-utils";
import { testimonialSchema } from "@/lib/backend/validators";
import { Testimonial } from "@/models/Testimonial";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const showAll = url.searchParams.get("all") === "1";
    if (showAll && !(await requireAdmin())) {
      return fail("Unauthorized", 401);
    }
    const reviews = await Testimonial.find(showAll ? {} : { approved: true }).sort({ createdAt: -1 }).lean();
    return ok({ reviews });
  } catch (error) {
    console.error("/api/testimonials GET error:", error);
    return fail("Internal Server Error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJson<unknown>(request);
    const parsed = testimonialSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid testimonial payload.", 400, { issues: parsed.error.flatten() });
    }

    await connectDB();
    const review = await Testimonial.create(parsed.data);
    return ok({ review }, 201);
  } catch (error) {
    console.error("/api/testimonials POST error:", error);
    return fail("Internal Server Error", 500);
  }
}

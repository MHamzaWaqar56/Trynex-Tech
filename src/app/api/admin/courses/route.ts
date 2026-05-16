import { connectDB } from "@/lib/db";
import { fail, ok, readJson, requireAdmin } from "@/lib/backend/route-utils";
import { courseSchema } from "@/lib/backend/validators";
import { Course } from "@/models/Course";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await requireAdmin())) return fail("Unauthorized", 401);
    await connectDB();
    const courses = await Course.find({})
      .populate("instructor", "name designation image")
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return ok({ courses });
  } catch (error) {
    console.error("/api/admin/courses GET error:", error);
    return fail("Internal Server Error", 500);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return fail("Unauthorized", 401);

    const body = await readJson<unknown>(request);
    const payload = body && typeof body === "object" ? (body as Record<string, unknown>) : null;

    const normalizedBody = payload
      ? {
          ...payload,
          slug:
            typeof payload.slug === "string" && payload.slug.trim()
              ? slugify(payload.slug)
              : typeof payload.title === "string"
                ? slugify(payload.title)
                : undefined,
        }
      : body;

    const parsed = courseSchema.safeParse(normalizedBody);
    if (!parsed.success) {
      return fail("Invalid course payload.", 400, { issues: parsed.error.flatten() });
    }

    await connectDB();

    const duplicateOrder = await Course.findOne({ order: parsed.data.order }).lean();
    if (duplicateOrder) {
      return fail("A course with this order number already exists.", 409);
    }

    const slugToUse = (parsed.data as { slug?: string }).slug || slugify(parsed.data.title);
    const duplicateSlug = await Course.findOne({ slug: slugToUse }).lean();
    if (duplicateSlug) {
      return fail("A course with this slug already exists.", 409);
    }

    const course = await Course.create({ ...parsed.data, slug: slugToUse });
    return ok({ course }, 201);
  } catch (error) {
    console.error("/api/admin/courses POST error:", error);
    return fail("Internal Server Error", 500);
  }
}
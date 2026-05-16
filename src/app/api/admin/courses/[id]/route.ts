import { connectDB } from "@/lib/db";
import { fail, ok, readJson, requireAdmin } from "@/lib/backend/route-utils";
import { courseSchema } from "@/lib/backend/validators";
import { Course } from "@/models/Course";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function GET(_: Request, { params }: { params: Promise<Params> }) {
  try {
    if (!(await requireAdmin())) return fail("Unauthorized", 401);
    await connectDB();
    const { id } = await params;
    const course = await Course.findById(id)
      .populate("instructor", "name designation image")
      .lean();
    if (!course) return fail("Course not found.", 404);
    return ok({ course });
  } catch (error) {
    console.error("/api/admin/courses/[id] GET error:", error);
    return fail("Internal Server Error", 500);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<Params> }) {
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
    const { id } = await params;

    const duplicateOrder = await Course.findOne({ order: parsed.data.order, _id: { $ne: id } }).lean();
    if (duplicateOrder) {
      return fail("A course with this order number already exists.", 409);
    }

    const course = await Course.findByIdAndUpdate(id, parsed.data, { new: true })
      .populate("instructor", "name designation image")
      .lean();
    if (!course) return fail("Course not found.", 404);
    return ok({ course });
  } catch (error) {
    console.error("/api/admin/courses/[id] PUT error:", error);
    return fail("Internal Server Error", 500);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<Params> }) {
  try {
    if (!(await requireAdmin())) return fail("Unauthorized", 401);
    await connectDB();
    const { id } = await params;
    const course = await Course.findByIdAndDelete(id).lean();
    if (!course) return fail("Course not found.", 404);
    return ok({ message: "Deleted.", course });
  } catch (error) {
    console.error("/api/admin/courses/[id] DELETE error:", error);
    return fail("Internal Server Error", 500);
  }
}
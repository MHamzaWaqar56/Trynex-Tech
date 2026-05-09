import { connectDB } from "@/lib/db";
import { fail, ok, readJson, requireAdmin } from "@/lib/backend/route-utils";
import { serviceSchema } from "@/lib/backend/validators";
import { Service } from "@/models/Service";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return fail("Unauthorized", 401);
    }

    await connectDB();
    const services = await Service.find({}).sort({ order: 1, createdAt: -1 }).lean();
    return ok({ services });
  } catch (error) {
    console.error("/api/admin/services GET error:", error);
    return fail("Internal Server Error", 500);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return fail("Unauthorized", 401);
    }

    const body = await readJson<unknown>(request);
    const payload = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
    const normalizedBody = payload
      ? {
          ...payload,
          slug: typeof payload.slug === "string" && payload.slug.trim()
            ? slugify(payload.slug)
            : typeof payload.title === "string"
              ? slugify(payload.title)
              : undefined,
        }
      : body;

    const parsed = serviceSchema.safeParse(normalizedBody);
    if (!parsed.success) {
      return fail("Invalid service payload.", 400, { issues: parsed.error.flatten() });
    }

    await connectDB();
    const duplicateOrder = await Service.findOne({ order: parsed.data.order }).lean();
    if (duplicateOrder) {
      return fail("This order number already exists.", 409);
    }

    const service = await Service.create(parsed.data);
    return ok({ service }, 201);
  } catch (error) {
    console.error("/api/admin/services POST error:", error);
    return fail("Internal Server Error", 500);
  }
}

import { connectDB } from "@/lib/db";
import { fail, ok, readJson, requireAdmin } from "@/lib/backend/route-utils";
import { serviceSchema } from "@/lib/backend/validators";
import { Service } from "@/models/Service";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function PUT(request: Request, { params }: { params: Promise<Params> }) {
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

    const parsed = serviceSchema.partial().safeParse(normalizedBody);
    if (!parsed.success) {
      return fail("Invalid service payload.", 400, { issues: parsed.error.flatten() });
    }

    await connectDB();
    const { id } = await params;
    if (typeof parsed.data.order === 'number') {
      const duplicateOrder = await Service.findOne({ order: parsed.data.order, _id: { $ne: id } }).lean();
      if (duplicateOrder) {
        return fail("This order number already exists.", 409);
      }
    }

    const service = await Service.findByIdAndUpdate(id, parsed.data, { new: true }).lean();

    if (!service) {
      return fail("Service not found.", 404);
    }

    revalidatePath('/');
    revalidatePath('/services');
    return ok({ service });
  } catch (error) {
    console.error("/api/admin/services/[id] PUT error:", error);
    return fail("Internal Server Error", 500);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<Params> }) {
  try {
    if (!(await requireAdmin())) {
      return fail("Unauthorized", 401);
    }

    await connectDB();
    const { id } = await params;
    const service = await Service.findByIdAndDelete(id).lean();

    if (!service) {
      return fail("Service not found.", 404);
    }

    revalidatePath('/');
    revalidatePath('/services');
    return ok({ message: "Deleted.", service });
  } catch (error) {
    console.error("/api/admin/services/[id] DELETE error:", error);
    return fail("Internal Server Error", 500);
  }
}

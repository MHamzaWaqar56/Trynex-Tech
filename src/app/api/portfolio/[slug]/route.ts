import { connectDB } from "@/lib/db";
import { portfolioSchema } from "@/lib/backend/validators";
import { fail, isDuplicateKeyError, ok, readJson, requireAdmin } from "@/lib/backend/route-utils";
import { Portfolio } from "@/models/Portfolio";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    await connectDB();
    const project = await Portfolio.findOne({ slug }).lean();

    if (!project) {
      return fail("Project not found.", 404);
    }

    return ok({ project });
  } catch (error) {
    console.error("/api/portfolio/[slug] GET error:", error);
    return fail("Internal Server Error", 500);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    if (!(await requireAdmin())) {
      return fail("Unauthorized", 401);
    }

    const body = await readJson<unknown>(request);
    const payload = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
    const normalizedBody =
      payload
        ? {
            ...payload,
            slug: typeof payload.slug === "string" && payload.slug.trim()
              ? slugify(payload.slug)
              : typeof payload.title === "string"
                ? slugify(payload.title)
                : undefined,
          }
        : body;

    const parsed = portfolioSchema.partial().safeParse(normalizedBody);

    if (!parsed.success) {
      return fail("Invalid portfolio payload.", 400, { issues: parsed.error.flatten() });
    }

    const { slug } = await params;
    await connectDB();
    if (typeof parsed.data.order === 'number') {
      const duplicateOrder = await Portfolio.findOne({ order: parsed.data.order, slug: { $ne: slug } }).lean();
      if (duplicateOrder) {
        return fail("This order number already exists.", 409);
      }
    }

    const project = await Portfolio.findOneAndUpdate({ slug }, parsed.data, { new: true }).lean();

    if (!project) {
      return fail("Project not found.", 404);
    }

    return ok({ project });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return fail("A portfolio project with this slug already exists.", 409);
    }

    console.error("/api/portfolio/[slug] PUT error:", error);
    return fail("Internal Server Error", 500);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    if (!(await requireAdmin())) {
      return fail("Unauthorized", 401);
    }

    const { slug } = await params;
    await connectDB();
    const project = await Portfolio.findOneAndDelete({ slug }).lean();

    if (!project) {
      return fail("Project not found.", 404);
    }

    return ok({ message: "Deleted.", project });
  } catch (error) {
    console.error("/api/portfolio/[slug] DELETE error:", error);
    return fail("Internal Server Error", 500);
  }
}

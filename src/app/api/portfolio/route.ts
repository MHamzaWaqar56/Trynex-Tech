import { connectDB } from "@/lib/db";
import { fail, isDuplicateKeyError, ok, readJson, requireAdmin } from "@/lib/backend/route-utils";
import { portfolioSchema } from "@/lib/backend/validators";
import { Portfolio } from "@/models/Portfolio";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const projects = await Portfolio.find({}).sort({ order: 1, featured: -1, createdAt: -1 }).lean();

    return ok({ projects });
  } catch (error) {
    console.error("/api/portfolio GET error:", error);
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

    const parsed = portfolioSchema.safeParse(normalizedBody);
    if (!parsed.success) {
      return fail("Invalid portfolio payload.", 400, { issues: parsed.error.flatten() });
    }

    await connectDB();
    const duplicateOrder = await Portfolio.findOne({ order: parsed.data.order }).lean();
    if (duplicateOrder) {
      return fail("This order number already exists.", 409);
    }

    const project = await Portfolio.create(parsed.data);

    return ok({ project }, 201);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return fail("A portfolio project with this slug already exists.", 409);
    }

    console.error("/api/portfolio POST error:", error);
    return fail("Internal Server Error", 500);
  }
}

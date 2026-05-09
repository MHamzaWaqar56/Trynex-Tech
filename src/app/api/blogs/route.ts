import { connectDB } from "@/lib/db";
import { blogSchema } from "@/lib/backend/validators";
import { fail, isDuplicateKeyError, ok, readJson, requireAdmin } from "@/lib/backend/route-utils";
import { Blog } from "@/models/Blog";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const showAll = url.searchParams.get("all") === "1";
    if (showAll && !(await requireAdmin())) {
      return fail("Unauthorized", 401);
    }
    const posts = await Blog.find(showAll ? {} : { published: true }).sort({ createdAt: -1 }).lean();
    return ok({ posts });
  } catch (error) {
    console.error("/api/blogs GET error:", error);
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

    const parsed = blogSchema.safeParse(normalizedBody);
    if (!parsed.success) {
      return fail("Invalid blog payload.", 400, { issues: parsed.error.flatten() });
    }

    await connectDB();
    const post = await Blog.create(parsed.data);
    return ok({ post }, 201);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return fail("A blog post with this slug already exists.", 409);
    }

    console.error("/api/blogs POST error:", error);
    return fail("Internal Server Error", 500);
  }
}

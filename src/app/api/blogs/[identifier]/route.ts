import { connectDB } from "@/lib/db";
import { blogSchema } from "@/lib/backend/validators";
import { fail, isDuplicateKeyError, ok, readJson, requireAdmin } from "@/lib/backend/route-utils";
import { Blog } from "@/models/Blog";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ identifier: string }> }) {
  try {
    await connectDB();
    const { identifier } = await params;
    const post = await Blog.findOneAndUpdate(
      { slug: identifier, published: true },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!post) {
      return fail("Blog post not found.", 404);
    }

    return ok({ post });
  } catch (error) {
    console.error("/api/blogs/[identifier] GET error:", error);
    return fail("Internal Server Error", 500);
  }
}


export async function PUT(request: Request, { params }: { params: Promise<{ identifier: string }> }) {
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

    await connectDB();
    const { identifier } = await params;
    const existingPost = await Blog.findOne({ $or: [{ _id: identifier }, { slug: identifier }] }).lean<Record<string, unknown> | null>();

    if (!existingPost) {
      return fail("Blog post not found.", 404);
    }

    const mergedBody = {
      ...existingPost,
      ...(normalizedBody && typeof normalizedBody === "object" ? normalizedBody : {}),
      title:
        typeof (normalizedBody as Record<string, unknown> | null)?.title === "string" && String((normalizedBody as Record<string, unknown>).title).trim()
          ? String((normalizedBody as Record<string, unknown>).title)
          : typeof existingPost.title === "string"
            ? existingPost.title
            : undefined,
      slug:
        typeof (normalizedBody as Record<string, unknown> | null)?.slug === "string" && String((normalizedBody as Record<string, unknown>).slug).trim()
          ? slugify(String((normalizedBody as Record<string, unknown>).slug))
          : typeof existingPost.slug === "string"
            ? String(existingPost.slug)
            : undefined,
      content:
        typeof (normalizedBody as Record<string, unknown> | null)?.content === "string" && String((normalizedBody as Record<string, unknown>).content).trim()
          ? String((normalizedBody as Record<string, unknown>).content)
          : typeof existingPost.content === "string"
            ? existingPost.content
            : undefined,
    };

    const parsed = blogSchema.partial().safeParse(mergedBody);
    if (!parsed.success) {
      return fail("Invalid blog payload.", 400, { issues: parsed.error.flatten() });
    }

    const post = await Blog.findOneAndUpdate(
      { $or: [{ _id: identifier }, { slug: identifier }] },
      parsed.data,
      { new: true },
    ).lean();

    return ok({ post });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return fail("A blog post with this slug already exists.", 409);
    }

    console.error("/api/blogs/[identifier] PUT error:", error);
    return fail("Internal Server Error", 500);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ identifier: string }> }) {
  try {
    if (!(await requireAdmin())) {
      return fail("Unauthorized", 401);
    }

    await connectDB();
    const { identifier } = await params;
    const post = await Blog.findOneAndDelete({ $or: [{ _id: identifier }, { slug: identifier }] }).lean();

    if (!post) {
      return fail("Blog post not found.", 404);
    }

    return ok({ message: "Deleted.", post });
  } catch (error) {
    console.error("/api/blogs/[identifier] DELETE error:", error);
    return fail("Internal Server Error", 500);
  }
}

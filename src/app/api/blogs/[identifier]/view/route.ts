import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/backend/route-utils";
import { Blog } from "@/models/Blog";

export const dynamic = "force-dynamic";

export async function POST(_: Request, { params }: { params: Promise<{ identifier: string }> }) {
  try {
    await connectDB();
    const { identifier } = await params;

    const post = await Blog.findOneAndUpdate(
      { slug: identifier, published: true },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!post) return fail("Blog post not found.", 404);

    return ok({ views: (post as any).views });
  } catch (error) {
    console.error("/api/blogs/[identifier]/view POST error:", error);
    return fail("Internal Server Error", 500);
  }
}
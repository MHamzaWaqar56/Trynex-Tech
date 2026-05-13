import { connectDB } from "@/lib/db";
import { fail, ok, readJson, requireAdmin } from "@/lib/backend/route-utils";
import { FAQ } from "@/models/FAQ";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function PUT(request: Request, { params }: { params: Promise<Params> }) {
  try {
    if (!(await requireAdmin())) return fail("Unauthorized", 401);

    const body = await readJson<{ question?: string; answer?: string; order?: number; isActive?: boolean }>(request);
    if (!body) return fail("Invalid payload.", 400);

    const update: Record<string, unknown> = {};
    if (body.question !== undefined) update.question = body.question.trim();
    if (body.answer   !== undefined) update.answer   = body.answer.trim();
    if (body.order    !== undefined) update.order    = body.order;
    if (body.isActive !== undefined) update.isActive = body.isActive;

    if (Object.keys(update).length === 0) return fail("Nothing to update.", 400);

    await connectDB();
    const { id } = await params;
    const faq = await FAQ.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!faq) return fail("FAQ not found.", 404);

    return ok({ faq });
  } catch (error) {
    console.error("/api/admin/faq/[id] PUT error:", error);
    return fail("Internal Server Error", 500);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<Params> }) {
  try {
    if (!(await requireAdmin())) return fail("Unauthorized", 401);

    await connectDB();
    const { id } = await params;
    const faq = await FAQ.findByIdAndDelete(id).lean();
    if (!faq) return fail("FAQ not found.", 404);

    return ok({ message: "Deleted.", faq });
  } catch (error) {
    console.error("/api/admin/faq/[id] DELETE error:", error);
    return fail("Internal Server Error", 500);
  }
}
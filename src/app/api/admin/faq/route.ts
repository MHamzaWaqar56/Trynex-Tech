import { connectDB } from "@/lib/db";
import { fail, ok, readJson, requireAdmin } from "@/lib/backend/route-utils";
import { FAQ } from "@/models/FAQ";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await requireAdmin())) return fail("Unauthorized", 401);
    await connectDB();
    const faqs = await FAQ.find({}).sort({ order: 1, createdAt: 1 }).lean();
    return ok({ faqs });
  } catch (error) {
    console.error("/api/admin/faq GET error:", error);
    return fail("Internal Server Error", 500);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return fail("Unauthorized", 401);

    const body = await readJson<{ question?: string; answer?: string; order?: number; isActive?: boolean }>(request);
    if (!body?.question?.trim() || !body?.answer?.trim()) {
      return fail("Question and answer are required.", 400);
    }

    await connectDB();
    const faq = await FAQ.create({
      question: body.question.trim(),
      answer:   body.answer.trim(),
      order:    body.order ?? 0,
      isActive: body.isActive ?? true,
    });
    return ok({ faq }, 201);
  } catch (error) {
    console.error("/api/admin/faq POST error:", error);
    return fail("Internal Server Error", 500);
  }
}
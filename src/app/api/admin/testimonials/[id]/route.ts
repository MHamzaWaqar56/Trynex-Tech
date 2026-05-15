import { connectDB } from "@/lib/db";
import { fail, ok, readJson, requireAdmin } from "@/lib/backend/route-utils";
import { Testimonial } from "@/models/Testimonial";
import { revalidatePath } from "next/cache";


export const dynamic = "force-dynamic";

type Params = { id: string };

export async function PUT(request: Request, { params }: { params: Promise<Params> }) {
  try {
    if (!(await requireAdmin())) {
      return fail("Unauthorized", 401);
    }

    const body = await readJson<{ approved?: boolean }>(request);
    if (typeof body.approved !== "boolean") {
      return fail("Invalid approval payload.", 400);
    }

    await connectDB();
    const { id } = await params;
    const review = await Testimonial.findByIdAndUpdate(id, { approved: body.approved }, { new: true }).lean();

    if (!review) {
      return fail("Testimonial not found.", 404);
    }
    
    revalidatePath('/');
    revalidatePath('/testimonials');
    return ok({ review });
  } catch (error) {
    console.error("/api/admin/testimonials/[id] PUT error:", error);
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
    const review = await Testimonial.findByIdAndDelete(id).lean();

    if (!review) {
      return fail("Testimonial not found.", 404);
    }
    
    revalidatePath('/');
    revalidatePath('/testimonials');
    return ok({ message: "Deleted.", review });
  } catch (error) {
    console.error("/api/admin/testimonials/[id] DELETE error:", error);
    return fail("Internal Server Error", 500);
  }
}
import { connectDB } from "@/lib/db";
import { fail, ok, requireAdmin, readJson } from "@/lib/backend/route-utils";
import { Contact } from "@/models/Contact";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return fail("Unauthorized", 401);
    }

    await connectDB();
    const messages = await Contact.find({}).sort({ createdAt: -1 }).lean();

    return ok({ messages });
  } catch (error) {
    console.error("/api/admin/messages GET error:", error);
    return fail("Internal Server Error", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return fail("Unauthorized", 401);
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id") || (await readJson<{ id?: string }>(request)).id;

    if (!id) {
      return fail("Message id is required.", 400);
    }

    await connectDB();
    const message = await Contact.findByIdAndDelete(id).lean();

    if (!message) {
      return fail("Message not found.", 404);
    }

    return ok({ message: "Deleted.", contact: message });
  } catch (error) {
    console.error("/api/admin/messages DELETE error:", error);
    return fail("Internal Server Error", 500);
  }
}

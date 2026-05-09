import { connectDB } from "@/lib/db";
import { fail, ok, readJson, requireAdmin } from "@/lib/backend/route-utils";
import { teamMemberSchema } from "@/lib/backend/validators";
import { TeamMember } from "@/models/TeamMember";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function PUT(request: Request, { params }: { params: Promise<Params> }) {
  try {
    if (!(await requireAdmin())) {
      return fail("Unauthorized", 401);
    }

    const body = await readJson<unknown>(request);
    const parsed = teamMemberSchema.partial().safeParse(body);
    if (!parsed.success) {
      return fail("Invalid team member payload.", 400, { issues: parsed.error.flatten() });
    }

    await connectDB();
    const { id } = await params;
    if (typeof parsed.data.order === 'number') {
      const duplicateOrder = await TeamMember.findOne({ order: parsed.data.order, _id: { $ne: id } }).lean();
      if (duplicateOrder) {
        return fail("This order number already exists.", 409);
      }
    }

    const member = await TeamMember.findByIdAndUpdate(id, parsed.data, { new: true }).lean();

    if (!member) {
      return fail("Team member not found.", 404);
    }

    return ok({ member });
  } catch (error) {
    console.error("/api/admin/team/[id] PUT error:", error);
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
    const member = await TeamMember.findByIdAndDelete(id).lean();

    if (!member) {
      return fail("Team member not found.", 404);
    }

    return ok({ message: "Deleted.", member });
  } catch (error) {
    console.error("/api/admin/team/[id] DELETE error:", error);
    return fail("Internal Server Error", 500);
  }
}

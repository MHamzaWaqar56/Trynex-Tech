import { connectDB } from "@/lib/db";
import { fail, ok, readJson, requireAdmin } from "@/lib/backend/route-utils";
import { teamMemberSchema } from "@/lib/backend/validators";
import { TeamMember } from "@/models/TeamMember";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return fail("Unauthorized", 401);
    }

    await connectDB();
    const members = await TeamMember.find({}).sort({ order: 1, createdAt: -1 }).lean();
    return ok({ members });
  } catch (error) {
    console.error("/api/admin/team GET error:", error);
    return fail("Internal Server Error", 500);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return fail("Unauthorized", 401);
    }

    const body = await readJson<unknown>(request);
    const parsed = teamMemberSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid team member payload.", 400, { issues: parsed.error.flatten() });
    }

    await connectDB();
    const duplicateOrder = await TeamMember.findOne({ order: parsed.data.order }).lean();
    if (duplicateOrder) {
      return fail("This order number already exists.", 409);
    }

    const member = await TeamMember.create(parsed.data);
    revalidatePath("/about");
    return ok({ member }, 201);
  } catch (error) {
    console.error("/api/admin/team POST error:", error);
    return fail("Internal Server Error", 500);
  }
}

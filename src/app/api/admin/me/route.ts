import { fail, ok } from "@/lib/backend/route-utils";
import { getAdminSession } from "@/lib/backend/admin-session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return fail("Unauthorized", 401);
    }

    return ok({
      admin: {
        email: session.email,
        role: session.role,
        expiresAt: session.exp,
      },
    });
  } catch (error) {
    console.error("/api/admin/me GET error:", error);
    return fail("Internal Server Error", 500);
  }
}

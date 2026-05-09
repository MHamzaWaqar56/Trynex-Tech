import { cookies } from "next/headers";

import { fail, ok } from "@/lib/backend/route-utils";
import { getAdminCookieName, getAdminCookieOptions } from "@/lib/backend/admin-session";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set(getAdminCookieName(), "", {
      ...getAdminCookieOptions(),
      maxAge: 0,
    });

    return ok({ message: "Logged out." });
  } catch (error) {
    console.error("/api/admin/logout POST error:", error);
    return fail("Internal Server Error", 500);
  }
}

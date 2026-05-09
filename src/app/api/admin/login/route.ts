import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import { adminLoginSchema } from "@/lib/backend/validators";
import { createAdminSession, getAdminCookieName, getAdminCookieOptions } from "@/lib/backend/admin-session";
import { fail, ok, readJson } from "@/lib/backend/route-utils";
import { Admin } from "@/models/Admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await readJson<unknown>(request);
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid login payload.", 400, { issues: parsed.error.flatten() });
    }

    const { email, password } = parsed.data;
    const envEmail = process.env.ADMIN_EMAIL;
    const envPassword = process.env.ADMIN_PASSWORD;
    const envLoginAllowed = Boolean(envEmail && envPassword && email === envEmail && password === envPassword);

    if (envLoginAllowed) {
      try {
        await connectDB();

        let admin = await Admin.findOne({ email });
        if (!admin) {
          const hashed = await bcrypt.hash(password, 10);
          admin = await Admin.create({ email, password: hashed, role: "admin" });
        }

        const token = createAdminSession({ email: admin.email, role: admin.role || "admin" });
        const cookieStore = await cookies();
        cookieStore.set(getAdminCookieName(), token, getAdminCookieOptions());

        return ok({ message: "Logged in.", admin: { email: admin.email, role: admin.role || "admin" } });
      } catch (error) {
        console.warn("/api/admin/login env fallback used because DB connection failed:", error);

        const token = createAdminSession({ email, role: "admin" });
        const cookieStore = await cookies();
        cookieStore.set(getAdminCookieName(), token, getAdminCookieOptions());

        return ok({
          message: "Logged in with environment admin credentials.",
          admin: { email, role: "admin" },
        });
      }
    }

    await connectDB();

    let admin = await Admin.findOne({ email });

    if (!admin) {
      return fail("Invalid credentials.", 401);
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return fail("Invalid credentials.", 401);
    }

    const token = createAdminSession({ email: admin.email, role: admin.role || "admin" });
    const cookieStore = await cookies();
    cookieStore.set(getAdminCookieName(), token, getAdminCookieOptions());

    return ok({ message: "Logged in.", admin: { email: admin.email, role: admin.role || "admin" } });
  } catch (error) {
    console.error("/api/admin/login POST error:", error);
    return fail("Internal Server Error", 500);
  }
}

import crypto from "node:crypto";
import { cookies } from "next/headers";

export type AdminSessionPayload = {
  email: string;
  role: string;
  iat: number;
  exp: number;
};

const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET or NEXTAUTH_SECRET is required in production.");
  }

  return secret || "dev-admin-session-secret";
}

export function createAdminSession(payload: Pick<AdminSessionPayload, "email" | "role">) {
  const fullPayload: AdminSessionPayload = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
  };

  const data = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", sessionSecret())
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
}

export function verifyAdminSession(token?: string | null): AdminSessionPayload | null {
  if (!token) return null;

  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  const expected = crypto
    .createHmac("sha256", sessionSecret())
    .update(data)
    .digest("base64url");

  if (signature.length !== expected.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as AdminSessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(COOKIE_NAME)?.value);
}

export function getAdminCookieName() {
  return COOKIE_NAME;
}

export function getAdminCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}

export async function requireAdmin() {
  return getAdminSession();
}

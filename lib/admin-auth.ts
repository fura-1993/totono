import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "totono_admin_session";

function getSecret() {
  return process.env.ADMIN_SECRET || "change-this-admin-secret";
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createAdminToken() {
  const payload = Buffer.from(JSON.stringify({ ts: Date.now() })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  if (signature.length !== expected.length) return false;
  const valid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { ts?: number };
    if (!decoded.ts) return false;
    const maxAgeMs = 1000 * 60 * 60 * 24 * 14;
    return Date.now() - decoded.ts < maxAgeMs;
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export async function setAdminSession() {
  const store = await cookies();
  store.set({
    name: ADMIN_COOKIE,
    value: createAdminToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.set({
    name: ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

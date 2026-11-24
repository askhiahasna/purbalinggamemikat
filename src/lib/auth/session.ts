import { SignJWT, jwtVerify } from "jose";

// Modul ini edge-safe (dipakai juga oleh src/proxy.ts): tidak boleh mengimpor prisma.

export const SESSION_COOKIE = "pm_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari (detik)

function getKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET belum diset atau kurang dari 32 karakter.");
  }
  return new TextEncoder().encode(secret);
}

/** JWT hanya membawa id user. Role & status aktif SELALU dibaca ulang dari database. */
export async function signSession(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getKey());
}

export async function verifySession(token: string | undefined): Promise<{ userId: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    return payload.sub ? { userId: payload.sub } : null;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

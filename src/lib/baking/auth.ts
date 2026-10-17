import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// One editor (Alexis), unlocked with a passcode. The cookie holds an expiry
// timestamp signed with BAKING_SESSION_SECRET, so it can't be forged.
const COOKIE = "baking_editor";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

function sign(value: string) {
  const secret = process.env.BAKING_SESSION_SECRET;
  if (!secret) throw new Error("BAKING_SESSION_SECRET is not set");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest();
}

export function passcodeMatches(input: string) {
  const expected = process.env.BAKING_PASSCODE;
  if (!expected) return false;
  // Hash both sides so the comparison is constant-time and length-independent.
  return timingSafeEqual(sha256(input), sha256(expected));
}

export async function startEditorSession() {
  const expires = String(Date.now() + MAX_AGE_SECONDS * 1000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endEditorSession() {
  (await cookies()).delete(COOKIE);
}

export async function isEditor() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value || !process.env.BAKING_SESSION_SECRET) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  const expected = Buffer.from(sign(expires));
  const actual = Buffer.from(signature);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function requireEditor() {
  if (!(await isEditor())) throw new Error("Unlock editing first");
}

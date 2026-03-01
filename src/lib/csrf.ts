import { NextResponse } from "next/server";
import crypto from "crypto";

// Cookie that stores the signed CSRF token (HttpOnly so JS can't read it directly).
const CSRF_COOKIE = "__healtalk_csrf";

// Header that the client must send on every mutating request (POST/PATCH/DELETE).
const CSRF_HEADER = "x-csrf-token";

const getSecret = () =>
  process.env.CSRF_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV !== "production" ? "dev-csrf-secret" : null);
const shouldEnforce = () => process.env.NODE_ENV === "production";

const hashToken = (token: string, secret: string) =>
  crypto.createHmac("sha256", secret).update(token).digest("hex");

/**
 * Constant-time string comparison — prevents timing attacks where an attacker
 * could deduce the correct token by measuring how long the comparison takes.
 */
const safeEqual = (a: string, b: string) => {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
};

export const ensureCsrfCookie = () => {
  const secret = getSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "CSRF secret is not configured" },
      { status: 500 }
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  const signed = `${token}.${hashToken(token, secret)}`;
  const isSecure = process.env.NODE_ENV === "production";
  return NextResponse.json({ csrfToken: token }, {
    headers: {
      "Set-Cookie": `${CSRF_COOKIE}=${signed}; Path=/; HttpOnly; SameSite=Lax${isSecure ? "; Secure" : ""}`,
    },
  });
};

export const validateCsrf = (request: Request) => {
  if (!shouldEnforce()) return null;
  const secret = getSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "CSRF secret is not configured" },
      { status: 500 }
    );
  }

  const headerToken = request.headers.get(CSRF_HEADER);
  if (!headerToken) {
    return NextResponse.json({ error: "Missing CSRF token" }, { status: 403 });
  }

  // Parse the raw Cookie header to find our specific CSRF cookie value.
  // We can't use Next.js cookies() here because this helper runs in API routes.
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`${CSRF_COOKIE}=([^;]+)`));
  if (!match) {
    return NextResponse.json({ error: "Missing CSRF cookie" }, { status: 403 });
  }

  const [raw, signature] = match[1].split(".");
  if (!raw || !signature) {
    return NextResponse.json({ error: "Invalid CSRF cookie" }, { status: 403 });
  }

  const expected = hashToken(raw, secret);
  if (!safeEqual(expected, signature)) {
    return NextResponse.json({ error: "Invalid CSRF cookie" }, { status: 403 });
  }

  if (!safeEqual(headerToken, raw)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  return null;
};

export const csrfCookieName = CSRF_COOKIE;

import "server-only";
import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "ivy_admin_session";

const JWT_SECRET = process.env.JWT_SECRET || "ivy-beauty-spa-dev-secret";

export interface SessionPayload {
  sub: string; // user id
  name: string;
  email: string;
  role: string;
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

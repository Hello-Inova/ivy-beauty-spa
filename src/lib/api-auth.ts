import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "./auth";

export async function requireAdmin(): Promise<
  { session: SessionPayload; unauthorized: null } | { session: null; unauthorized: NextResponse }
> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) {
    return {
      session: null,
      unauthorized: NextResponse.json({ error: "Não autorizado." }, { status: 401 }),
    };
  }
  return { session, unauthorized: null };
}

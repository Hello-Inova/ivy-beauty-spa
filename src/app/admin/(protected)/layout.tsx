import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { IS_DEMO_MODE } from "@/lib/demo-mode";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import type { AdminSession } from "@/lib/types";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  let session: AdminSession | null = null;

  // Real mode: authoritative server-side check (src/proxy.ts only does an
  // optimistic pre-check based on cookie presence). Demo mode: there is no
  // server, so this is skipped entirely — AdminShell falls back to the
  // client-side localStorage session used by LocalBookingClient, and
  // redirects to /admin/login itself if none is found.
  if (!IS_DEMO_MODE) {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    const payload = token ? verifySession(token) : null;
    if (!payload) redirect("/admin/login");
    session = { name: payload.name, email: payload.email };
  }

  return <AdminShell initialSession={session}>{children}</AdminShell>;
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getDashboardStats } from "@/db/queries";

export const dynamic = "force-dynamic";

function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);
  const dow = now.getUTCDay();
  const weekStart = addDays(todayISO, -dow);
  const weekEnd = addDays(weekStart, 6);
  const monthStart = `${todayISO.slice(0, 7)}-01`;
  const monthEnd = addDays(`${todayISO.slice(0, 7)}-01`, 31).slice(0, 7) + "-01";

  const stats = await getDashboardStats(todayISO, weekStart, weekEnd, monthStart, monthEnd);
  return NextResponse.json(stats);
}

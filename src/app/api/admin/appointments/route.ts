import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { listAppointments } from "@/db/queries";
import type { AppointmentStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { searchParams } = new URL(request.url);
  const appointments = await listAppointments({
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
    status: (searchParams.get("status") as AppointmentStatus) || undefined,
    professionalId: searchParams.get("professionalId") || undefined,
  });
  return NextResponse.json({ appointments });
}

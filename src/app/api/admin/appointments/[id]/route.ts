import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api-auth";
import { updateAppointmentStatus, rescheduleAppointment, SlotUnavailableError } from "@/db/queries";

export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/appointments/[id]">) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  try {
    if (parsed.data.status) {
      await updateAppointmentStatus(id, parsed.data.status);
    }
    if (parsed.data.date && parsed.data.startTime && parsed.data.endTime) {
      await rescheduleAppointment(id, parsed.data.date, parsed.data.startTime, parsed.data.endTime);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof SlotUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Não foi possível atualizar o agendamento." }, { status: 500 });
  }
}

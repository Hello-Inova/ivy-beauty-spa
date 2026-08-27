import { NextResponse } from "next/server";
import { getCatalog, getAppointmentsForProfessionalOnDate } from "@/db/queries";
import { computeAvailableSlots, todayISO, nowMinutesInTZ } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const professionalId = searchParams.get("professionalId");
  const date = searchParams.get("date");

  if (!serviceId || !professionalId || !date) {
    return NextResponse.json(
      { error: "serviceId, professionalId e date são obrigatórios." },
      { status: 400 }
    );
  }

  const catalog = await getCatalog();
  const service = catalog.services.find((s) => s.id === serviceId);
  if (!service) {
    return NextResponse.json({ error: "Serviço não encontrado." }, { status: 404 });
  }

  let candidates = catalog.professionals.filter((p) => p.active && service.professionalIds.includes(p.id));
  if (professionalId !== "any") {
    candidates = candidates.filter((p) => p.id === professionalId);
  }
  if (candidates.length === 0) {
    return NextResponse.json({ error: "Profissional não encontrado para este serviço." }, { status: 404 });
  }

  const today = todayISO();
  const nowMinutes = date === today ? nowMinutesInTZ() : null;
  const slotSet = new Set<string>();

  for (const professional of candidates) {
    const existingAppointments = await getAppointmentsForProfessionalOnDate(professional.id, date);
    const slots = computeAvailableSlots({
      date,
      durationMinutes: service.duration,
      businessHours: catalog.businessHours,
      professionalWorkingHours: professional.workingHours,
      blockedDates: professional.blockedDates.map((b) => b.date),
      existingAppointments,
      nowMinutes,
      minLeadMinutes: 30,
    });
    for (const s of slots) slotSet.add(s);
  }

  return NextResponse.json({ slots: Array.from(slotSet).sort() });
}

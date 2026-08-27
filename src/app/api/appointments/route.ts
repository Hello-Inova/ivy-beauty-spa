import { NextResponse } from "next/server";
import { z } from "zod";
import { getCatalog, getAppointmentsForProfessionalOnDate, createAppointment, SlotUnavailableError } from "@/db/queries";
import { computeAvailableSlots, timeToMinutes, minutesToTime, todayISO, nowMinutesInTZ } from "@/lib/availability";

export const dynamic = "force-dynamic";

const schema = z.object({
  serviceId: z.string().min(1),
  professionalId: z.string().min(1), // real id, or "any"
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().min(2),
  customerWhatsapp: z.string().min(8),
  customerEmail: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos.", details: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const catalog = await getCatalog();
  const service = catalog.services.find((s) => s.id === input.serviceId && s.active);
  if (!service) {
    return NextResponse.json({ error: "Serviço não encontrado." }, { status: 404 });
  }

  let candidateProfessionals = catalog.professionals.filter(
    (p) => p.active && service.professionalIds.includes(p.id)
  );
  if (input.professionalId !== "any") {
    candidateProfessionals = candidateProfessionals.filter((p) => p.id === input.professionalId);
  }
  if (candidateProfessionals.length === 0) {
    return NextResponse.json({ error: "Profissional não disponível para este serviço." }, { status: 404 });
  }

  const today = todayISO();
  const nowMinutes = input.date === today ? nowMinutesInTZ() : null;

  // Pick the first professional (in the candidate list) that actually has this exact slot free.
  let chosen = null as null | { professionalId: string; endTime: string };
  for (const prof of candidateProfessionals) {
    const existing = await getAppointmentsForProfessionalOnDate(prof.id, input.date);
    const slots = computeAvailableSlots({
      date: input.date,
      durationMinutes: service.duration,
      businessHours: catalog.businessHours,
      professionalWorkingHours: prof.workingHours,
      blockedDates: prof.blockedDates.map((b) => b.date),
      existingAppointments: existing,
      nowMinutes,
      minLeadMinutes: 30,
    });
    if (slots.includes(input.startTime)) {
      chosen = {
        professionalId: prof.id,
        endTime: minutesToTime(timeToMinutes(input.startTime) + service.duration),
      };
      break;
    }
  }

  if (!chosen) {
    return NextResponse.json(
      { error: "Este horário não está mais disponível. Por favor escolha outro horário." },
      { status: 409 }
    );
  }

  try {
    const appointment = await createAppointment({
      serviceId: service.id,
      professionalId: chosen.professionalId,
      date: input.date,
      startTime: input.startTime,
      endTime: chosen.endTime,
      price: service.price,
      customerName: input.customerName.trim(),
      customerWhatsapp: input.customerWhatsapp.trim(),
      customerEmail: input.customerEmail || undefined,
      notes: input.notes?.trim() || undefined,
    });
    return NextResponse.json({ appointment });
  } catch (err) {
    if (err instanceof SlotUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Não foi possível concluir o agendamento." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api-auth";
import { adminListBlockedDates, adminAddBlockedDate } from "@/db/queries";

export const dynamic = "force-dynamic";

const schema = z.object({
  professionalId: z.string().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().optional(),
});

export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const blockedDates = await adminListBlockedDates();
  return NextResponse.json({ blockedDates });
}

export async function POST(request: Request) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  await adminAddBlockedDate(parsed.data.professionalId, parsed.data.date, parsed.data.reason);
  return NextResponse.json({ ok: true });
}

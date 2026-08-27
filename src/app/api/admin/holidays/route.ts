import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api-auth";
import { adminListHolidays, adminAddHoliday } from "@/db/queries";

export const dynamic = "force-dynamic";

const schema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), name: z.string().min(1) });

export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const holidays = await adminListHolidays();
  return NextResponse.json({ holidays });
}

export async function POST(request: Request) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  await adminAddHoliday(parsed.data.date, parsed.data.name);
  return NextResponse.json({ ok: true });
}

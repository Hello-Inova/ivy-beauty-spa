import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api-auth";
import { adminListProfessionals, adminCreateProfessional } from "@/db/queries";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  photo: z.string().optional(),
});

export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const professionals = await adminListProfessionals();
  return NextResponse.json({ professionals });
}

export async function POST(request: Request) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  const id = await adminCreateProfessional(parsed.data);
  return NextResponse.json({ id });
}

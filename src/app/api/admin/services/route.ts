import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api-auth";
import { adminListServices, adminCreateService } from "@/db/queries";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(1),
  benefits: z.string().optional(),
  importantInfo: z.string().optional(),
  duration: z.number().int().positive(),
  price: z.number().nonnegative(),
  image: z.string().optional(),
  professionalIds: z.array(z.string()).optional(),
});

export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const services = await adminListServices();
  return NextResponse.json({ services });
}

export async function POST(request: Request) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos.", details: parsed.error.flatten() }, { status: 400 });
  }
  const id = await adminCreateService(parsed.data);
  return NextResponse.json({ id });
}

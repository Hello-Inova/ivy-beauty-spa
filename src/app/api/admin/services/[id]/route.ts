import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api-auth";
import { adminUpdateService, adminDeleteService } from "@/db/queries";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  categoryId: z.string().min(1).optional(),
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().min(1).optional(),
  benefits: z.string().optional(),
  importantInfo: z.string().optional(),
  duration: z.number().int().positive().optional(),
  price: z.number().nonnegative().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  professionalIds: z.array(z.string()).optional(),
});

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/services/[id]">) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos.", details: parsed.error.flatten() }, { status: 400 });
  }
  await adminUpdateService(id, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/services/[id]">) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await ctx.params;
  await adminDeleteService(id);
  return NextResponse.json({ ok: true });
}

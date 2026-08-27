import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api-auth";
import { adminUpdateCategory, adminDeleteCategory } from "@/db/queries";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/categories/[id]">) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  await adminUpdateCategory(id, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/categories/[id]">) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await ctx.params;
  await adminDeleteCategory(id);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { adminRemoveHoliday } from "@/db/queries";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/holidays/[id]">) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await ctx.params;
  await adminRemoveHoliday(id);
  return NextResponse.json({ ok: true });
}

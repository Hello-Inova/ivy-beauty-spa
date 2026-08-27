import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { adminListCustomers } from "@/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const customers = await adminListCustomers();
  return NextResponse.json({ customers });
}

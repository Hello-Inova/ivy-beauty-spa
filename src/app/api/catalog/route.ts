import { NextResponse } from "next/server";
import { getCatalog } from "@/db/queries";

export const dynamic = "force-dynamic";

// Public: powers client-side islands that need a fresh copy of the catalog
// (e.g. the admin panel after a mutation). Server Components should prefer
// `src/lib/catalog.server.ts` directly instead of calling this over HTTP.
export async function GET() {
  const catalog = await getCatalog();
  return NextResponse.json(catalog);
}

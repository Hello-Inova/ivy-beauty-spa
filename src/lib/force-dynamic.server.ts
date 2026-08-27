import "server-only";
import { connection } from "next/server";
import { IS_DEMO_MODE } from "./demo-mode";

/**
 * Forces per-request rendering in real/server mode so catalog pages always
 * reflect the latest admin edits (Postgres reads aren't `fetch()` calls, so
 * Next has no other signal that this page is dynamic). In demo mode this is
 * a no-op — `connection()` is never called, which is required for a static
 * export build (see route-segment-config: `dynamic`/`dynamicParams` must be
 * static literals, so a runtime-guarded function call is used instead).
 */
export async function ensureDynamic() {
  if (!IS_DEMO_MODE) {
    await connection();
  }
}

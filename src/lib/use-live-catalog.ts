"use client";

import { useEffect, useState } from "react";
import { IS_DEMO_MODE } from "@/lib/demo-mode";
import { bookingClient } from "@/lib/booking-client";
import type { Catalog } from "@/lib/types";

/**
 * In demo mode (static export), public pages are pre-rendered once at
 * build time from the bundled seed data — admin edits (which only ever
 * touch the browser's localStorage) never reach that static HTML. That
 * means a photo attached to a service/professional in the admin panel
 * would show up there, but never on the actual site.
 *
 * This hook patches that gap: after mount it re-reads the catalog from
 * `bookingClient` (localStorage, in demo mode), so any admin edit shows up
 * on the public pages of that same browser — without giving up the fast
 * static first paint (the `initial` catalog renders immediately; this just
 * swaps it out once the live one is available, typically instantly).
 *
 * In full/server mode this is a no-op: the initial catalog already came
 * from a fresh per-request Postgres read (see `ensureDynamic()`), so
 * re-fetching it client-side would be redundant.
 */
export function useLiveCatalog(initial: Catalog): Catalog {
  const [catalog, setCatalog] = useState(initial);

  useEffect(() => {
    if (!IS_DEMO_MODE) return;
    let cancelled = false;
    bookingClient.getCatalog().then((live) => {
      if (!cancelled) setCatalog(live);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return catalog;
}

"use client";

import { IS_DEMO_MODE } from "@/lib/demo-mode";
import { ApiBookingClient } from "./api-client";
import { LocalBookingClient } from "./local-client";
import type { BookingClient } from "./types";

// NEXT_PUBLIC_DEMO_MODE is inlined at build time, so this branch is resolved
// once per build — the unused implementation is dead code in each bundle.
export const bookingClient: BookingClient = IS_DEMO_MODE ? new LocalBookingClient() : new ApiBookingClient();

export type { BookingClient, Result, WorkingHourInput, BusinessHourInput } from "./types";
export { resetDemoData } from "./local-client";

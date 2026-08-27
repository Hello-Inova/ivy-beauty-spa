import type {
  Catalog,
  CreateAppointmentInput,
  AppointmentRecord,
  AdminSession,
  DashboardStats,
  CustomerRecord,
  BlockedDateRecord,
  AppointmentStatus,
  Weekday,
  CatalogCategory,
  CatalogService,
  CatalogProfessional,
} from "@/lib/types";

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export interface WorkingHourInput {
  weekday: Weekday;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface BusinessHourInput {
  weekday: Weekday;
  isOpen: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

/**
 * Shared contract used by every interactive (client-side) part of the app:
 * the booking wizard and the whole admin panel. Two implementations exist —
 * `ApiBookingClient` (fetches the Next.js API routes backed by Postgres) and
 * `LocalBookingClient` (simulates everything in the browser via
 * localStorage, for the static "modo demonstração" build). `src/lib/
 * booking-client/index.ts` picks one at build time based on
 * NEXT_PUBLIC_DEMO_MODE, so every component only ever talks to this
 * interface.
 */
export interface BookingClient {
  getCatalog(): Promise<Catalog>;
  getAvailableSlots(serviceId: string, professionalId: string, date: string): Promise<string[]>;
  createAppointment(input: CreateAppointmentInput): Promise<Result<AppointmentRecord>>;

  adminLogin(email: string, password: string): Promise<Result<AdminSession>>;
  adminLogout(): Promise<void>;
  getAdminSession(): Promise<AdminSession | null>;

  getDashboardStats(): Promise<DashboardStats>;

  listAppointmentsAdmin(filters?: {
    from?: string;
    to?: string;
    status?: AppointmentStatus;
    professionalId?: string;
  }): Promise<AppointmentRecord[]>;
  updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Result<null>>;
  rescheduleAppointment(id: string, date: string, startTime: string, endTime: string): Promise<Result<null>>;

  listCustomersAdmin(): Promise<CustomerRecord[]>;

  createCategory(data: { name: string; slug: string; description?: string; order?: number }): Promise<Result<string>>;
  updateCategory(id: string, data: Partial<CatalogCategory>): Promise<Result<null>>;
  deleteCategory(id: string): Promise<Result<null>>;

  createService(data: {
    categoryId: string;
    name: string;
    slug: string;
    description: string;
    benefits?: string;
    importantInfo?: string;
    duration: number;
    price: number;
    image?: string;
    images?: string[];
    professionalIds?: string[];
  }): Promise<Result<string>>;
  updateService(id: string, data: Partial<CatalogService> & { professionalIds?: string[] }): Promise<Result<null>>;
  deleteService(id: string): Promise<Result<null>>;

  createProfessional(data: { name: string; description?: string; photo?: string }): Promise<Result<string>>;
  updateProfessional(id: string, data: Partial<CatalogProfessional>): Promise<Result<null>>;
  deleteProfessional(id: string): Promise<Result<null>>;
  setWorkingHours(professionalId: string, hours: WorkingHourInput[]): Promise<Result<null>>;

  getBusinessHours(): Promise<BusinessHourInput[]>;
  setBusinessHours(entry: BusinessHourInput): Promise<Result<null>>;

  listHolidays(): Promise<{ id: string; date: string; name: string }[]>;
  addHoliday(date: string, name: string): Promise<Result<null>>;
  removeHoliday(id: string): Promise<Result<null>>;

  listBlockedDates(): Promise<BlockedDateRecord[]>;
  addBlockedDate(professionalId: string | null, date: string, reason?: string): Promise<Result<null>>;
  removeBlockedDate(id: string): Promise<Result<null>>;
}

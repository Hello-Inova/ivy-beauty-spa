import type { Catalog, CreateAppointmentInput, AppointmentRecord, AdminSession, DashboardStats, CustomerRecord, BlockedDateRecord, AppointmentStatus, CatalogCategory, CatalogService, CatalogProfessional } from "@/lib/types";
import type { BookingClient, Result, WorkingHourInput, BusinessHourInput } from "./types";

async function req<T>(url: string, init?: RequestInit): Promise<Result<T>> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      credentials: "include",
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: body?.error || `Erro (${res.status})` };
    }
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, error: "Falha de conexão. Verifique sua internet e tente novamente." };
  }
}

export class ApiBookingClient implements BookingClient {
  async getCatalog(): Promise<Catalog> {
    // Public pages fetch the catalog server-side (see src/lib/catalog.server.ts);
    // this is only used by client islands that need a fresh copy (e.g. admin).
    const r = await req<Catalog>("/api/catalog");
    if (r.ok) return r.data;
    return { categories: [], services: [], professionals: [], businessHours: [], holidays: [] };
  }

  async getAvailableSlots(serviceId: string, professionalId: string, date: string): Promise<string[]> {
    const params = new URLSearchParams({ serviceId, professionalId, date });
    const r = await req<{ slots: string[] }>(`/api/availability?${params.toString()}`);
    return r.ok ? r.data.slots : [];
  }

  async createAppointment(input: CreateAppointmentInput): Promise<Result<AppointmentRecord>> {
    const r = await req<{ appointment: AppointmentRecord }>("/api/appointments", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!r.ok) return r;
    return { ok: true, data: r.data.appointment };
  }

  async adminLogin(email: string, password: string): Promise<Result<AdminSession>> {
    const r = await req<{ ok: true; user: AdminSession }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) return r;
    return { ok: true, data: r.data.user };
  }

  async adminLogout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  }

  async getAdminSession(): Promise<AdminSession | null> {
    // In full mode, the server layout (app/admin/layout.tsx) already
    // performs the authoritative check and passes the session down as a
    // prop, so this is a no-op fallback.
    return null;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const r = await req<DashboardStats>("/api/admin/dashboard");
    if (r.ok) return r.data;
    return { todayCount: 0, weekCount: 0, monthCount: 0, monthRevenue: 0, topServices: [], topProfessionals: [], recentCustomers: [] };
  }

  async listAppointmentsAdmin(filters?: { from?: string; to?: string; status?: AppointmentStatus; professionalId?: string }): Promise<AppointmentRecord[]> {
    const params = new URLSearchParams();
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.professionalId) params.set("professionalId", filters.professionalId);
    const r = await req<{ appointments: AppointmentRecord[] }>(`/api/admin/appointments?${params.toString()}`);
    return r.ok ? r.data.appointments : [];
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Result<null>> {
    const r = await req<{ ok: true }>(`/api/admin/appointments/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    return r.ok ? { ok: true, data: null } : r;
  }

  async rescheduleAppointment(id: string, date: string, startTime: string, endTime: string): Promise<Result<null>> {
    const r = await req<{ ok: true }>(`/api/admin/appointments/${id}`, { method: "PATCH", body: JSON.stringify({ date, startTime, endTime }) });
    return r.ok ? { ok: true, data: null } : r;
  }

  async listCustomersAdmin(): Promise<CustomerRecord[]> {
    const r = await req<{ customers: CustomerRecord[] }>("/api/admin/customers");
    return r.ok ? r.data.customers : [];
  }

  async createCategory(data: { name: string; slug: string; description?: string; order?: number }): Promise<Result<string>> {
    const r = await req<{ id: string }>("/api/admin/categories", { method: "POST", body: JSON.stringify(data) });
    return r.ok ? { ok: true, data: r.data.id } : r;
  }
  async updateCategory(id: string, data: Partial<CatalogCategory>): Promise<Result<null>> {
    const r = await req<{ ok: true }>(`/api/admin/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) });
    return r.ok ? { ok: true, data: null } : r;
  }
  async deleteCategory(id: string): Promise<Result<null>> {
    const r = await req<{ ok: true }>(`/api/admin/categories/${id}`, { method: "DELETE" });
    return r.ok ? { ok: true, data: null } : r;
  }

  async createService(data: { categoryId: string; name: string; slug: string; description: string; benefits?: string; importantInfo?: string; duration: number; price: number; image?: string; professionalIds?: string[] }): Promise<Result<string>> {
    const r = await req<{ id: string }>("/api/admin/services", { method: "POST", body: JSON.stringify(data) });
    return r.ok ? { ok: true, data: r.data.id } : r;
  }
  async updateService(id: string, data: Partial<CatalogService> & { professionalIds?: string[] }): Promise<Result<null>> {
    const r = await req<{ ok: true }>(`/api/admin/services/${id}`, { method: "PATCH", body: JSON.stringify(data) });
    return r.ok ? { ok: true, data: null } : r;
  }
  async deleteService(id: string): Promise<Result<null>> {
    const r = await req<{ ok: true }>(`/api/admin/services/${id}`, { method: "DELETE" });
    return r.ok ? { ok: true, data: null } : r;
  }

  async createProfessional(data: { name: string; description?: string; photo?: string }): Promise<Result<string>> {
    const r = await req<{ id: string }>("/api/admin/professionals", { method: "POST", body: JSON.stringify(data) });
    return r.ok ? { ok: true, data: r.data.id } : r;
  }
  async updateProfessional(id: string, data: Partial<CatalogProfessional>): Promise<Result<null>> {
    const r = await req<{ ok: true }>(`/api/admin/professionals/${id}`, { method: "PATCH", body: JSON.stringify(data) });
    return r.ok ? { ok: true, data: null } : r;
  }
  async deleteProfessional(id: string): Promise<Result<null>> {
    const r = await req<{ ok: true }>(`/api/admin/professionals/${id}`, { method: "DELETE" });
    return r.ok ? { ok: true, data: null } : r;
  }
  async setWorkingHours(professionalId: string, hours: WorkingHourInput[]): Promise<Result<null>> {
    const r = await req<{ ok: true }>(`/api/admin/professionals/${professionalId}/hours`, { method: "PUT", body: JSON.stringify(hours) });
    return r.ok ? { ok: true, data: null } : r;
  }

  async getBusinessHours(): Promise<BusinessHourInput[]> {
    const r = await req<{ businessHours: BusinessHourInput[] }>("/api/admin/business-hours");
    return r.ok ? r.data.businessHours : [];
  }
  async setBusinessHours(entry: BusinessHourInput): Promise<Result<null>> {
    const r = await req<{ ok: true }>("/api/admin/business-hours", { method: "PUT", body: JSON.stringify(entry) });
    return r.ok ? { ok: true, data: null } : r;
  }

  async listHolidays(): Promise<{ id: string; date: string; name: string }[]> {
    const r = await req<{ holidays: { id: string; date: string; name: string }[] }>("/api/admin/holidays");
    return r.ok ? r.data.holidays : [];
  }
  async addHoliday(date: string, name: string): Promise<Result<null>> {
    const r = await req<{ ok: true }>("/api/admin/holidays", { method: "POST", body: JSON.stringify({ date, name }) });
    return r.ok ? { ok: true, data: null } : r;
  }
  async removeHoliday(id: string): Promise<Result<null>> {
    const r = await req<{ ok: true }>(`/api/admin/holidays/${id}`, { method: "DELETE" });
    return r.ok ? { ok: true, data: null } : r;
  }

  async listBlockedDates(): Promise<BlockedDateRecord[]> {
    const r = await req<{ blockedDates: BlockedDateRecord[] }>("/api/admin/blocked-dates");
    return r.ok ? r.data.blockedDates : [];
  }
  async addBlockedDate(professionalId: string | null, date: string, reason?: string): Promise<Result<null>> {
    const r = await req<{ ok: true }>("/api/admin/blocked-dates", { method: "POST", body: JSON.stringify({ professionalId, date, reason }) });
    return r.ok ? { ok: true, data: null } : r;
  }
  async removeBlockedDate(id: string): Promise<Result<null>> {
    const r = await req<{ ok: true }>(`/api/admin/blocked-dates/${id}`, { method: "DELETE" });
    return r.ok ? { ok: true, data: null } : r;
  }
}

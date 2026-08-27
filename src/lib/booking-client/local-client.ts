"use client";

import type {
  Catalog,
  CatalogCategory,
  CatalogService,
  CatalogProfessional,
  CreateAppointmentInput,
  AppointmentRecord,
  AdminSession,
  DashboardStats,
  CustomerRecord,
  BlockedDateRecord,
  AppointmentStatus,
  BusinessHourEntry,
  HolidayEntry,
} from "@/lib/types";
import type { BookingClient, Result, WorkingHourInput, BusinessHourInput } from "./types";
import {
  CATEGORIES,
  SERVICES,
  PROFESSIONALS,
  BUSINESS_HOURS,
  HOLIDAYS,
  DEMO_ADMIN,
  type SeedCategory,
  type SeedService,
  type SeedProfessional,
} from "@/data/seed-data";
import { computeAvailableSlots, timeToMinutes, minutesToTime, todayISO, nowMinutesInTZ } from "@/lib/availability";
import { generateAppointmentCode } from "@/lib/format";

const STORAGE_KEY = "ivy-demo-db-v1";
const SESSION_KEY = "ivy-demo-session-v1";

interface LocalCustomer {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

interface LocalBlockedDate {
  id: string;
  professionalId: string | null;
  date: string;
  reason?: string;
}

interface LocalDB {
  categories: SeedCategory[];
  services: SeedService[];
  professionals: SeedProfessional[];
  businessHours: BusinessHourEntry[];
  holidays: HolidayEntry[];
  blockedDates: LocalBlockedDate[];
  appointments: AppointmentRecord[];
  customers: LocalCustomer[];
  seq: number;
}

function randomId(prefix: string): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now()}`;
}

function freshDB(): LocalDB {
  return {
    categories: JSON.parse(JSON.stringify(CATEGORIES)),
    services: JSON.parse(JSON.stringify(SERVICES)),
    professionals: JSON.parse(JSON.stringify(PROFESSIONALS)).map((p: SeedProfessional) => ({ ...p, blockedDates: [] })),
    businessHours: JSON.parse(JSON.stringify(BUSINESS_HOURS)),
    holidays: JSON.parse(JSON.stringify(HOLIDAYS)),
    blockedDates: [],
    appointments: [],
    customers: [],
    seq: 1000,
  };
}

function loadDB(): LocalDB {
  if (typeof window === "undefined") return freshDB();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const db = freshDB();
      saveDB(db);
      return db;
    }
    return JSON.parse(raw) as LocalDB;
  } catch {
    return freshDB();
  }
}

function saveDB(db: LocalDB) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — demo state just won't persist across reloads.
  }
}

export function resetDemoData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(SESSION_KEY);
}

function buildCatalog(db: LocalDB): Catalog {
  const categories: CatalogCategory[] = db.categories.map((c) => ({ ...c }));

  const services: CatalogService[] = db.services.map((s) => {
    const cat = db.categories.find((c) => c.id === s.categoryId);
    return {
      id: s.id,
      categoryId: s.categoryId,
      categorySlug: cat?.slug ?? "",
      categoryName: cat?.name ?? "",
      name: s.name,
      slug: s.slug,
      description: s.description,
      benefits: s.benefits,
      importantInfo: s.importantInfo,
      duration: s.duration,
      price: s.price,
      image: s.image,
      active: s.active,
      professionalIds: s.professionalIds,
    };
  });

  const generalBlocked = db.blockedDates.filter((b) => !b.professionalId).map((b) => b.date);
  const holidayDates = db.holidays.map((h) => h.date);

  const professionals: CatalogProfessional[] = db.professionals.map((p) => {
    const own = db.blockedDates.filter((b) => b.professionalId === p.id).map((b) => ({ date: b.date, reason: b.reason }));
    const merged = [...own];
    for (const d of [...generalBlocked, ...holidayDates]) {
      if (!merged.some((m) => m.date === d)) {
        const holiday = db.holidays.find((h) => h.date === d);
        merged.push({ date: d, reason: holiday?.name ?? "Bloqueio geral" });
      }
    }
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      photo: p.photo,
      active: p.active,
      serviceIds: db.services.filter((s) => s.professionalIds.includes(p.id)).map((s) => s.id),
      workingHours: p.workingHours,
      blockedDates: merged,
    };
  });

  return {
    categories,
    services,
    professionals,
    businessHours: db.businessHours,
    holidays: db.holidays,
  };
}

function resolveCandidateProfessionalIds(db: LocalDB, serviceId: string, requestedProfessionalId: string): string[] {
  const service = db.services.find((s) => s.id === serviceId);
  if (!service) return [];
  const eligible = db.professionals.filter((p) => p.active && service.professionalIds.includes(p.id)).map((p) => p.id);
  if (requestedProfessionalId === "any") return eligible;
  return eligible.filter((id) => id === requestedProfessionalId);
}

function appointmentsFor(db: LocalDB, professionalId: string, date: string) {
  return db.appointments.filter(
    (a) => a.professionalId === professionalId && a.date === date && a.status !== "CANCELLED" && a.status !== "NO_SHOW"
  );
}

function slotsForProfessional(db: LocalDB, service: SeedService, professional: SeedProfessional, date: string): string[] {
  const catalog = buildCatalog(db);
  const catProfessional = catalog.professionals.find((p) => p.id === professional.id)!;
  const today = todayISO();
  return computeAvailableSlots({
    date,
    durationMinutes: service.duration,
    businessHours: catalog.businessHours,
    professionalWorkingHours: catProfessional.workingHours,
    blockedDates: catProfessional.blockedDates.map((b) => b.date),
    existingAppointments: appointmentsFor(db, professional.id, date),
    nowMinutes: date === today ? nowMinutesInTZ() : null,
    minLeadMinutes: 30,
  });
}

export class LocalBookingClient implements BookingClient {
  async getCatalog(): Promise<Catalog> {
    return buildCatalog(loadDB());
  }

  async getAvailableSlots(serviceId: string, professionalId: string, date: string): Promise<string[]> {
    const db = loadDB();
    const service = db.services.find((s) => s.id === serviceId);
    if (!service) return [];
    const candidateIds = resolveCandidateProfessionalIds(db, serviceId, professionalId);
    const slotSet = new Set<string>();
    for (const pid of candidateIds) {
      const prof = db.professionals.find((p) => p.id === pid);
      if (!prof) continue;
      for (const slot of slotsForProfessional(db, service, prof, date)) slotSet.add(slot);
    }
    return Array.from(slotSet).sort();
  }

  async createAppointment(input: CreateAppointmentInput): Promise<Result<AppointmentRecord>> {
    const db = loadDB();
    const service = db.services.find((s) => s.id === input.serviceId && s.active);
    if (!service) return { ok: false, error: "Serviço não encontrado." };

    const candidateIds = resolveCandidateProfessionalIds(db, input.serviceId, input.professionalId);
    if (candidateIds.length === 0) {
      return { ok: false, error: "Profissional não disponível para este serviço." };
    }

    let chosenProfessionalId: string | null = null;
    for (const pid of candidateIds) {
      const prof = db.professionals.find((p) => p.id === pid)!;
      const slots = slotsForProfessional(db, service, prof, input.date);
      if (slots.includes(input.startTime)) {
        chosenProfessionalId = pid;
        break;
      }
    }

    if (!chosenProfessionalId) {
      return { ok: false, error: "Este horário não está mais disponível. Por favor escolha outro horário." };
    }

    // Final race-condition guard (re-check right before writing).
    const endTime = minutesToTime(timeToMinutes(input.startTime) + service.duration);
    const conflict = db.appointments.some(
      (a) =>
        a.professionalId === chosenProfessionalId &&
        a.date === input.date &&
        a.status !== "CANCELLED" &&
        a.status !== "NO_SHOW" &&
        timeToMinutes(a.startTime) < timeToMinutes(endTime) &&
        timeToMinutes(a.endTime) > timeToMinutes(input.startTime)
    );
    if (conflict) {
      return { ok: false, error: "Este horário acabou de ser reservado. Escolha outro horário." };
    }

    let customer = db.customers.find((c) => c.whatsapp === input.customerWhatsapp);
    if (!customer) {
      customer = {
        id: randomId("cus"),
        name: input.customerName,
        whatsapp: input.customerWhatsapp,
        email: input.customerEmail,
        createdAt: new Date().toISOString(),
      };
      db.customers.push(customer);
    } else {
      customer.name = input.customerName;
      customer.email = input.customerEmail ?? customer.email;
    }

    const professional = db.professionals.find((p) => p.id === chosenProfessionalId)!;
    db.seq += 1;
    const appointment: AppointmentRecord = {
      id: randomId("apt"),
      code: generateAppointmentCode(db.seq),
      customerId: customer.id,
      customerName: customer.name,
      customerWhatsapp: customer.whatsapp,
      customerEmail: customer.email,
      notes: input.notes,
      serviceId: service.id,
      serviceName: service.name,
      professionalId: professional.id,
      professionalName: professional.name,
      date: input.date,
      startTime: input.startTime,
      endTime,
      status: "CONFIRMED",
      priceAtBooking: service.price,
      createdAt: new Date().toISOString(),
    };
    db.appointments.push(appointment);
    saveDB(db);
    return { ok: true, data: appointment };
  }

  async adminLogin(email: string, password: string): Promise<Result<AdminSession>> {
    if (email.trim().toLowerCase() === DEMO_ADMIN.email.toLowerCase() && password === DEMO_ADMIN.password) {
      const session: AdminSession = { name: DEMO_ADMIN.name, email: DEMO_ADMIN.email };
      if (typeof window !== "undefined") window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { ok: true, data: session };
    }
    return { ok: false, error: "E-mail ou senha incorretos." };
  }

  async adminLogout(): Promise<void> {
    if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
  }

  async getAdminSession(): Promise<AdminSession | null> {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AdminSession) : null;
    } catch {
      return null;
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const db = loadDB();
    const today = todayISO();
    const [y, m, d] = today.split("-").map(Number);
    const todayDate = new Date(Date.UTC(y, m - 1, d));
    const dow = todayDate.getUTCDay();
    const weekStart = new Date(todayDate);
    weekStart.setUTCDate(weekStart.getUTCDate() - dow);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
    const monthPrefix = today.slice(0, 7);

    const iso = (dt: Date) => dt.toISOString().slice(0, 10);
    const active = db.appointments.filter((a) => a.status !== "CANCELLED");

    const todayCount = active.filter((a) => a.date === today).length;
    const weekCount = active.filter((a) => a.date >= iso(weekStart) && a.date <= iso(weekEnd)).length;
    const monthAppointments = active.filter((a) => a.date.startsWith(monthPrefix));
    const monthCount = monthAppointments.length;
    const monthRevenue = monthAppointments
      .filter((a) => a.status === "CONFIRMED" || a.status === "COMPLETED")
      .reduce((sum, a) => sum + a.priceAtBooking, 0);

    const countBy = (items: AppointmentRecord[], key: (a: AppointmentRecord) => string) => {
      const map = new Map<string, number>();
      for (const it of items) map.set(key(it), (map.get(key(it)) ?? 0) + 1);
      return Array.from(map.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    };

    return {
      todayCount,
      weekCount,
      monthCount,
      monthRevenue,
      topServices: countBy(active, (a) => a.serviceName),
      topProfessionals: countBy(active, (a) => a.professionalName),
      recentCustomers: [...db.customers]
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 5)
        .map((c) => ({ id: c.id, name: c.name, whatsapp: c.whatsapp, createdAt: c.createdAt })),
    };
  }

  async listAppointmentsAdmin(filters?: { from?: string; to?: string; status?: AppointmentStatus; professionalId?: string }): Promise<AppointmentRecord[]> {
    const db = loadDB();
    return db.appointments
      .filter((a) => (filters?.from ? a.date >= filters.from : true))
      .filter((a) => (filters?.to ? a.date <= filters.to : true))
      .filter((a) => (filters?.status ? a.status === filters.status : true))
      .filter((a) => (filters?.professionalId ? a.professionalId === filters.professionalId : true))
      .sort((a, b) => (a.date === b.date ? a.startTime.localeCompare(b.startTime) : b.date.localeCompare(a.date)));
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Result<null>> {
    const db = loadDB();
    const apt = db.appointments.find((a) => a.id === id);
    if (!apt) return { ok: false, error: "Agendamento não encontrado." };
    apt.status = status;
    saveDB(db);
    return { ok: true, data: null };
  }

  async rescheduleAppointment(id: string, date: string, startTime: string, endTime: string): Promise<Result<null>> {
    const db = loadDB();
    const apt = db.appointments.find((a) => a.id === id);
    if (!apt) return { ok: false, error: "Agendamento não encontrado." };
    const conflict = db.appointments.some(
      (a) =>
        a.id !== id &&
        a.professionalId === apt.professionalId &&
        a.date === date &&
        a.status !== "CANCELLED" &&
        a.status !== "NO_SHOW" &&
        timeToMinutes(a.startTime) < timeToMinutes(endTime) &&
        timeToMinutes(a.endTime) > timeToMinutes(startTime)
    );
    if (conflict) return { ok: false, error: "Este horário já está ocupado." };
    apt.date = date;
    apt.startTime = startTime;
    apt.endTime = endTime;
    saveDB(db);
    return { ok: true, data: null };
  }

  async listCustomersAdmin(): Promise<CustomerRecord[]> {
    const db = loadDB();
    return db.customers.map((c) => {
      const apts = db.appointments.filter((a) => a.customerId === c.id);
      const last = apts.map((a) => a.date).sort().at(-1) ?? null;
      return {
        id: c.id,
        name: c.name,
        whatsapp: c.whatsapp,
        email: c.email,
        notes: c.notes,
        createdAt: c.createdAt,
        totalAppointments: apts.length,
        lastAppointmentDate: last,
      };
    });
  }

  async createCategory(data: { name: string; slug: string; description?: string; order?: number }): Promise<Result<string>> {
    const db = loadDB();
    const id = randomId("cat");
    db.categories.push({ id, name: data.name, slug: data.slug, description: data.description ?? "", active: true, order: data.order ?? db.categories.length + 1 });
    saveDB(db);
    return { ok: true, data: id };
  }
  async updateCategory(id: string, data: Partial<CatalogCategory>): Promise<Result<null>> {
    const db = loadDB();
    const cat = db.categories.find((c) => c.id === id);
    if (!cat) return { ok: false, error: "Categoria não encontrada." };
    Object.assign(cat, data);
    saveDB(db);
    return { ok: true, data: null };
  }
  async deleteCategory(id: string): Promise<Result<null>> {
    const db = loadDB();
    db.categories = db.categories.filter((c) => c.id !== id);
    saveDB(db);
    return { ok: true, data: null };
  }

  async createService(data: { categoryId: string; name: string; slug: string; description: string; benefits?: string; importantInfo?: string; duration: number; price: number; image?: string; professionalIds?: string[] }): Promise<Result<string>> {
    const db = loadDB();
    const id = randomId("svc");
    db.services.push({
      id,
      categoryId: data.categoryId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      benefits: data.benefits ?? "",
      importantInfo: data.importantInfo ?? "",
      duration: data.duration,
      price: data.price,
      image: data.image ?? "/images/placeholders/svc-spa-1.png",
      active: true,
      professionalIds: data.professionalIds ?? [],
    });
    saveDB(db);
    return { ok: true, data: id };
  }
  async updateService(id: string, data: Partial<CatalogService> & { professionalIds?: string[] }): Promise<Result<null>> {
    const db = loadDB();
    const svc = db.services.find((s) => s.id === id);
    if (!svc) return { ok: false, error: "Serviço não encontrado." };
    Object.assign(svc, data);
    saveDB(db);
    return { ok: true, data: null };
  }
  async deleteService(id: string): Promise<Result<null>> {
    const db = loadDB();
    db.services = db.services.filter((s) => s.id !== id);
    saveDB(db);
    return { ok: true, data: null };
  }

  async createProfessional(data: { name: string; description?: string; photo?: string }): Promise<Result<string>> {
    const db = loadDB();
    const id = randomId("pro");
    db.professionals.push({
      id,
      name: data.name,
      description: data.description ?? "",
      photo: data.photo ?? "/images/placeholders/pro-1.png",
      active: true,
      workingHours: [],
      blockedDates: [],
    });
    saveDB(db);
    return { ok: true, data: id };
  }
  async updateProfessional(id: string, data: Partial<CatalogProfessional>): Promise<Result<null>> {
    const db = loadDB();
    const prof = db.professionals.find((p) => p.id === id);
    if (!prof) return { ok: false, error: "Profissional não encontrada." };
    Object.assign(prof, data);
    saveDB(db);
    return { ok: true, data: null };
  }
  async deleteProfessional(id: string): Promise<Result<null>> {
    const db = loadDB();
    db.professionals = db.professionals.filter((p) => p.id !== id);
    saveDB(db);
    return { ok: true, data: null };
  }
  async setWorkingHours(professionalId: string, hours: WorkingHourInput[]): Promise<Result<null>> {
    const db = loadDB();
    const prof = db.professionals.find((p) => p.id === professionalId);
    if (!prof) return { ok: false, error: "Profissional não encontrada." };
    prof.workingHours = hours;
    saveDB(db);
    return { ok: true, data: null };
  }

  async getBusinessHours(): Promise<BusinessHourInput[]> {
    return loadDB().businessHours.map((b) => ({
      weekday: b.weekday,
      isOpen: b.isOpen,
      startTime: b.startTime,
      endTime: b.endTime,
      breakStart: b.breakStart ?? undefined,
      breakEnd: b.breakEnd ?? undefined,
    }));
  }
  async setBusinessHours(entry: BusinessHourInput): Promise<Result<null>> {
    const db = loadDB();
    const idx = db.businessHours.findIndex((b) => b.weekday === entry.weekday);
    if (idx >= 0) db.businessHours[idx] = entry;
    else db.businessHours.push(entry);
    saveDB(db);
    return { ok: true, data: null };
  }

  async listHolidays(): Promise<{ id: string; date: string; name: string }[]> {
    return loadDB().holidays.map((h) => ({ id: h.date, date: h.date, name: h.name }));
  }
  async addHoliday(date: string, name: string): Promise<Result<null>> {
    const db = loadDB();
    db.holidays.push({ date, name });
    saveDB(db);
    return { ok: true, data: null };
  }
  async removeHoliday(id: string): Promise<Result<null>> {
    const db = loadDB();
    db.holidays = db.holidays.filter((h) => h.date !== id);
    saveDB(db);
    return { ok: true, data: null };
  }

  async listBlockedDates(): Promise<BlockedDateRecord[]> {
    return loadDB().blockedDates;
  }
  async addBlockedDate(professionalId: string | null, date: string, reason?: string): Promise<Result<null>> {
    const db = loadDB();
    db.blockedDates.push({ id: randomId("blk"), professionalId, date, reason });
    saveDB(db);
    return { ok: true, data: null };
  }
  async removeBlockedDate(id: string): Promise<Result<null>> {
    const db = loadDB();
    db.blockedDates = db.blockedDates.filter((b) => b.id !== id);
    saveDB(db);
    return { ok: true, data: null };
  }
}

import "server-only";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "./index";
import * as t from "./schema";
import type {
  Catalog,
  CatalogCategory,
  CatalogProfessional,
  CatalogService,
  AppointmentRecord,
  AppointmentStatus,
  CustomerRecord,
} from "@/lib/types";
import { generateAppointmentCode } from "@/lib/format";

function randomId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

// ---------------------------------------------------------------------------
// Catalog (public, read-mostly)
// ---------------------------------------------------------------------------

export async function getCatalog(): Promise<Catalog> {
  const [categories, services, professionals, professionalServices, workingHours, blockedDates, businessHours, holidays] =
    await Promise.all([
      db.select().from(t.categories).orderBy(asc(t.categories.order)),
      db.select().from(t.services).orderBy(asc(t.services.createdAt)),
      db.select().from(t.professionals).orderBy(asc(t.professionals.name)),
      db.select().from(t.professionalServices),
      db.select().from(t.workingHours),
      db.select().from(t.blockedDates),
      db.select().from(t.businessHours),
      db.select().from(t.holidays),
    ]);

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const catalogServices: CatalogService[] = services.map((s) => {
    const cat = categoryById.get(s.categoryId);
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
      price: Number(s.price),
      image: s.image,
      images: s.images ?? [],
      active: s.active,
      professionalIds: professionalServices
        .filter((ps) => ps.serviceId === s.id)
        .map((ps) => ps.professionalId),
    };
  });

  const catalogProfessionals: CatalogProfessional[] = professionals.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    photo: p.photo,
    active: p.active,
    serviceIds: professionalServices
      .filter((ps) => ps.professionalId === p.id)
      .map((ps) => ps.serviceId),
    workingHours: workingHours
      .filter((w) => w.professionalId === p.id)
      .map((w) => ({
        weekday: w.weekday,
        startTime: w.startTime,
        endTime: w.endTime,
        breakStart: w.breakStart,
        breakEnd: w.breakEnd,
      })),
    blockedDates: blockedDates
      .filter((b) => b.professionalId === p.id)
      .map((b) => ({ date: String(b.date), reason: b.reason })),
  }));

  const catalogCategories: CatalogCategory[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    active: c.active,
    order: c.order,
  }));

  // Business-wide blocked dates (professionalId is null) apply to every professional.
  const businessBlocked = blockedDates.filter((b) => !b.professionalId).map((b) => String(b.date));
  for (const prof of catalogProfessionals) {
    for (const d of businessBlocked) {
      if (!prof.blockedDates.some((bd) => bd.date === d)) {
        prof.blockedDates.push({ date: d, reason: "Feriado / bloqueio geral" });
      }
    }
  }
  for (const h of holidays) {
    const date = String(h.date);
    for (const prof of catalogProfessionals) {
      if (!prof.blockedDates.some((bd) => bd.date === date)) {
        prof.blockedDates.push({ date, reason: h.name });
      }
    }
  }

  return {
    categories: catalogCategories,
    services: catalogServices,
    professionals: catalogProfessionals,
    businessHours: businessHours.map((b) => ({
      weekday: b.weekday,
      isOpen: b.isOpen,
      startTime: b.startTime,
      endTime: b.endTime,
      breakStart: b.breakStart,
      breakEnd: b.breakEnd,
    })),
    holidays: holidays.map((h) => ({ date: String(h.date), name: h.name })),
  };
}

export async function getAppointmentsForProfessionalOnDate(
  professionalId: string,
  date: string
) {
  const rows = await db
    .select({ startTime: t.appointments.startTime, endTime: t.appointments.endTime })
    .from(t.appointments)
    .where(
      and(
        eq(t.appointments.professionalId, professionalId),
        eq(t.appointments.date, date),
        sql`${t.appointments.status} NOT IN ('CANCELLED', 'NO_SHOW')`
      )
    );
  return rows;
}

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

export class SlotUnavailableError extends Error {
  constructor() {
    super("Este horário acabou de ser reservado. Escolha outro horário.");
    this.name = "SlotUnavailableError";
  }
}

export async function createAppointment(input: {
  serviceId: string;
  professionalId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  customerName: string;
  customerWhatsapp: string;
  customerEmail?: string;
  notes?: string;
}): Promise<AppointmentRecord> {
  return db.transaction(async (tx) => {
    // find-or-create customer by whatsapp
    let customer = (
      await tx
        .select()
        .from(t.customers)
        .where(eq(t.customers.whatsapp, input.customerWhatsapp))
        .limit(1)
    )[0];

    if (!customer) {
      const id = randomId("cus");
      await tx.insert(t.customers).values({
        id,
        name: input.customerName,
        whatsapp: input.customerWhatsapp,
        email: input.customerEmail,
      });
      customer = (await tx.select().from(t.customers).where(eq(t.customers.id, id)))[0];
    } else {
      await tx
        .update(t.customers)
        .set({ name: input.customerName, email: input.customerEmail ?? customer.email })
        .where(eq(t.customers.id, customer.id));
    }

    // Double-booking guard: re-check inside the transaction, then rely on the
    // unique index (professionalId, date, startTime) as the final safety net.
    const conflict = await tx
      .select({ id: t.appointments.id })
      .from(t.appointments)
      .where(
        and(
          eq(t.appointments.professionalId, input.professionalId),
          eq(t.appointments.date, input.date),
          sql`${t.appointments.status} NOT IN ('CANCELLED', 'NO_SHOW')`,
          sql`${t.appointments.startTime} < ${input.endTime}`,
          sql`${t.appointments.endTime} > ${input.startTime}`
        )
      );
    if (conflict.length > 0) {
      throw new SlotUnavailableError();
    }

    const countRow = await tx.select({ count: sql<number>`count(*)::int` }).from(t.appointments);
    const seq = (countRow[0]?.count ?? 0) + 1001;

    const id = randomId("apt");
    const code = generateAppointmentCode(seq);

    try {
      await tx.insert(t.appointments).values({
        id,
        code,
        customerId: customer.id,
        serviceId: input.serviceId,
        professionalId: input.professionalId,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        status: "CONFIRMED",
        notes: input.notes,
        priceAtBooking: input.price.toFixed(2),
      });
    } catch {
      // Unique constraint violation => someone else booked this exact slot concurrently.
      throw new SlotUnavailableError();
    }

    const [service, professional] = await Promise.all([
      tx.select().from(t.services).where(eq(t.services.id, input.serviceId)).then((r) => r[0]),
      tx.select().from(t.professionals).where(eq(t.professionals.id, input.professionalId)).then((r) => r[0]),
    ]);

    return {
      id,
      code,
      customerId: customer.id,
      customerName: customer.name,
      customerWhatsapp: customer.whatsapp,
      customerEmail: customer.email,
      notes: input.notes,
      serviceId: input.serviceId,
      serviceName: service?.name ?? "",
      professionalId: input.professionalId,
      professionalName: professional?.name ?? "",
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      status: "CONFIRMED",
      priceAtBooking: input.price,
      createdAt: new Date().toISOString(),
    };
  });
}

export async function listAppointments(filters?: {
  from?: string;
  to?: string;
  status?: AppointmentStatus;
  professionalId?: string;
}): Promise<AppointmentRecord[]> {
  const conditions = [];
  if (filters?.from) conditions.push(gte(t.appointments.date, filters.from));
  if (filters?.to) conditions.push(lte(t.appointments.date, filters.to));
  if (filters?.status) conditions.push(eq(t.appointments.status, filters.status));
  if (filters?.professionalId) conditions.push(eq(t.appointments.professionalId, filters.professionalId));

  const rows = await db
    .select({
      appointment: t.appointments,
      customer: t.customers,
      service: t.services,
      professional: t.professionals,
    })
    .from(t.appointments)
    .innerJoin(t.customers, eq(t.appointments.customerId, t.customers.id))
    .innerJoin(t.services, eq(t.appointments.serviceId, t.services.id))
    .innerJoin(t.professionals, eq(t.appointments.professionalId, t.professionals.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(t.appointments.date), asc(t.appointments.startTime));

  return rows.map((r) => ({
    id: r.appointment.id,
    code: r.appointment.code,
    customerId: r.customer.id,
    customerName: r.customer.name,
    customerWhatsapp: r.customer.whatsapp,
    customerEmail: r.customer.email,
    notes: r.appointment.notes,
    serviceId: r.service.id,
    serviceName: r.service.name,
    professionalId: r.professional.id,
    professionalName: r.professional.name,
    date: String(r.appointment.date),
    startTime: r.appointment.startTime,
    endTime: r.appointment.endTime,
    status: r.appointment.status,
    priceAtBooking: Number(r.appointment.priceAtBooking),
    createdAt: r.appointment.createdAt.toISOString(),
  }));
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  await db.update(t.appointments).set({ status }).where(eq(t.appointments.id, id));
}

export async function rescheduleAppointment(
  id: string,
  date: string,
  startTime: string,
  endTime: string
) {
  const conflict = await db
    .select({ id: t.appointments.id })
    .from(t.appointments)
    .where(
      and(
        eq(t.appointments.date, date),
        sql`${t.appointments.status} NOT IN ('CANCELLED', 'NO_SHOW')`,
        sql`${t.appointments.startTime} < ${endTime}`,
        sql`${t.appointments.endTime} > ${startTime}`,
        sql`${t.appointments.id} != ${id}`
      )
    );
  if (conflict.length > 0) throw new SlotUnavailableError();

  await db.update(t.appointments).set({ date, startTime, endTime }).where(eq(t.appointments.id, id));
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export async function getDashboardStats(todayISO: string, weekStart: string, weekEnd: string, monthStart: string, monthEnd: string) {
  const [todayCount, weekCount, monthCount, revenueRows, topServices, topProfessionals, recentCustomers] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(t.appointments)
        .where(and(eq(t.appointments.date, todayISO), sql`${t.appointments.status} != 'CANCELLED'`)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(t.appointments)
        .where(and(gte(t.appointments.date, weekStart), lte(t.appointments.date, weekEnd), sql`${t.appointments.status} != 'CANCELLED'`)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(t.appointments)
        .where(and(gte(t.appointments.date, monthStart), lte(t.appointments.date, monthEnd), sql`${t.appointments.status} != 'CANCELLED'`)),
      db
        .select({ total: sql<string>`coalesce(sum(${t.appointments.priceAtBooking}), 0)` })
        .from(t.appointments)
        .where(and(gte(t.appointments.date, monthStart), lte(t.appointments.date, monthEnd), sql`${t.appointments.status} IN ('CONFIRMED','COMPLETED')`)),
      db
        .select({ name: t.services.name, count: sql<number>`count(*)::int` })
        .from(t.appointments)
        .innerJoin(t.services, eq(t.appointments.serviceId, t.services.id))
        .where(sql`${t.appointments.status} != 'CANCELLED'`)
        .groupBy(t.services.name)
        .orderBy(desc(sql`count(*)`))
        .limit(5),
      db
        .select({ name: t.professionals.name, count: sql<number>`count(*)::int` })
        .from(t.appointments)
        .innerJoin(t.professionals, eq(t.appointments.professionalId, t.professionals.id))
        .where(sql`${t.appointments.status} != 'CANCELLED'`)
        .groupBy(t.professionals.name)
        .orderBy(desc(sql`count(*)`))
        .limit(5),
      db.select().from(t.customers).orderBy(desc(t.customers.createdAt)).limit(5),
    ]);

  return {
    todayCount: todayCount[0]?.count ?? 0,
    weekCount: weekCount[0]?.count ?? 0,
    monthCount: monthCount[0]?.count ?? 0,
    monthRevenue: Number(revenueRows[0]?.total ?? 0),
    topServices,
    topProfessionals,
    recentCustomers,
  };
}

// ---------------------------------------------------------------------------
// Admin CRUD — categories
// ---------------------------------------------------------------------------

export async function adminListCategories() {
  return db.select().from(t.categories).orderBy(asc(t.categories.order));
}
export async function adminCreateCategory(data: { name: string; slug: string; description?: string; order?: number }) {
  const id = randomId("cat");
  await db.insert(t.categories).values({ id, ...data });
  return id;
}
export async function adminUpdateCategory(id: string, data: Partial<{ name: string; slug: string; description: string; active: boolean; order: number }>) {
  await db.update(t.categories).set(data).where(eq(t.categories.id, id));
}
export async function adminDeleteCategory(id: string) {
  await db.delete(t.categories).where(eq(t.categories.id, id));
}

// ---------------------------------------------------------------------------
// Admin CRUD — services
// ---------------------------------------------------------------------------

export async function adminListServices() {
  return db.select().from(t.services).orderBy(asc(t.services.name));
}
export async function adminCreateService(data: {
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
}) {
  const id = randomId("svc");
  await db.insert(t.services).values({
    id,
    categoryId: data.categoryId,
    name: data.name,
    slug: data.slug,
    description: data.description,
    benefits: data.benefits,
    importantInfo: data.importantInfo,
    duration: data.duration,
    price: data.price.toFixed(2),
    image: data.image,
    images: data.images ?? [],
  });
  if (data.professionalIds?.length) {
    await db.insert(t.professionalServices).values(
      data.professionalIds.map((pid) => ({ professionalId: pid, serviceId: id }))
    );
  }
  return id;
}
export async function adminUpdateService(
  id: string,
  data: Partial<{
    categoryId: string;
    name: string;
    slug: string;
    description: string;
    benefits: string;
    importantInfo: string;
    duration: number;
    price: number;
    image: string;
    images: string[];
    active: boolean;
    professionalIds: string[];
  }>
) {
  const { professionalIds, price, ...rest } = data;
  await db
    .update(t.services)
    .set({ ...rest, ...(price !== undefined ? { price: price.toFixed(2) } : {}) })
    .where(eq(t.services.id, id));
  if (professionalIds) {
    await db.delete(t.professionalServices).where(eq(t.professionalServices.serviceId, id));
    if (professionalIds.length) {
      await db.insert(t.professionalServices).values(
        professionalIds.map((pid) => ({ professionalId: pid, serviceId: id }))
      );
    }
  }
}
export async function adminDeleteService(id: string) {
  await db.delete(t.services).where(eq(t.services.id, id));
}

// ---------------------------------------------------------------------------
// Admin CRUD — professionals
// ---------------------------------------------------------------------------

export async function adminListProfessionals() {
  return db.select().from(t.professionals).orderBy(asc(t.professionals.name));
}
export async function adminCreateProfessional(data: { name: string; description?: string; photo?: string }) {
  const id = randomId("pro");
  await db.insert(t.professionals).values({ id, ...data });
  return id;
}
export async function adminUpdateProfessional(id: string, data: Partial<{ name: string; description: string; photo: string; active: boolean }>) {
  await db.update(t.professionals).set(data).where(eq(t.professionals.id, id));
}
export async function adminDeleteProfessional(id: string) {
  await db.delete(t.professionals).where(eq(t.professionals.id, id));
}

export async function adminSetWorkingHours(
  professionalId: string,
  hours: { weekday: string; startTime: string; endTime: string; breakStart?: string; breakEnd?: string }[]
) {
  await db.delete(t.workingHours).where(eq(t.workingHours.professionalId, professionalId));
  if (hours.length) {
    await db.insert(t.workingHours).values(
      hours.map((h) => ({
        id: randomId("wh"),
        professionalId,
        weekday: h.weekday as (typeof t.workingHours.$inferInsert)["weekday"],
        startTime: h.startTime,
        endTime: h.endTime,
        breakStart: h.breakStart,
        breakEnd: h.breakEnd,
      }))
    );
  }
}

export async function adminAddBlockedDate(professionalId: string | null, date: string, reason?: string) {
  await db.insert(t.blockedDates).values({ id: randomId("blk"), professionalId, date, reason });
}
export async function adminRemoveBlockedDate(id: string) {
  await db.delete(t.blockedDates).where(eq(t.blockedDates.id, id));
}
export async function adminListBlockedDates() {
  return db.select().from(t.blockedDates).orderBy(asc(t.blockedDates.date));
}

export async function adminGetBusinessHours() {
  return db.select().from(t.businessHours);
}
export async function adminSetBusinessHours(
  weekday: string,
  data: { isOpen: boolean; startTime: string; endTime: string; breakStart?: string; breakEnd?: string }
) {
  const weekdayValue = weekday as (typeof t.businessHours.$inferInsert)["weekday"];
  const existing = await db
    .select()
    .from(t.businessHours)
    .where(eq(t.businessHours.weekday, weekdayValue));
  if (existing.length) {
    await db
      .update(t.businessHours)
      .set(data)
      .where(eq(t.businessHours.weekday, weekdayValue));
  } else {
    await db.insert(t.businessHours).values({
      id: randomId("bh"),
      weekday: weekdayValue,
      ...data,
    });
  }
}

export async function adminListHolidays() {
  return db.select().from(t.holidays).orderBy(asc(t.holidays.date));
}
export async function adminAddHoliday(date: string, name: string) {
  await db.insert(t.holidays).values({ id: randomId("hol"), date, name });
}
export async function adminRemoveHoliday(id: string) {
  await db.delete(t.holidays).where(eq(t.holidays.id, id));
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export async function adminListCustomers(): Promise<CustomerRecord[]> {
  const customers = await db.select().from(t.customers).orderBy(desc(t.customers.createdAt));
  const stats = await db
    .select({
      customerId: t.appointments.customerId,
      total: sql<number>`count(*)::int`,
      last: sql<string>`max(${t.appointments.date})`,
    })
    .from(t.appointments)
    .groupBy(t.appointments.customerId);
  const statsMap = new Map(stats.map((s) => [s.customerId, s]));

  return customers.map((c) => ({
    id: c.id,
    name: c.name,
    whatsapp: c.whatsapp,
    email: c.email,
    notes: c.notes,
    createdAt: c.createdAt.toISOString(),
    totalAppointments: statsMap.get(c.id)?.total ?? 0,
    lastAppointmentDate: statsMap.get(c.id)?.last ?? null,
  }));
}

// ---------------------------------------------------------------------------
// Users (admin auth)
// ---------------------------------------------------------------------------

export async function getUserByEmail(email: string) {
  const rows = await db.select().from(t.users).where(eq(t.users.email, email)).limit(1);
  return rows[0] ?? null;
}

export async function createUser(data: { name: string; email: string; passwordHash: string }) {
  const id = randomId("usr");
  await db.insert(t.users).values({ id, ...data, role: "ADMIN" });
  return id;
}

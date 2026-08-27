// Ivy Beauty e Spa — Drizzle ORM schema (PostgreSQL)
// Mirrors the structure requested in the spec: users, customers, categories,
// services, professionals, professional_services, working_hours,
// blocked_dates, appointments — plus business_hours/holidays to support the
// admin "horários" configuration screen.

import {
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  numeric,
  date,
  timestamp,
  uniqueIndex,
  index,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["ADMIN", "STAFF"]);
export const weekdayEnum = pgEnum("weekday", [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("ADMIN"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const customers = pgTable(
  "customers",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    whatsapp: varchar("whatsapp", { length: 32 }).notNull(),
    email: varchar("email", { length: 255 }),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("customers_whatsapp_idx").on(t.whatsapp)]
);

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  order: integer("order").notNull().default(0),
});

export const services = pgTable("services", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  description: text("description").notNull(),
  benefits: text("benefits"),
  importantInfo: text("important_info"),
  duration: integer("duration").notNull(), // minutes
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const professionals = pgTable("professionals", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  photo: text("photo"),
  active: boolean("active").notNull().default(true),
});

export const professionalServices = pgTable(
  "professional_services",
  {
    professionalId: text("professional_id")
      .notNull()
      .references(() => professionals.id, { onDelete: "cascade" }),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.professionalId, t.serviceId] })]
);

export const workingHours = pgTable(
  "working_hours",
  {
    id: text("id").primaryKey(),
    professionalId: text("professional_id")
      .notNull()
      .references(() => professionals.id, { onDelete: "cascade" }),
    weekday: weekdayEnum("weekday").notNull(),
    startTime: varchar("start_time", { length: 5 }).notNull(), // "09:00"
    endTime: varchar("end_time", { length: 5 }).notNull(), // "18:00"
    breakStart: varchar("break_start", { length: 5 }),
    breakEnd: varchar("break_end", { length: 5 }),
  },
  (t) => [index("working_hours_prof_weekday_idx").on(t.professionalId, t.weekday)]
);

export const blockedDates = pgTable(
  "blocked_dates",
  {
    id: text("id").primaryKey(),
    professionalId: text("professional_id").references(() => professionals.id, {
      onDelete: "cascade",
    }), // null = blocks the whole business (holiday)
    date: date("date").notNull(),
    reason: text("reason"),
  },
  (t) => [index("blocked_dates_prof_date_idx").on(t.professionalId, t.date)]
);

export const appointments = pgTable(
  "appointments",
  {
    id: text("id").primaryKey(),
    code: varchar("code", { length: 32 }).notNull().unique(),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id),
    professionalId: text("professional_id")
      .notNull()
      .references(() => professionals.id),
    date: date("date").notNull(),
    startTime: varchar("start_time", { length: 5 }).notNull(),
    endTime: varchar("end_time", { length: 5 }).notNull(),
    status: appointmentStatusEnum("status").notNull().default("CONFIRMED"),
    notes: text("notes"),
    priceAtBooking: numeric("price_at_booking", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("appointments_prof_date_start_unique").on(
      t.professionalId,
      t.date,
      t.startTime
    ),
    index("appointments_customer_idx").on(t.customerId),
    index("appointments_date_idx").on(t.date),
  ]
);

export const businessHours = pgTable("business_hours", {
  id: text("id").primaryKey(),
  weekday: weekdayEnum("weekday").notNull().unique(),
  isOpen: boolean("is_open").notNull().default(true),
  startTime: varchar("start_time", { length: 5 }).notNull().default("09:00"),
  endTime: varchar("end_time", { length: 5 }).notNull().default("19:00"),
  breakStart: varchar("break_start", { length: 5 }),
  breakEnd: varchar("break_end", { length: 5 }),
});

export const holidays = pgTable("holidays", {
  id: text("id").primaryKey(),
  date: date("date").notNull().unique(),
  name: text("name").notNull(),
});

// ---- Relations (for query API ergonomics) ----

export const categoriesRelations = relations(categories, ({ many }) => ({
  services: many(services),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(categories, {
    fields: [services.categoryId],
    references: [categories.id],
  }),
  professionalLinks: many(professionalServices),
  appointments: many(appointments),
}));

export const professionalsRelations = relations(professionals, ({ many }) => ({
  serviceLinks: many(professionalServices),
  workingHours: many(workingHours),
  blockedDates: many(blockedDates),
  appointments: many(appointments),
}));

export const professionalServicesRelations = relations(professionalServices, ({ one }) => ({
  professional: one(professionals, {
    fields: [professionalServices.professionalId],
    references: [professionals.id],
  }),
  service: one(services, {
    fields: [professionalServices.serviceId],
    references: [services.id],
  }),
}));

export const workingHoursRelations = relations(workingHours, ({ one }) => ({
  professional: one(professionals, {
    fields: [workingHours.professionalId],
    references: [professionals.id],
  }),
}));

export const blockedDatesRelations = relations(blockedDates, ({ one }) => ({
  professional: one(professionals, {
    fields: [blockedDates.professionalId],
    references: [professionals.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  customer: one(customers, {
    fields: [appointments.customerId],
    references: [customers.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  professional: one(professionals, {
    fields: [appointments.professionalId],
    references: [professionals.id],
  }),
}));

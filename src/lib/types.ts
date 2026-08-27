import type { Weekday } from "@/data/seed-data";

export type { Weekday };

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  order: number;
}

export interface CatalogService {
  id: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  name: string;
  slug: string;
  description: string;
  benefits: string | null;
  importantInfo: string | null;
  duration: number;
  price: number;
  image: string | null;
  images: string[];
  active: boolean;
  professionalIds: string[];
}

export interface WorkingHourEntry {
  weekday: Weekday;
  startTime: string;
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
}

export interface CatalogProfessional {
  id: string;
  name: string;
  description: string | null;
  photo: string | null;
  active: boolean;
  serviceIds: string[];
  workingHours: WorkingHourEntry[];
  blockedDates: { date: string; reason?: string | null }[];
}

export interface BusinessHourEntry {
  weekday: Weekday;
  isOpen: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
}

export interface HolidayEntry {
  date: string;
  name: string;
}

export interface Catalog {
  categories: CatalogCategory[];
  services: CatalogService[];
  professionals: CatalogProfessional[];
  businessHours: BusinessHourEntry[];
  holidays: HolidayEntry[];
}

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface AppointmentRecord {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  customerWhatsapp: string;
  customerEmail?: string | null;
  notes?: string | null;
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professionalName: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  priceAtBooking: number;
  createdAt: string;
}

export interface CreateAppointmentInput {
  serviceId: string;
  professionalId: string; // may be a real id, or "any" meaning "qualquer profissional disponível"
  date: string;
  startTime: string;
  customerName: string;
  customerWhatsapp: string;
  customerEmail?: string;
  notes?: string;
}

export interface DashboardStats {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  monthRevenue: number;
  topServices: { name: string; count: number }[];
  topProfessionals: { name: string; count: number }[];
  recentCustomers: { id: string; name: string; whatsapp: string; createdAt: string | Date }[];
}

export interface AdminSession {
  name: string;
  email: string;
}

export interface BlockedDateRecord {
  id: string;
  professionalId: string | null;
  date: string;
  reason?: string | null;
}

export interface CustomerRecord {
  id: string;
  name: string;
  whatsapp: string;
  email?: string | null;
  notes?: string | null;
  createdAt: string;
  totalAppointments: number;
  lastAppointmentDate?: string | null;
}

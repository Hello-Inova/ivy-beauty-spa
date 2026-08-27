/**
 * Popula o banco de dados com os dados de demonstração (ver
 * src/data/seed-data.ts). Rode com: npm run db:seed
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./index";
import * as t from "./schema";
import {
  CATEGORIES,
  SERVICES,
  PROFESSIONALS,
  BUSINESS_HOURS,
  HOLIDAYS,
  DEMO_ADMIN,
} from "../data/seed-data";

function randomId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

async function main() {
  console.log("Seeding Ivy Beauty e Spa database...");

  // Wipe existing demo data (idempotent re-runs during development).
  await db.delete(t.appointments);
  await db.delete(t.professionalServices);
  await db.delete(t.workingHours);
  await db.delete(t.blockedDates);
  await db.delete(t.services);
  await db.delete(t.categories);
  await db.delete(t.professionals);
  await db.delete(t.customers);
  await db.delete(t.businessHours);
  await db.delete(t.holidays);
  await db.delete(t.users);

  await db.insert(t.categories).values(CATEGORIES);

  await db.insert(t.services).values(
    SERVICES.map((s) => ({
      id: s.id,
      categoryId: s.categoryId,
      name: s.name,
      slug: s.slug,
      description: s.description,
      benefits: s.benefits,
      importantInfo: s.importantInfo,
      duration: s.duration,
      price: s.price.toFixed(2),
      image: s.image,
      images: s.images,
      active: s.active,
    }))
  );

  await db.insert(t.professionals).values(
    PROFESSIONALS.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      photo: p.photo,
      active: p.active,
    }))
  );

  const profServiceRows = SERVICES.flatMap((s) =>
    s.professionalIds.map((pid) => ({ professionalId: pid, serviceId: s.id }))
  );
  if (profServiceRows.length) {
    await db.insert(t.professionalServices).values(profServiceRows);
  }

  const workingHourRows = PROFESSIONALS.flatMap((p) =>
    p.workingHours.map((w) => ({
      id: randomId("wh"),
      professionalId: p.id,
      weekday: w.weekday,
      startTime: w.startTime,
      endTime: w.endTime,
      breakStart: w.breakStart,
      breakEnd: w.breakEnd,
    }))
  );
  if (workingHourRows.length) {
    await db.insert(t.workingHours).values(workingHourRows);
  }

  await db.insert(t.businessHours).values(
    BUSINESS_HOURS.map((b) => ({
      id: randomId("bh"),
      weekday: b.weekday,
      isOpen: b.isOpen,
      startTime: b.startTime,
      endTime: b.endTime,
      breakStart: b.breakStart,
      breakEnd: b.breakEnd,
    }))
  );

  await db.insert(t.holidays).values(
    HOLIDAYS.map((h) => ({ id: randomId("hol"), date: h.date, name: h.name }))
  );

  const passwordHash = await bcrypt.hash(DEMO_ADMIN.password, 10);
  await db.insert(t.users).values({
    id: randomId("usr"),
    name: DEMO_ADMIN.name,
    email: DEMO_ADMIN.email,
    passwordHash,
    role: "ADMIN",
  });

  console.log("Seed completo!");
  console.log(`Categorias: ${CATEGORIES.length}`);
  console.log(`Serviços: ${SERVICES.length}`);
  console.log(`Profissionais: ${PROFESSIONALS.length}`);
  console.log(`Login admin: ${DEMO_ADMIN.email} / ${DEMO_ADMIN.password}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

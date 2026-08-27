import { BUSINESS_INFO } from "@/data/seed-data";
import { formatBRL } from "./format";
import { formatDateLong } from "./format";

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || BUSINESS_INFO.whatsappNumber;

export function whatsappLink(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

export function generalInquiryMessage(): string {
  return `Olá, Ivy Beauty e Spa! Gostaria de saber mais informações sobre os serviços.`;
}

export function serviceInquiryMessage(serviceName: string): string {
  return `Olá, Ivy Beauty e Spa! Gostaria de informações sobre o serviço ${serviceName}.`;
}

export function bookingConfirmationMessage(params: {
  serviceName: string;
  date: string;
  startTime: string;
  customerName: string;
  professionalName?: string;
}): string {
  const { serviceName, date, startTime, customerName, professionalName } = params;
  const lines = [
    "Olá, Ivy Beauty e Spa! Acabei de realizar um agendamento pelo site.",
    `Serviço: ${serviceName}`,
    professionalName ? `Profissional: ${professionalName}` : null,
    `Data: ${formatDateLong(date)}`,
    `Horário: ${startTime}`,
    `Nome: ${customerName}`,
    "Gostaria de confirmar meu atendimento.",
  ].filter(Boolean);
  return lines.join("\n");
}

export function appointmentSummaryMessage(params: {
  code: string;
  serviceName: string;
  professionalName: string;
  date: string;
  startTime: string;
  price: number;
}): string {
  const { code, serviceName, professionalName, date, startTime, price } = params;
  return [
    `Agendamento ${code} — Ivy Beauty e Spa`,
    `Serviço: ${serviceName}`,
    `Profissional: ${professionalName}`,
    `Data: ${formatDateLong(date)}`,
    `Horário: ${startTime}`,
    `Valor: ${formatBRL(price)}`,
  ].join("\n");
}

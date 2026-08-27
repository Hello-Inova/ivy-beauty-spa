"use client";

import { MessageCircle } from "lucide-react";
import { whatsappLink, generalInquiryMessage } from "@/lib/whatsapp";

export default function WhatsAppFloatButton() {
  return (
    <a
      href={whatsappLink(generalInquiryMessage())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95 sm:bottom-7 sm:right-7"
    >
      <MessageCircle size={28} strokeWidth={2} />
      <span className="sr-only">Falar no WhatsApp</span>
    </a>
  );
}

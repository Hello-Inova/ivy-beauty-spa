"use client";

import { whatsappLink, generalInquiryMessage } from "@/lib/whatsapp";

// Real WhatsApp glyph (phone handset inside a chat bubble) instead of a
// generic lucide message icon — matches the brand mark people recognize.
function WhatsAppIcon({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M16.02 3C9.4 3 4.02 8.36 4.02 15c0 2.44.72 4.71 1.96 6.62L4 29l7.56-1.94A11.94 11.94 0 0 0 16.02 27C22.64 27 28 21.64 28 15S22.64 3 16.02 3Zm0 21.9c-2.02 0-3.9-.58-5.5-1.58l-.4-.24-4.48 1.15 1.2-4.36-.26-.45A9.86 9.86 0 0 1 5.12 15c0-5.46 4.44-9.9 9.9-9.9 5.46 0 9.9 4.44 9.9 9.9 0 5.46-4.44 9.9-9.9 9.9Z" />
      <path d="M21.44 17.6c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.48-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.91-2.2-.24-.57-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.47 0 1.46 1.07 2.87 1.22 3.06.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

export default function WhatsAppFloatButton() {
  return (
    <a
      href={whatsappLink(generalInquiryMessage())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95 sm:bottom-7 sm:right-7"
    >
      <WhatsAppIcon size={30} />
      <span className="sr-only">Falar no WhatsApp</span>
    </a>
  );
}

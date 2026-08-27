import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Painel administrativo | Ivy Beauty e Spa",
    template: "%s | Painel Ivy Beauty e Spa",
  },
  robots: { index: false, follow: false },
};

// The admin section is a separate Next.js "root layout" (its own <html>/
// <body>) so it never renders the public site's Header/Footer/WhatsApp
// button. Auth is enforced one level down, in admin/(protected)/layout.tsx —
// this file also covers /admin/login, which must NOT be auth-gated.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full bg-cream-deep text-charcoal">{children}</body>
    </html>
  );
}

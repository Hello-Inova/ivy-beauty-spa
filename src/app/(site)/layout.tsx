import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import WhatsAppFloatButton from "@/components/site/WhatsAppFloatButton";
import { BUSINESS_INFO } from "@/data/seed-data";
import { IS_DEMO_MODE, withBasePath } from "@/lib/demo-mode";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ivybelezaespa.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BUSINESS_INFO.name} — Salão de Beleza e Spa | Agendamento Online`,
    template: `%s | ${BUSINESS_INFO.name}`,
  },
  description:
    "Ivy Beauty e Spa: salão de beleza e spa premium. Cabelo, unhas, sobrancelhas, cílios, estética facial, depilação e spa. Agende seu horário online em poucos passos.",
  keywords: [
    "Ivy Beauty e Spa",
    "salão de beleza",
    "spa",
    "beleza",
    "estética",
    "agendamento de salão",
    "agendamento online",
    "serviços de beleza",
  ],
  icons: {
    icon: [
      { url: withBasePath("/favicon.ico") },
      { url: withBasePath("/images/favicon-32.png"), sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: withBasePath("/images/apple-touch-icon.png") }],
  },
  openGraph: {
    title: `${BUSINESS_INFO.name} — Beleza, autocuidado e bem-estar`,
    description: BUSINESS_INFO.aboutShort,
    url: SITE_URL,
    siteName: BUSINESS_INFO.name,
    locale: "pt_BR",
    type: "website",
    images: [{ url: withBasePath("/images/og-image.png"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS_INFO.name} — Beleza, autocuidado e bem-estar`,
    description: BUSINESS_INFO.aboutShort,
    images: [withBasePath("/images/og-image.png")],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  name: BUSINESS_INFO.name,
  url: SITE_URL,
  telephone: `+${BUSINESS_INFO.whatsappNumber}`,
  sameAs: [BUSINESS_INFO.instagramUrl],
  // Endereço, geolocalização e horário estruturado (openingHoursSpecification)
  // ficam provisoriamente de fora até a confirmação dos dados oficiais —
  // preencha em src/data/seed-data.ts (BUSINESS_INFO) e aqui quando disponíveis.
  priceRange: "$$",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        {IS_DEMO_MODE && (
          <meta name="robots" content="noindex, nofollow" />
        )}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-charcoal">
        {IS_DEMO_MODE && (
          <div className="bg-charcoal py-2 text-center text-xs text-cream/80">
            Modo demonstração — dados fictícios salvos apenas no seu navegador. Nenhuma informação real da Ivy Beauty e Spa é usada aqui.
          </div>
        )}
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloatButton />
      </body>
    </html>
  );
}

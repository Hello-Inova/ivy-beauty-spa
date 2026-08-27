import Hero from "@/components/site/Hero";
import ServicesPreview from "@/components/site/ServicesPreview";
import AboutSection from "@/components/site/AboutSection";
import GallerySection from "@/components/site/GallerySection";
import TestimonialsSection from "@/components/site/TestimonialsSection";
import InstagramSection from "@/components/site/InstagramSection";
import { getCatalog } from "@/lib/catalog.server";
import { ensureDynamic } from "@/lib/force-dynamic.server";

export default async function HomePage() {
  // Real mode: re-read the catalog from Postgres on every request so admin
  // edits show up immediately. Demo mode: prerendered once at build time.
  await ensureDynamic();
  const catalog = await getCatalog();

  return (
    <>
      <Hero />
      <ServicesPreview services={catalog.services} />
      <AboutSection />
      <GallerySection />
      <TestimonialsSection />
      <InstagramSection />
    </>
  );
}

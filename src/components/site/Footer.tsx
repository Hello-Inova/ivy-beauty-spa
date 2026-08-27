import Link from "next/link";
import { Camera, MessageCircle, MapPin } from "lucide-react";
import { BUSINESS_INFO } from "@/data/seed-data";
import { whatsappLink, generalInquiryMessage } from "@/lib/whatsapp";
import { withBasePath } from "@/lib/demo-mode";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-charcoal/10 bg-charcoal text-cream">
      <div className="container-ivy grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBasePath("/images/logo.png")} alt="Ivy Beauty e Spa" className="h-10 w-auto brightness-0 invert opacity-90" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">{BUSINESS_INFO.tagline}</p>
        </div>

        <div>
          <h3 className="font-display text-base text-cream">Navegação</h3>
          <ul className="mt-4 space-y-2 text-sm text-cream/70">
            <li><Link href="/servicos" className="hover:text-rose">Serviços</Link></li>
            <li><Link href="/sobre" className="hover:text-rose">Sobre nós</Link></li>
            <li><Link href="/galeria" className="hover:text-rose">Galeria</Link></li>
            <li><Link href="/agendamento" className="hover:text-rose">Agendamento</Link></li>
            <li><Link href="/admin" className="hover:text-rose">Área administrativa</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base text-cream">Contato</h3>
          <ul className="mt-4 space-y-3 text-sm text-cream/70">
            <li>
              <a
                href={whatsappLink(generalInquiryMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-rose"
              >
                <MessageCircle size={16} /> {BUSINESS_INFO.whatsappDisplay}
              </a>
            </li>
            <li>
              <a
                href={BUSINESS_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-rose"
              >
                <Camera size={16} /> {BUSINESS_INFO.instagramHandle}
              </a>
            </li>
            <li className="flex items-start gap-2 text-cream/50">
              <MapPin size={16} className="mt-0.5 shrink-0" /> {BUSINESS_INFO.addressLine}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base text-cream">Autocuidado começa aqui</h3>
          <p className="mt-4 text-sm text-cream/70">Agende em poucos passos e receba a confirmação na hora.</p>
          <Link href="/agendamento" className="btn-primary mt-4 inline-flex">
            Agendar agora
          </Link>
        </div>
      </div>

      <div className="border-t border-cream/10 py-6">
        <p className="container-ivy text-center text-xs text-cream/40">
          © {new Date().getFullYear()} {BUSINESS_INFO.name}. Todos os direitos reservados. Conteúdo de demonstração — ver{" "}
          <Link href="/admin" className="underline hover:text-rose">painel administrativo</Link> para edição.
        </p>
      </div>
    </footer>
  );
}

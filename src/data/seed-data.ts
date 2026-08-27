/**
 * Dados de demonstração — Ivy Beauty e Spa
 * ------------------------------------------------------------------
 * TUDO neste arquivo é conteúdo FICTÍCIO/PROVISÓRIO criado apenas para
 * que o sistema possa ser visualizado funcionando (categorias, serviços,
 * profissionais, preços, durações e horários). Nada aqui foi extraído do
 * Instagram oficial (@ivybelezaespa) — o perfil não pôde ser acessado
 * programaticamente (Instagram bloqueia leitura automatizada via
 * robots.txt). Substitua tudo pelos dados reais no painel /admin.
 *
 * Este mesmo arquivo alimenta:
 *  - o script de seed do banco de dados (modo completo, com Postgres)
 *  - o cliente local do "modo demonstração" (build estático p/ GitHub Pages)
 * — garantindo que os dois modos mostrem exatamente o mesmo catálogo.
 */

export type Weekday =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  SUNDAY: "Domingo",
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
};

export const WEEKDAY_ORDER: Weekday[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export interface SeedCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  order: number;
}

export interface SeedService {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  benefits: string;
  importantInfo: string;
  duration: number; // minutes
  price: number; // BRL
  image: string;
  active: boolean;
  professionalIds: string[];
}

export interface SeedProfessional {
  id: string;
  name: string;
  description: string;
  photo: string;
  active: boolean;
  workingHours: { weekday: Weekday; startTime: string; endTime: string; breakStart?: string; breakEnd?: string }[];
  blockedDates: { date: string; reason: string }[];
}

export const CATEGORIES: SeedCategory[] = [
  { id: "cat-cabelo", name: "Cabelo", slug: "cabelo", description: "Cortes, coloração, tratamentos e finalização.", active: true, order: 1 },
  { id: "cat-unhas", name: "Unhas", slug: "unhas", description: "Manicure, pedicure e nail design.", active: true, order: 2 },
  { id: "cat-sobrancelhas", name: "Sobrancelhas", slug: "sobrancelhas", description: "Design, henna e micropigmentação.", active: true, order: 3 },
  { id: "cat-cilios", name: "Cílios", slug: "cilios", description: "Extensão e lifting de cílios.", active: true, order: 4 },
  { id: "cat-estetica", name: "Estética Facial", slug: "estetica-facial", description: "Limpeza de pele e tratamentos faciais.", active: true, order: 5 },
  { id: "cat-depilacao", name: "Depilação", slug: "depilacao", description: "Depilação com cera e linha.", active: true, order: 6 },
  { id: "cat-spa", name: "Spa", slug: "spa", description: "Massagens e experiências de relaxamento.", active: true, order: 7 },
];

export const PROFESSIONALS: SeedProfessional[] = [
  {
    id: "pro-camila",
    name: "Camila Rocha",
    description: "Cabeleireira especialista em coloração e cortes femininos. (Profissional demonstrativa — substitua pelos dados reais da equipe.)",
    photo: "/images/placeholders/pro-1.png",
    active: true,
    workingHours: [
      { weekday: "TUESDAY", startTime: "09:00", endTime: "19:00", breakStart: "12:30", breakEnd: "13:30" },
      { weekday: "WEDNESDAY", startTime: "09:00", endTime: "19:00", breakStart: "12:30", breakEnd: "13:30" },
      { weekday: "THURSDAY", startTime: "09:00", endTime: "19:00", breakStart: "12:30", breakEnd: "13:30" },
      { weekday: "FRIDAY", startTime: "09:00", endTime: "19:00", breakStart: "12:30", breakEnd: "13:30" },
      { weekday: "SATURDAY", startTime: "09:00", endTime: "16:00" },
    ],
    blockedDates: [],
  },
  {
    id: "pro-fernanda",
    name: "Fernanda Lima",
    description: "Nail designer e especialista em sobrancelhas. (Profissional demonstrativa — substitua pelos dados reais da equipe.)",
    photo: "/images/placeholders/pro-2.png",
    active: true,
    workingHours: [
      { weekday: "TUESDAY", startTime: "09:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
      { weekday: "WEDNESDAY", startTime: "09:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
      { weekday: "THURSDAY", startTime: "09:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
      { weekday: "FRIDAY", startTime: "09:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
      { weekday: "SATURDAY", startTime: "09:00", endTime: "17:00" },
    ],
    blockedDates: [],
  },
  {
    id: "pro-juliana",
    name: "Juliana Alves",
    description: "Esteticista facial e corporal, especialista em spa e relaxamento. (Profissional demonstrativa — substitua pelos dados reais da equipe.)",
    photo: "/images/placeholders/pro-3.png",
    active: true,
    workingHours: [
      { weekday: "MONDAY", startTime: "10:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
      { weekday: "TUESDAY", startTime: "10:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
      { weekday: "WEDNESDAY", startTime: "10:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
      { weekday: "THURSDAY", startTime: "10:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
      { weekday: "FRIDAY", startTime: "10:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
    ],
    blockedDates: [],
  },
  {
    id: "pro-beatriz",
    name: "Beatriz Nunes",
    description: "Especialista em cílios, depilação e lash design. (Profissional demonstrativa — substitua pelos dados reais da equipe.)",
    photo: "/images/placeholders/pro-4.png",
    active: true,
    workingHours: [
      { weekday: "TUESDAY", startTime: "09:00", endTime: "18:00" },
      { weekday: "WEDNESDAY", startTime: "09:00", endTime: "18:00" },
      { weekday: "THURSDAY", startTime: "09:00", endTime: "18:00" },
      { weekday: "FRIDAY", startTime: "09:00", endTime: "18:00" },
      { weekday: "SATURDAY", startTime: "09:00", endTime: "15:00" },
    ],
    blockedDates: [],
  },
];

const IMPORTANT_INFO_DEFAULT =
  "Chegue com 10 minutos de antecedência. Em caso de imprevisto, remarque com pelo menos 4h de antecedência pelo WhatsApp.";

export const SERVICES: SeedService[] = [
  // Cabelo
  {
    id: "svc-corte-feminino",
    categoryId: "cat-cabelo",
    name: "Corte Feminino",
    slug: "corte-feminino",
    description: "Corte personalizado de acordo com o formato do rosto e o estilo de cada cliente, finalizado com escova modeladora.",
    benefits: "Valoriza o formato do rosto, renova o visual e facilita a manutenção do cabelo no dia a dia.",
    importantInfo: IMPORTANT_INFO_DEFAULT,
    duration: 60,
    price: 120,
    image: "/images/placeholders/svc-cabelo-1.png",
    active: true,
    professionalIds: ["pro-camila"],
  },
  {
    id: "svc-coloracao",
    categoryId: "cat-cabelo",
    name: "Coloração",
    slug: "coloracao",
    description: "Coloração completa com produtos profissionais, incluindo teste de mecha quando necessário.",
    benefits: "Cobertura uniforme dos fios, cor duradoura e brilho intenso.",
    importantInfo: "Recomendamos um teste de alergia 48h antes para novas clientes. " + IMPORTANT_INFO_DEFAULT,
    duration: 120,
    price: 220,
    image: "/images/placeholders/svc-cabelo-2.png",
    active: true,
    professionalIds: ["pro-camila"],
  },
  {
    id: "svc-hidratacao",
    categoryId: "cat-cabelo",
    name: "Hidratação Profunda",
    slug: "hidratacao-profunda",
    description: "Tratamento intensivo para repor a umidade e a maciez dos fios, com máscara de nutrição e finalização.",
    benefits: "Reduz o frizz, recupera o brilho e a elasticidade dos fios.",
    importantInfo: IMPORTANT_INFO_DEFAULT,
    duration: 50,
    price: 95,
    image: "/images/placeholders/svc-cabelo-3.png",
    active: true,
    professionalIds: ["pro-camila"],
  },
  // Unhas
  {
    id: "svc-manicure",
    categoryId: "cat-unhas",
    name: "Manicure Tradicional",
    slug: "manicure-tradicional",
    description: "Cutilagem, lixamento e esmaltação com acabamento impecável.",
    benefits: "Unhas cuidadas e esmaltação duradoura.",
    importantInfo: IMPORTANT_INFO_DEFAULT,
    duration: 40,
    price: 45,
    image: "/images/placeholders/svc-unhas-1.png",
    active: true,
    professionalIds: ["pro-fernanda"],
  },
  {
    id: "svc-pedicure",
    categoryId: "cat-unhas",
    name: "Pedicure Spa",
    slug: "pedicure-spa",
    description: "Ritual completo para os pés com esfoliação, hidratação e esmaltação.",
    benefits: "Relaxamento, pele macia e unhas impecáveis.",
    importantInfo: IMPORTANT_INFO_DEFAULT,
    duration: 50,
    price: 60,
    image: "/images/placeholders/svc-unhas-2.png",
    active: true,
    professionalIds: ["pro-fernanda"],
  },
  {
    id: "svc-alongamento",
    categoryId: "cat-unhas",
    name: "Alongamento em Gel",
    slug: "alongamento-em-gel",
    description: "Alongamento de unhas em gel com modelagem personalizada e nail art opcional.",
    benefits: "Unhas alongadas, resistentes e com acabamento profissional.",
    importantInfo: IMPORTANT_INFO_DEFAULT,
    duration: 90,
    price: 150,
    image: "/images/placeholders/svc-unhas-3.png",
    active: true,
    professionalIds: ["pro-fernanda"],
  },
  // Sobrancelhas
  {
    id: "svc-design-sobrancelha",
    categoryId: "cat-sobrancelhas",
    name: "Design de Sobrancelhas",
    slug: "design-de-sobrancelhas",
    description: "Design personalizado com pinça e/ou linha, respeitando o formato natural do rosto.",
    benefits: "Olhar mais expressivo e sobrancelhas alinhadas.",
    importantInfo: IMPORTANT_INFO_DEFAULT,
    duration: 30,
    price: 45,
    image: "/images/placeholders/svc-sobrancelha-1.png",
    active: true,
    professionalIds: ["pro-fernanda"],
  },
  {
    id: "svc-henna",
    categoryId: "cat-sobrancelhas",
    name: "Design com Henna",
    slug: "design-com-henna",
    description: "Design de sobrancelhas com aplicação de henna para preenchimento e definição.",
    benefits: "Sobrancelhas preenchidas com efeito natural por até 2 semanas.",
    importantInfo: IMPORTANT_INFO_DEFAULT,
    duration: 40,
    price: 65,
    image: "/images/placeholders/svc-sobrancelha-2.png",
    active: true,
    professionalIds: ["pro-fernanda"],
  },
  // Cílios
  {
    id: "svc-extensao-cilios",
    categoryId: "cat-cilios",
    name: "Extensão de Cílios (Volume Russo)",
    slug: "extensao-de-cilios-volume-russo",
    description: "Aplicação fio a fio de extensões para um olhar marcante e volumoso.",
    benefits: "Olhar mais intenso sem necessidade de máscara de cílios diária.",
    importantInfo: "Evite molhar os cílios nas primeiras 24h. " + IMPORTANT_INFO_DEFAULT,
    duration: 120,
    price: 180,
    image: "/images/placeholders/svc-cilios-1.png",
    active: true,
    professionalIds: ["pro-beatriz"],
  },
  {
    id: "svc-lifting-cilios",
    categoryId: "cat-cilios",
    name: "Lifting de Cílios",
    slug: "lifting-de-cilios",
    description: "Curvatura e tonalização dos cílios naturais para um efeito de máscara permanente.",
    benefits: "Cílios curvados e realçados por até 6 semanas.",
    importantInfo: IMPORTANT_INFO_DEFAULT,
    duration: 60,
    price: 110,
    image: "/images/placeholders/svc-cilios-2.png",
    active: true,
    professionalIds: ["pro-beatriz"],
  },
  // Estética Facial
  {
    id: "svc-limpeza-pele",
    categoryId: "cat-estetica",
    name: "Limpeza de Pele Profunda",
    slug: "limpeza-de-pele-profunda",
    description: "Higienização, esfoliação, extração e máscara calmante para uma pele renovada.",
    benefits: "Pele mais limpa, uniforme e com poros desobstruídos.",
    importantInfo: IMPORTANT_INFO_DEFAULT,
    duration: 70,
    price: 140,
    image: "/images/placeholders/svc-estetica-1.png",
    active: true,
    professionalIds: ["pro-juliana"],
  },
  {
    id: "svc-peeling",
    categoryId: "cat-estetica",
    name: "Peeling de Diamante",
    slug: "peeling-de-diamante",
    description: "Esfoliação mecânica que remove células mortas e estimula a renovação celular.",
    benefits: "Textura da pele mais uniforme e luminosa.",
    importantInfo: IMPORTANT_INFO_DEFAULT,
    duration: 45,
    price: 130,
    image: "/images/placeholders/svc-estetica-2.png",
    active: true,
    professionalIds: ["pro-juliana"],
  },
  // Depilação
  {
    id: "svc-depilacao-pernas",
    categoryId: "cat-depilacao",
    name: "Depilação de Pernas Completas",
    slug: "depilacao-pernas-completas",
    description: "Depilação com cera quente, adequada para todos os tipos de pele.",
    benefits: "Pele lisa e macia por semanas.",
    importantInfo: IMPORTANT_INFO_DEFAULT,
    duration: 45,
    price: 80,
    image: "/images/placeholders/svc-depilacao-1.png",
    active: true,
    professionalIds: ["pro-beatriz"],
  },
  {
    id: "svc-depilacao-buco",
    categoryId: "cat-depilacao",
    name: "Depilação de Buço (Linha)",
    slug: "depilacao-de-buco-linha",
    description: "Depilação precisa com técnica de linha, ideal para peles sensíveis.",
    benefits: "Resultado preciso e duradouro.",
    importantInfo: IMPORTANT_INFO_DEFAULT,
    duration: 15,
    price: 25,
    image: "/images/placeholders/svc-depilacao-2.png",
    active: true,
    professionalIds: ["pro-beatriz"],
  },
  // Spa
  {
    id: "svc-massagem-relaxante",
    categoryId: "cat-spa",
    name: "Massagem Relaxante",
    slug: "massagem-relaxante",
    description: "Massagem corporal com óleos essenciais para aliviar tensões e proporcionar relaxamento profundo.",
    benefits: "Alívio do estresse, relaxamento muscular e bem-estar geral.",
    importantInfo: IMPORTANT_INFO_DEFAULT,
    duration: 60,
    price: 160,
    image: "/images/placeholders/svc-spa-1.png",
    active: true,
    professionalIds: ["pro-juliana"],
  },
  {
    id: "svc-day-spa",
    categoryId: "cat-spa",
    name: "Day Spa Ivy",
    slug: "day-spa-ivy",
    description: "Experiência completa com massagem, esfoliação corporal e ritual facial em ambiente exclusivo.",
    benefits: "Relaxamento completo em uma experiência premium de autocuidado.",
    importantInfo: IMPORTANT_INFO_DEFAULT,
    duration: 150,
    price: 380,
    image: "/images/placeholders/svc-spa-2.png",
    active: true,
    professionalIds: ["pro-juliana"],
  },
];

// Horário de funcionamento geral do espaço (provisório — configurável em /admin)
export const BUSINESS_HOURS: {
  weekday: Weekday;
  isOpen: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}[] = [
  { weekday: "SUNDAY", isOpen: false, startTime: "09:00", endTime: "18:00" },
  { weekday: "MONDAY", isOpen: true, startTime: "10:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
  { weekday: "TUESDAY", isOpen: true, startTime: "09:00", endTime: "19:00", breakStart: "12:30", breakEnd: "13:30" },
  { weekday: "WEDNESDAY", isOpen: true, startTime: "09:00", endTime: "19:00", breakStart: "12:30", breakEnd: "13:30" },
  { weekday: "THURSDAY", isOpen: true, startTime: "09:00", endTime: "19:00", breakStart: "12:30", breakEnd: "13:30" },
  { weekday: "FRIDAY", isOpen: true, startTime: "09:00", endTime: "19:00", breakStart: "12:30", breakEnd: "13:30" },
  { weekday: "SATURDAY", isOpen: true, startTime: "09:00", endTime: "17:00" },
];

export const HOLIDAYS: { date: string; name: string }[] = [
  { date: "2026-12-25", name: "Natal" },
  { date: "2027-01-01", name: "Ano Novo" },
];

export const DEMO_ADMIN = {
  name: "Administradora Ivy",
  email: "admin@ivybelezaespa.com.br",
  password: "IvySpa@2026", // demo/dev only — trocar em produção
};

export const BUSINESS_INFO = {
  name: "Ivy Beauty e Spa",
  tagline: "Beleza, autocuidado e bem-estar em cada detalhe.",
  instagramUrl: "https://www.instagram.com/ivybelezaespa",
  instagramHandle: "@ivybelezaespa",
  whatsappNumber: "5511995928802",
  whatsappDisplay: "+55 11 99592-8802",
  // Textos provisórios — substitua pelo conteúdo oficial da Ivy Beauty e Spa.
  aboutShort:
    "[TEXTO PROVISÓRIO] A Ivy Beauty e Spa é um espaço dedicado à beleza, ao autocuidado e ao bem-estar, oferecendo uma experiência sofisticada e personalizada para cada cliente.",
  aboutLong:
    "[TEXTO PROVISÓRIO — editar com o conteúdo oficial do Instagram/empresa] Na Ivy Beauty e Spa, acreditamos que cuidar de si é um ato de amor-próprio. Nosso espaço foi pensado para oferecer momentos de relaxamento e transformação, unindo técnica, sofisticação e um atendimento verdadeiramente personalizado. Da hora marcada ao último detalhe do atendimento, cada etapa é pensada para que você se sinta acolhida, valorizada e renovada.",
  addressLine: "[ENDEREÇO PROVISÓRIO — a confirmar]",
};

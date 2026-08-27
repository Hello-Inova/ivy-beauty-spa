# Ivy Beauty e Spa — Sistema Web

Sistema completo para um salão de beleza / spa: site institucional, catálogo
de serviços, agendamento online e painel administrativo. Construído com
Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, com persistência em
PostgreSQL via Drizzle ORM.

> **Conteúdo provisório:** nome, WhatsApp e Instagram (`@ivybelezaespa`) são
> reais, conforme fornecido. Todo o restante — endereço, história, equipe,
> paleta de cores, fotos, textos "sobre" — é **placeholder fictício**,
> claramente identificado no código e na interface (`[TEXTO PROVISÓRIO]`),
> pois não foi possível confirmar essas informações (Instagram bloqueado
> para leitura automática). Edite tudo isso pelo painel administrativo ou em
> `src/data/seed-data.ts` antes de publicar em produção.

## Dois modos de execução

Este projeto roda de **duas formas independentes**, a partir do mesmo
código-fonte:

### 1. Modo completo (servidor + banco de dados)

O modo "de verdade": Postgres real, API routes, autenticação por sessão,
dados persistentes entre dispositivos. É o que você usaria em produção.

```bash
npm install
cp .env.example .env        # ajuste DATABASE_URL e JWT_SECRET
npm run db:setup            # roda as migrations e popula o banco de demonstração
npm run dev                 # http://localhost:3000
```

Login do painel administrativo (dados de demonstração):
`admin@ivybelezaespa.com.br` / `IvySpa@2026`

Para produção: `npm run build && npm run start`, hospedado em qualquer
provedor Node.js (Vercel, Render, Railway, VPS) com um Postgres acessível.

### 2. Modo demonstração (estático, para GitHub Pages)

Uma versão 100% client-side, sem servidor nem banco de dados: os mesmos
dados de demonstração ficam no `localStorage` do navegador. Serve para
publicar uma prévia navegável do sistema em `https://<usuario>.github.io/<repositorio>/`
sem precisar hospedar nada.

```bash
npm run build:demo          # gera a pasta ./out
npx serve out                # pré-visualizar localmente
```

O workflow `.github/workflows/deploy-demo.yml` já publica automaticamente
esse build no GitHub Pages a cada push na branch `main` (ative o Pages nas
configurações do repositório, em Settings → Pages → Source → "GitHub
Actions").

**Limitações do modo demonstração** (inerentes a um site 100% estático):
- Os dados ficam salvos só naquele navegador — não há um banco compartilhado
  entre visitantes, e limpar os dados do site apaga os agendamentos feitos.
- Um serviço criado pelo painel administrativo *depois* do build não recebe
  uma página de detalhe própria (`/servicos/[slug]`), pois páginas estáticas
  só existem para os slugs conhecidos no momento do build.
- Não há login real: as "credenciais" de admin ficam guardadas no
  `localStorage`, apenas para simular o fluxo — não use isso com dados
  reais.
- Existe um botão "Restaurar dados de demonstração" no painel para limpar o
  `localStorage` e voltar ao catálogo original.

Toda a lógica de prevenção de conflito de horário (double-booking) e de
bloqueio de horários passados é a **mesma** em ambos os modos — vem de um
único módulo compartilhado (`src/lib/availability.ts`), então o
comportamento testado num modo é válido no outro.

## Stack técnica

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4** (tema definido em `src/app/globals.css`, paleta
  "spa" provisória)
- **PostgreSQL** + **Drizzle ORM** (modo completo) — schema em
  `src/db/schema.ts`
- **JWT** (`jsonwebtoken` + `bcryptjs`) para sessão de administrador
- **Zod** para validação de entrada nas rotas de API
- Imagens de demonstração geradas localmente (`scripts/gen_placeholders.py`,
  requer Python + Pillow) — não usa fotos de terceiros

## Estrutura principal

```
src/
  app/(site)/       páginas públicas (home, serviços, agendamento, sobre...)
  app/admin/        painel administrativo (protegido)
  app/api/          rotas de API (somente modo completo)
  components/       componentes React (site, booking, admin)
  data/seed-data.ts fonte única dos dados de demonstração (serviços,
                     profissionais, horários, textos provisórios)
  db/               schema Drizzle, queries, script de seed (modo completo)
  lib/               lógica compartilhada: disponibilidade, formatação,
                     WhatsApp, autenticação, e o "BookingClient" (abstração
                     que alterna entre API real e localStorage)
scripts/
  build-demo.sh      gera o build estático (modo demonstração)
  gen_placeholders.py gera as imagens placeholder
```

## Funcionalidades

- **Site público:** home com hero e chamadas para ação, catálogo de
  serviços por categoria, página de detalhe por serviço, sobre, galeria,
  contato com horário de funcionamento.
- **Agendamento online:** serviço → profissional (ou "qualquer profissional
  disponível") → data (calendário bloqueia dias fechados/indisponíveis) →
  horário (somente horários realmente livres) → dados do cliente →
  confirmação → tela de sucesso com código do agendamento e link direto
  para o WhatsApp com mensagem pré-preenchida.
- **Botão flutuante do WhatsApp** em todo o site, com mensagens
  contextuais.
- **Painel administrativo** (`/admin`): dashboard com KPIs, CRUD de
  categorias/serviços/profissionais, agenda com confirmação/cancelamento/
  reagendamento/conclusão, configuração de horários de funcionamento,
  intervalos, folgas e bloqueios específicos, gestão de clientes.
- **Prevenção de conflito de horário:** verificação de disponibilidade
  antes de mostrar o horário e revalidação no momento da confirmação
  (com índice único no banco como última camada de proteção, no modo
  completo).
- **SEO:** metadados, Open Graph, `sitemap.xml`, `robots.txt`, dados
  estruturados Schema.org (`BeautySalon`).

## Próximos passos sugeridos

- Substituir as imagens e cores placeholder pelas reais da marca.
- Preencher endereço, história e demais textos marcados como provisórios.
- Trocar o `JWT_SECRET` de exemplo por um valor aleatório forte em produção.
- Avaliar um provedor de Postgres gerenciado (Neon, Supabase, RDS etc.)
  para o modo completo em produção.

# AccCourse — Plataforma de Criação de Cursos E-Learning

> Crie cursos interativos e-learning com exportação SCORM 1.2 — sem código, totalmente visual.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![SCORM 1.2](https://img.shields.io/badge/SCORM-1.2-green)](https://scorm.com)

---

## 🎯 Proposta de Valor

O **AccCourse** é uma plataforma SaaS de autoria de cursos e-learning inspirada no **isEazy Author**, focada em oferecer uma experiência de criação **WYSIWYG (What You See Is What You Get)** totalmente visual e sem necessidade de código.

### Diferenciais:
- **Editor Drag-and-Drop** com posicionamento livre em canvas 16:9
- **4 tipos de blocos interativos**: Texto, Imagem, Flashcard (3D flip), Quiz
- **Exportação SCORM 1.2 100% client-side** — nenhum servidor é necessário para gerar o pacote
- **Undo/Redo** com histórico completo via Zustand
- **Segurança**: sanitização HTML com DOMPurify contra XSS
- **LGPD/GDPR Compliance**: consent banner e opção de exclusão de dados

---

## 🏗️ Arquitetura

### Stack
| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5 |
| UI | Tailwind CSS + shadcn/ui (Violet theme) |
| Drag-and-Drop | @dnd-kit/core + @dnd-kit/sortable |
| State | Zustand (persist + undo/redo) |
| Sanitização | isomorphic-dompurify |
| Exportação | JSZip + FileSaver |
| Notificações | Sonner (via shadcn/ui) |

### Geração SCORM (Client-Side)

```
┌─────────────────────────────────────────────────────────┐
│  Browser (Next.js App)                                  │
│                                                         │
│  Zustand Store ──> SCORM Engine ──> JSZip ──> Download  │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ manifest.ts │  │ htmlGen.ts  │  │ scormApi.ts │     │
│  │ (XML)       │  │ (HTML+JS)   │  │ (LMS shim)  │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          ▼                              │
│                    packager.ts                          │
│                    (JSZip → .zip)                       │
└─────────────────────────────────────────────────────────┘
```

O pacote SCORM é gerado **inteiramente no navegador**:
1. `manifest.ts` — Gera o `imsmanifest.xml` com schemas SCORM 1.2
2. `htmlGenerator.ts` — Converte slides/blocos em HTML com navegação, flashcard flip, quiz interativo e keyboard navigation
3. `scormApi.ts` — SCORM API shim que faz `findAPI()` para comunicação com o LMS (bookmark, score, lesson_status)
4. `styles.ts` — CSS premium com animations, responsive design e gradient background
5. `packager.ts` — Empacota tudo com JSZip (DEFLATE) e inicia download via FileSaver

---

## 🚀 Setup & Deploy

### Pré-requisitos
- Node.js >= 18
- npm >= 9

### Desenvolvimento
```bash
# Clonar o repositório
git clone <repo-url>
cd AccCourse

# Instalar dependências
npm install

# Iniciar dev server
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000)

### Build de Produção
```bash
npm run build
npm start
```

### Deploy (Vercel)
```bash
# Via CLI
npx vercel --prod

# Ou conecte o repositório no dashboard.vercel.com
```

> **Nota**: Não há backend/banco de dados. Todos os dados são persistidos no `localStorage` do navegador via Zustand persist. Para produção, considere adicionar persistência em nuvem.

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx              # Layout raiz (HydrationGuard + Toaster)
│   ├── page.tsx                # Dashboard
│   └── editor/[id]/page.tsx    # Editor WYSIWYG
├── components/
│   ├── dashboard/              # ProjectCard, CreateProjectDialog
│   ├── editor/                 # TopToolbar, SlideNavigator, Canvas,
│   │                           # DraggableBlock, PropertiesPanel
│   ├── HydrationGuard.tsx      # Previne hydration mismatch (SSR + localStorage)
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── sanitize.ts             # DOMPurify wrapper (anti-XSS)
│   ├── utils.ts                # cn() helper
│   └── scorm/
│       ├── packager.ts         # JSZip + FileSaver (main entry)
│       ├── manifest.ts         # imsmanifest.xml generator
│       ├── htmlGenerator.ts    # Course HTML with interactions
│       ├── styles.ts           # Premium CSS generator
│       └── scormApi.ts         # SCORM 1.2 API shim
└── store/
    └── useEditorStore.ts       # Zustand (persist + undo/redo)
```

---

## 🔐 Segurança

- **XSS Prevention**: Todo conteúdo de texto é sanitizado com `DOMPurify.sanitize()` antes de salvar no store e antes da exportação SCORM
- **LGPD/GDPR**: Cookie consent banner com opção de aceitar/rejeitar, botão "Excluir Meus Dados"
- **Hydration Safety**: `HydrationGuard` previne hydration mismatch entre SSR e localStorage

---

## 📄 Licença

Projeto proprietário — todos os direitos reservados.

---
name: acccourse-platform-dev
description: "Skill para desenvolvimento da plataforma AccCourse — ferramenta de autoria e-learning enterprise. Use quando criar features, blocos interativos, exportação SCORM/xAPI, melhorar UI/UX do editor, analisar concorrentes (Articulate 360, Adobe Captivate, PowerPoint), sugerir melhorias, implementar interatividade, drag-and-drop, quizzes, branching, gamificação, templates, acessibilidade WCAG, AI features, ou qualquer desenvolvimento relacionado ao AccCourse."
version: 1.0.0
author: Lorenzo Di Cunto
created: 2026-03-22
platforms: [antigravity]
category: product-development
tags: [e-learning, authoring-tool, enterprise, interactivity, SCORM, xAPI]
risk: safe
source: custom
---

# AccCourse Platform Developer

## Purpose

Guiar o desenvolvimento da plataforma AccCourse — ferramenta de autoria e-learning SaaS multi-tenant para grandes empresas. Esta skill conhece profundamente a arquitetura, os padrões de código e o roadmap do produto, fornecendo orientação contextual para implementar novas features, corrigir bugs e evoluir a plataforma.

## When to Use

- Criar ou modificar **tipos de bloco** (texto, imagem, quiz, flashcard, vídeo, forma, etc.)
- Implementar **interatividade** (drag-and-drop, matching, sorting, fill-blank, hotspot, branching)
- Trabalhar com **exportação SCORM/xAPI/cmi5**
- Melhorar a **UI/UX do editor** (toolbar, canvas, properties panel, slide navigator)
- Adicionar **features enterprise** (templates, content library, colaboração, analytics)
- Integrar **AI features** (geração de cursos, voiceover, temas inteligentes)
- Analisar **concorrentes** e sugerir melhorias
- Trabalhar com o **store Zustand**, **Prisma schema** ou **API routes**
- Qualquer desenvolvimento relacionado ao AccCourse

---

## Platform Overview

### Tech Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Linguagem | TypeScript |
| UI | React 19 + shadcn/ui + Tailwind CSS 4 |
| Estado | Zustand 5 (com undo/redo, 30 níveis) |
| Drag & Drop | @dnd-kit (core + sortable + modifiers) |
| Auth | NextAuth.js v5 |
| Banco | Prisma + SQLite (Docker volume) |
| AI | Vercel AI SDK + OpenAI (GPT-4o) |
| SCORM | Gerador próprio (JSZip + manifest + adapter) |
| Deploy | Coolify (Docker, VPS) |
| Sanitização | DOMPurify (isomorphic) |

### Repositório

- **Local**: `/Users/lorenzodicunto/Library/CloudStorage/OneDrive-Accuracy/antigravity/AccCourse`
- **GitHub**: `https://github.com/lorenzodicunto/AccCourse.git` (branch `main`)

### Arquitetura de Componentes

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Dashboard (cards com prévia)
│   ├── editor/                   # Página do editor
│   ├── admin/                    # Painel administrativo
│   ├── login/                    # Autenticação
│   ├── review/                   # Portal de review
│   └── api/                      # API Routes
│       ├── ai/                   # AI endpoints (themes, generation)
│       ├── auth/                 # NextAuth handlers
│       ├── upload/               # Chunked upload
│       └── uploads/              # Serve uploaded files
├── components/
│   ├── editor/
│   │   ├── Canvas.tsx            # Canvas 960×540 com drag
│   │   ├── DraggableBlock.tsx    # Renderização de blocos
│   │   ├── PropertiesPanel.tsx   # Painel de propriedades (64KB)
│   │   ├── TopToolbar.tsx        # Ribbon toolbar (25KB)
│   │   ├── SlideNavigator.tsx    # Navegação lateral de slides
│   │   ├── StatusBar.tsx         # Barra de status
│   │   └── RibbonGroup.tsx       # Agrupamento da ribbon
│   ├── dashboard/                # Componentes do dashboard
│   └── ui/                       # shadcn/ui components
├── store/
│   └── useEditorStore.ts         # Store principal (763 linhas)
├── lib/
│   ├── scorm/                    # Pipeline SCORM
│   │   ├── packager.ts           # Coordena geração do ZIP
│   │   ├── htmlGenerator.ts      # Gera HTML de cada slide
│   │   ├── manifest.ts           # imsmanifest.xml
│   │   ├── scormApi.ts           # SCORM 1.2 JS adapter
│   │   └── styles.ts             # CSS do player
│   ├── auth.ts                   # NextAuth config
│   ├── prisma.ts                 # Prisma client
│   ├── sanitize.ts               # DOMPurify wrapper
│   └── utils.ts                  # Helpers
├── types/                        # Tipo declarations
└── middleware.ts                 # Auth middleware
```

### Block Types (6 tipos atuais)

| Tipo | Interface | Propriedades-chave |
|------|-----------|--------------------|
| `text` | `TextBlock` | content (HTML), fontSize, fontWeight, fontStyle, textDecoration, color, textAlign, lineHeight, letterSpacing, textShadow, backgroundColor, borderRadius, opacity, listType |
| `image` | `ImageBlock` | src, alt, objectFit, opacity, borderRadius, borderWidth, borderColor, boxShadow |
| `flashcard` | `FlashcardBlock` | frontContent, backContent, frontBg, backBg |
| `quiz` | `QuizBlock` | question, options[], feedback, pointsValue |
| `video` | `VideoBlock` | url, interactions[] (timestampSeconds, question, options) |
| `shape` | `ShapeBlock` | shapeType (7 tipos), fillColor, strokeColor, strokeWidth, opacity, rotation |

Todos estendem `BaseBlock`: `{ id, type, x, y, width, height, zIndex }`

### Prisma Models

```
Tenant (id, name) ──1:N──▸ User (id, email, passwordHash, name, role, tenantId)
                   ──1:N──▸ Course (id, title, description, thumbnail, courseData JSON, tenantId, authorId)

SharedCourse (id, title, courseData) ──1:N──▸ Comment (text, slideId, reviewerId)
                                               ▴
Reviewer (id, name, email) ─────────1:N────────┘
```

---

## Development Workflow

### Criar Novo Tipo de Bloco (Padrão)

Sempre que criar um novo bloco interativo, siga estes 6 passos:

**1. Definir interface** em `useEditorStore.ts`:
```typescript
export interface NovoBlock extends BaseBlock {
  type: "novo";
  // propriedades específicas
}
// Atualizar o union type:
export type Block = TextBlock | ImageBlock | ... | NovoBlock;
```

**2. Adicionar ao Store** — criar defaults no `addBlock`:
```typescript
// Em TopToolbar.tsx, botão que dispara:
addBlock(projectId, slideId, {
  id: crypto.randomUUID(),
  type: "novo",
  x: 100, y: 100,
  width: 400, height: 300,
  zIndex: slide.blocks.length,
  // ... defaults
});
```

**3. Renderizar em DraggableBlock.tsx** — adicionar case no switch:
```typescript
case "novo":
  return <NovoBlockRenderer block={block as NovoBlock} />;
```

**4. Adicionar controles em PropertiesPanel.tsx** — seção condicional:
```typescript
{block.type === "novo" && (
  <RibbonGroup title="Novo Block">
    {/* inputs, selects, sliders... */}
  </RibbonGroup>
)}
```

**5. Exportar para SCORM** — em `htmlGenerator.ts`:
```typescript
case "novo":
  return generateNovoBlockHTML(block as NovoBlock);
```

**6. Testar** — verificar no editor + preview + SCORM export.

### Convenções de Código

- **Imutabilidade**: store Zustand usa spread `{ ...state, ...updates }`, nunca muta direto
- **Undo/Redo**: SEMPRE push snapshot em `past[]` antes de mutações
- **Sanitização**: HTML de texto passa por DOMPurify antes de `dangerouslySetInnerHTML`
- **IDs**: usar `crypto.randomUUID()` para todos os IDs
- **Componentes UI**: preferir shadcn/ui + Tailwind, não CSS custom
- **APIs**: usar Route Handlers do Next.js App Router (`route.ts`)
- **Validação**: Zod para inputs de API

---

## Gap Analysis (AccCourse vs Líderes)

| Feature | Articulate | Captivate | AccCourse | Status |
|---------|-----------|-----------|-----------|--------|
| Editor visual | ✅ | ✅ | ✅ | Pronto |
| Quizzes | 25+ tipos | Pools+CSV | 1 tipo | 🔴 Gap |
| Drag-and-drop | ✅ | ✅ | — | 📋 Planejado |
| Branching | ✅ | ✅ | — | 💡 Futuro |
| Content Library | 7M+ assets | Templates | — | 🔴 Gap |
| AI Assistant | ✅ | ✅ | Temas | 🟡 Parcial |
| SCORM | ✅ | ✅ | ✅ 1.2 | Pronto |
| xAPI/cmi5 | ✅ | ✅ | — | 📋 Planejado |
| Responsivo | ✅ | ✅ | Fixo | 🔴 Gap |
| Acessibilidade | WCAG 2.1 | WCAG+508 | Básico | 🔴 Gap |
| Colaboração | Review 360 | Comentários | Review links | 🟡 Parcial |
| VR/360° | Básico | ✅ | — | 💡 Futuro |
| AI Voice | ✅ | ✅ | — | 💡 Futuro |
| PPT Import | — | ✅ | — | 💡 Futuro |

---

## AI Integration Points

O AccCourse já usa Vercel AI SDK + OpenAI. Pontos de expansão:

| Feature AI | Endpoint | Modelo | Descrição |
|------------|----------|--------|-----------|
| Theme Generator | `/api/ai/` | GPT-4o Vision | Extrai cores de logo — **já implementado** |
| Course Generator | `/api/ai/generate` | GPT-4o | Gera slides completos a partir de prompt |
| Quiz Generator | `/api/ai/quiz` | GPT-4o | Gera perguntas a partir de conteúdo |
| Content Rewriter | `/api/ai/rewrite` | GPT-4o | Reescreve texto (tom, nível) |
| Voice Narration | `/api/ai/tts` | OpenAI TTS | Gera áudio para slides |
| Image Generator | `/api/ai/image` | DALL-E 3 | Gera imagens para slides |
| Alt Text | `/api/ai/alt` | GPT-4o Vision | Gera alt text para acessibilidade |

---

## Reference Files

Para informações detalhadas, consulte:

| Referência | Conteúdo |
|------------|----------|
| [platform-architecture.md](references/platform-architecture.md) | Mapa completo: tipos, store, schema, SCORM pipeline, APIs |
| [feature-roadmap.md](references/feature-roadmap.md) | Roadmap em 4 fases com prioridades e estimativas |
| [interactivity-patterns.md](references/interactivity-patterns.md) | Guia técnico para cada tipo de interatividade |
| [competitor-analysis.md](references/competitor-analysis.md) | Análise detalhada: Articulate 360, Adobe Captivate, iSpring |
| [modern-trends.md](references/modern-trends.md) | Tendências e-learning 2025/2026 e oportunidades |

---

## Quick Commands

```bash
# Desenvolvimento local
cd /Users/lorenzodicunto/Library/CloudStorage/OneDrive-Accuracy/antigravity/AccCourse
npm run dev              # http://localhost:3000

# Database
npx prisma db push       # Sync schema
npx prisma studio        # GUI do banco

# Build
npm run build            # Production build

# Deploy (Coolify)
git push origin main     # Auto-deploy via webhook
```

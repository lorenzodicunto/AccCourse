# Platform Architecture — AccCourse

## Table of Contents
- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [Block Types (Interfaces)](#block-types)
- [Store Zustand](#store-zustand)
- [Schema Prisma](#schema-prisma)
- [SCORM Pipeline](#scorm-pipeline)
- [API Routes](#api-routes)
- [Componentes do Editor](#componentes-do-editor)
- [Fluxo de Dados](#fluxo-de-dados)

---

## Estrutura de Diretórios

```
AccCourse/
├── prisma/
│   ├── schema.prisma          # Models: Tenant, User, Course, SharedCourse, Comment
│   ├── dev.db                 # SQLite database
│   └── seed.ts                # Seed data
├── public/                    # Assets estáticos
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # Dashboard principal (19KB)
│   │   ├── globals.css        # Estilos globais + Tailwind
│   │   ├── layout.tsx         # Root layout com providers
│   │   ├── editor/            # Editor de cursos
│   │   ├── admin/             # Painel admin
│   │   ├── login/             # Página de login
│   │   ├── review/            # Portal de review
│   │   └── api/
│   │       ├── ai/            # AI endpoints (theme gen, etc.)
│   │       ├── auth/          # NextAuth handlers
│   │       ├── upload/        # Chunked upload endpoint
│   │       └── uploads/       # Serve arquivos uploadados
│   ├── components/
│   │   ├── AuthProvider.tsx    # SessionProvider wrapper
│   │   ├── HydrationGuard.tsx  # Guard contra SSR/client mismatch
│   │   ├── editor/            # Componentes do editor (detalhes abaixo)
│   │   ├── dashboard/         # Componentes do dashboard
│   │   └── ui/                # shadcn/ui components
│   ├── store/
│   │   └── useEditorStore.ts  # Store Zustand principal (763 linhas)
│   ├── lib/
│   │   ├── scorm/             # Pipeline SCORM (detalhes abaixo)
│   │   ├── auth.ts            # NextAuth config (credentials provider)
│   │   ├── prisma.ts          # Singleton Prisma Client
│   │   ├── sanitize.ts        # DOMPurify wrapper
│   │   ├── env.ts             # Environment variables validation
│   │   └── utils.ts           # cn() helper (clsx + tailwind-merge)
│   ├── types/
│   │   ├── next-auth.d.ts     # NextAuth type augmentation
│   │   └── react-player.d.ts  # ReactPlayer types
│   └── middleware.ts          # Auth middleware (protege /editor, /admin)
├── Dockerfile                 # Multi-stage build
├── entrypoint.sh              # Docker entrypoint (prisma db push + start)
└── package.json               # Dependencies
```

---

## Block Types

### BaseBlock (Comum a todos)

```typescript
interface BaseBlock {
  id: string;        // crypto.randomUUID()
  type: string;      // Discriminator
  x: number;         // Posição X no canvas (px)
  y: number;         // Posição Y no canvas (px)
  width: number;     // Largura (px)
  height: number;    // Altura (px)
  zIndex: number;    // Camada (controle ↑↓)
}
```

### TextBlock

```typescript
interface TextBlock extends BaseBlock {
  type: "text";
  content: string;           // HTML rico (sanitizar com DOMPurify!)
  fontSize: number;          // px
  fontWeight: string;        // "400", "500", "600", "700", "800", "900"
  fontStyle: "normal" | "italic";
  textDecorationLine: "none" | "underline" | "line-through";
  color: string;             // Hex/rgba
  textAlign: "left" | "center" | "right";
  lineHeight: number;        // Multiplicador (ex: 1.5)
  letterSpacing: number;     // px
  textShadow: string;        // CSS text-shadow
  backgroundColor: string;   // "transparent" = sem fundo
  borderRadius: number;      // px
  opacity: number;           // 0–1
  listType: "none" | "ul" | "ol";
}
```

### ImageBlock

```typescript
interface ImageBlock extends BaseBlock {
  type: "image";
  src: string;                    // URL da imagem
  alt: string;                    // Alt text
  objectFit: "cover" | "contain" | "fill";
  opacity: number;                // 0–1
  borderRadius: number;           // px
  borderWidth: number;            // px
  borderColor: string;            // Hex
  boxShadow: string;              // CSS box-shadow (4 presets)
}
```

### FlashcardBlock

```typescript
interface FlashcardBlock extends BaseBlock {
  type: "flashcard";
  frontContent: string;     // Texto da frente
  backContent: string;      // Texto do verso
  frontBg: string;          // Cor de fundo frente
  backBg: string;           // Cor de fundo verso
}
// Renderiza com CSS 3D flip animation
```

### QuizBlock

```typescript
interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizBlock extends BaseBlock {
  type: "quiz";
  question: string;
  options: QuizOption[];
  feedback: { correct: string; incorrect: string };
  pointsValue: number;          // Pontos por resposta correta
}
// Integrado com SCORM via cmi.score / cmi.interactions
```

### VideoBlock

```typescript
interface VideoInteraction {
  id: string;
  timestampSeconds: number;      // Momento do vídeo (seg)
  question: string;
  options: { text: string; isCorrect: boolean }[];
  answered: boolean;
}

interface VideoBlock extends BaseBlock {
  type: "video";
  url: string;                   // YouTube/Vimeo URL
  interactions: VideoInteraction[]; // Perguntas em timestamps
}
// Usa react-player para renderização
```

### ShapeBlock

```typescript
type ShapeType = "rectangle" | "circle" | "rounded-rect" | "triangle" | "arrow" | "line" | "star";

interface ShapeBlock extends BaseBlock {
  type: "shape";
  shapeType: ShapeType;          // 7 tipos disponíveis
  fillColor: string;             // Preenchimento
  strokeColor: string;           // Cor da borda
  strokeWidth: number;           // Largura da borda
  opacity: number;               // 0–1
  rotation: number;              // Graus (0–360)
}
// Renderiza via SVG inline
```

### Union Type

```typescript
type Block = TextBlock | ImageBlock | FlashcardBlock | QuizBlock | VideoBlock | ShapeBlock;
```

---

## Store Zustand

### Estrutura do Estado

```typescript
interface EditorState {
  projects: CourseProject[];        // Todos os projetos carregados
  currentProjectId: string | null;  // Projeto sendo editado
  currentSlideId: string | null;    // Slide selecionado
  selectedBlockId: string | null;   // Bloco selecionado
  past: CourseProject[][];          // Pilha de undo (max 30)
  future: CourseProject[][];        // Pilha de redo (max 30)
  previewMode: "desktop" | "mobile";
}
```

### Padrão de Mutação (com Undo)

```typescript
// SEMPRE push snapshot antes de mutar:
someAction: () => {
  const state = get();
  set({
    past: [...state.past, state.projects].slice(-MAX_HISTORY),
    future: [],                    // Limpa redo em nova ação
    projects: /* nova versão */,
  });
}
```

### Actions Disponíveis

| Grupo | Actions |
|-------|---------|
| **Project** | `addProject`, `updateProject`, `deleteProject`, `setCurrentProject` |
| **Slide** | `addSlide`, `duplicateSlide`, `deleteSlide`, `reorderSlides`, `setCurrentSlide`, `updateSlideBackground`, `updateSlideTransition`, `updateSlideNotes` |
| **Block** | `addBlock`, `updateBlock`, `deleteBlock`, `duplicateBlock`, `setSelectedBlock` |
| **Theme** | `setTheme`, `applyThemeToAllSlides` |
| **Undo/Redo** | `undo`, `redo` |
| **Preview** | `setPreviewMode` |
| **Hydration** | `hydrateProject`, `setProjects` |
| **Getters** | `getCurrentProject`, `getCurrentSlide`, `getSelectedBlock` |

### Models Auxiliares

```typescript
interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  customFontUrl: string | null;
  mode: "light" | "dark";
}

interface Slide {
  id: string;
  order: number;
  blocks: Block[];
  background: string;         // Hex ou CSS gradient
  transition: "none" | "fade" | "slide" | "zoom";
  notes: string;              // Notas do apresentador
}

interface QuizSettings {
  passingScore: number;       // 0–100 (%)
  showResults: boolean;
  allowRetry: boolean;
  maxAttempts: number;
}

interface CourseProject {
  id: string;
  title: string;
  description: string;
  thumbnail: string;          // CSS gradient string
  theme: ThemeConfig;
  slides: Slide[];
  quizSettings: QuizSettings;
  createdAt: string;          // ISO date
  updatedAt: string;          // ISO date
}
```

---

## Schema Prisma

```prisma
model Tenant {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  users     User[]
  courses   Course[]
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  role         String   @default("AUTHOR")  // ADMIN, AUTHOR, VIEWER
  tenantId     String?
  tenant       Tenant?  @relation
  courses      Course[]
  createdAt    DateTime @default(now())
}

model Course {
  id          String   @id @default(cuid())
  title       String
  description String   @default("")
  thumbnail   String   @default("")
  courseData   String   @default("{}")  // JSON serializado do CourseProject
  tenantId    String?
  authorId    String
  tenant      Tenant?  @relation
  author      User     @relation
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

> **Nota**: `courseData` armazena o JSON completo do `CourseProject` (slides, blocos, theme, quiz settings). Este é o modelo "document store" — toda a estrutura do curso vive em um campo JSON.

---

## SCORM Pipeline

### Fluxo de Geração

```
CourseProject (store)
       │
       ▼
  packager.ts ─────────────▸ JSZip
       │                        │
       ├─▸ manifest.ts          │  imsmanifest.xml
       ├─▸ htmlGenerator.ts     │  index.html (cada slide)
       ├─▸ scormApi.ts          │  scormApi.js
       └─▸ styles.ts            │  styles.css
                                │
                                ▼
                          curso.zip (download)
```

### Arquivos do Pipeline

| Arquivo | Responsabilidade | Tamanho |
|---------|------------------|---------|
| `packager.ts` | Orquestra a geração, cria o ZIP com JSZip | 4.4KB |
| `htmlGenerator.ts` | Converte cada bloco em HTML estático | 17.6KB |
| `manifest.ts` | Gera `imsmanifest.xml` SCORM 1.2 | 1.7KB |
| `scormApi.ts` | JS adapter que faz bridge com LMS | 2.7KB |
| `styles.ts` | CSS do player SCORM | 6.6KB |
| `index.ts` | Re-exports | 131B |

### SCORM API Functions

```javascript
// scormApi.ts implementa:
LMSInitialize()
LMSGetValue(key)      // cmi.core.lesson_status, cmi.score.raw, etc.
LMSSetValue(key, val) // cmi.core.lesson_status = "completed"
LMSCommit()
LMSFinish()
```

---

## API Routes

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/[...nextauth]` | ALL | NextAuth.js handlers (credentials) |
| `/api/ai/` | POST | AI Theme Generator (GPT-4o Vision) |
| `/api/upload/` | POST | Chunked file upload |
| `/api/uploads/[...path]` | GET | Serve arquivos uploadados |

---

## Componentes do Editor

| Componente | Tamanho | Responsabilidade |
|------------|---------|------------------|
| `Canvas.tsx` | 10KB | Canvas 960×540, drop zone, renderiza DraggableBlocks |
| `DraggableBlock.tsx` | 18.5KB | Wrapper draggable + renderização condicional por tipo |
| `PropertiesPanel.tsx` | 64.6KB | Painel direito com controles de cada tipo de bloco |
| `TopToolbar.tsx` | 25.3KB | Ribbon toolbar com todas as ações (inserir, formatar, export) |
| `SlideNavigator.tsx` | 9KB | Painel lateral esquerdo com thumbnails dos slides |
| `StatusBar.tsx` | 3.4KB | Barra inferior (zoom, preview mode, slide count) |
| `RibbonGroup.tsx` | 2.2KB | Componente wrapper para agrupamento na ribbon |

---

## Fluxo de Dados

```
User Input (UI)
      │
      ▼
TopToolbar / PropertiesPanel / Canvas
      │
      ▼
useEditorStore (Zustand)  ◄──── undo/redo
      │
      ├──▸ Canvas re-render (React)
      ├──▸ SlideNavigator re-render
      ├──▸ PropertiesPanel re-render
      │
      ▼ (auto-save)
API Route (/api/courses)
      │
      ▼
Prisma → SQLite (courseData JSON)
      │
      ▼ (on export)
SCORM Pipeline → ZIP download
```

import { create } from "zustand";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  customFontUrl: string | null;
  mode: "light" | "dark";
}

export interface BaseBlock {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextBlock extends BaseBlock {
  type: "text";
  content: string; // HTML (rich text) — sanitize with DOMPurify before rendering!
  fontSize: number;
  fontWeight: string;
  color: string;
  textAlign: "left" | "center" | "right";
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  src: string;
  alt: string;
  objectFit: "cover" | "contain" | "fill";
}

export interface FlashcardBlock extends BaseBlock {
  type: "flashcard";
  frontContent: string;
  backContent: string;
  frontBg: string;
  backBg: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizBlock extends BaseBlock {
  type: "quiz";
  question: string;
  options: QuizOption[];
  feedback: { correct: string; incorrect: string };
}

export interface VideoInteraction {
  id: string;
  timestampSeconds: number;
  question: string;
  options: { text: string; isCorrect: boolean }[];
  answered: boolean;
}

export interface VideoBlock extends BaseBlock {
  type: "video";
  url: string;
  interactions: VideoInteraction[];
}

export type Block = TextBlock | ImageBlock | FlashcardBlock | QuizBlock | VideoBlock;

export interface Slide {
  id: string;
  order: number;
  blocks: Block[];
  background: string;
}

export interface CourseProject {
  id: string;
  title: string;
  description: string;
  thumbnail: string; // gradient CSS string
  theme: ThemeConfig;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
}

// ─── Store Interface ─────────────────────────────────────────────────────────

interface EditorState {
  projects: CourseProject[];
  currentProjectId: string | null;
  currentSlideId: string | null;
  selectedBlockId: string | null;
  past: CourseProject[][];
  future: CourseProject[][];
  previewMode: "desktop" | "mobile";
}

interface EditorActions {
  // Project CRUD
  addProject: (project: CourseProject) => void;
  updateProject: (id: string, updates: Partial<CourseProject>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;

  // Slide CRUD
  addSlide: (projectId: string) => void;
  duplicateSlide: (projectId: string, slideId: string) => void;
  deleteSlide: (projectId: string, slideId: string) => void;
  reorderSlides: (projectId: string, slideIds: string[]) => void;
  setCurrentSlide: (id: string | null) => void;
  updateSlideBackground: (
    projectId: string,
    slideId: string,
    background: string
  ) => void;

  // Block CRUD
  addBlock: (projectId: string, slideId: string, block: Block) => void;
  updateBlock: (
    projectId: string,
    slideId: string,
    blockId: string,
    updates: Partial<Block>
  ) => void;
  deleteBlock: (
    projectId: string,
    slideId: string,
    blockId: string
  ) => void;
  setSelectedBlock: (id: string | null) => void;

  // Theme
  setTheme: (projectId: string, theme: Partial<ThemeConfig>) => void;
  applyThemeToAllSlides: (projectId: string) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;

  // Preview
  setPreviewMode: (mode: "desktop" | "mobile") => void;

  // Cloud Hydration
  hydrateProject: (project: CourseProject) => void;
  setProjects: (projects: CourseProject[]) => void;

  // Helpers
  getCurrentProject: () => CourseProject | null;
  getCurrentSlide: () => Slide | null;
  getSelectedBlock: () => Block | null;
}

type EditorStore = EditorState & EditorActions;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateId = () => crypto.randomUUID();

const GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
];

const randomGradient = () =>
  GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];

const MAX_HISTORY = 30;

// ─── Store ───────────────────────────────────────────────────────────────────

export const useEditorStore = create<EditorStore>()(
    (set, get) => ({
      // Initial State
      projects: [],
      currentProjectId: null,
      currentSlideId: null,
      selectedBlockId: null,
      past: [],
      future: [],
      previewMode: "desktop",

      // ─── Snapshot helpers (undo/redo) ──────────────────
      // We push a snapshot of `projects` before every mutation.

      // ─── Project CRUD ──────────────────────────────────

      addProject: (project) => {
        const state = get();
        set({
          past: [...state.past, state.projects].slice(-MAX_HISTORY),
          future: [],
          projects: [...state.projects, project],
        });
      },

      updateProject: (id, updates) => {
        const state = get();
        set({
          past: [...state.past, state.projects].slice(-MAX_HISTORY),
          future: [],
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        });
      },

      deleteProject: (id) => {
        const state = get();
        set({
          past: [...state.past, state.projects].slice(-MAX_HISTORY),
          future: [],
          projects: state.projects.filter((p) => p.id !== id),
          currentProjectId:
            state.currentProjectId === id ? null : state.currentProjectId,
        });
      },

      setCurrentProject: (id) => set({ currentProjectId: id }),

      // ─── Slide CRUD ────────────────────────────────────

      addSlide: (projectId) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        if (!project) return;

        const newSlide: Slide = {
          id: generateId(),
          order: project.slides.length,
          blocks: [],
          background: "#ffffff",
        };

        set({
          past: [...state.past, state.projects].slice(-MAX_HISTORY),
          future: [],
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  slides: [...p.slides, newSlide],
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          currentSlideId: newSlide.id,
        });
      },

      duplicateSlide: (projectId, slideId) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        if (!project) return;
        const slide = project.slides.find((s) => s.id === slideId);
        if (!slide) return;

        const newSlide: Slide = {
          ...JSON.parse(JSON.stringify(slide)),
          id: generateId(),
          order: project.slides.length,
          blocks: slide.blocks.map((b) => ({ ...b, id: generateId() })),
        };

        set({
          past: [...state.past, state.projects].slice(-MAX_HISTORY),
          future: [],
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  slides: [...p.slides, newSlide],
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          currentSlideId: newSlide.id,
        });
      },

      deleteSlide: (projectId, slideId) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        if (!project) return;
        const remainingSlides = project.slides
          .filter((s) => s.id !== slideId)
          .map((s, i) => ({ ...s, order: i }));

        set({
          past: [...state.past, state.projects].slice(-MAX_HISTORY),
          future: [],
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  slides: remainingSlides,
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          currentSlideId:
            state.currentSlideId === slideId
              ? remainingSlides[0]?.id ?? null
              : state.currentSlideId,
        });
      },

      reorderSlides: (projectId, slideIds) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        if (!project) return;

        const slideMap = new Map(project.slides.map((s) => [s.id, s]));
        const reordered = slideIds
          .map((id, i) => {
            const slide = slideMap.get(id);
            return slide ? { ...slide, order: i } : null;
          })
          .filter(Boolean) as Slide[];

        set({
          past: [...state.past, state.projects].slice(-MAX_HISTORY),
          future: [],
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  slides: reordered,
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        });
      },

      setCurrentSlide: (id) => set({ currentSlideId: id, selectedBlockId: null }),

      updateSlideBackground: (projectId, slideId, background) => {
        const state = get();
        set({
          past: [...state.past, state.projects].slice(-MAX_HISTORY),
          future: [],
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  slides: p.slides.map((s) =>
                    s.id === slideId ? { ...s, background } : s
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        });
      },

      // ─── Block CRUD ────────────────────────────────────

      addBlock: (projectId, slideId, block) => {
        const state = get();
        set({
          past: [...state.past, state.projects].slice(-MAX_HISTORY),
          future: [],
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  slides: p.slides.map((s) =>
                    s.id === slideId
                      ? { ...s, blocks: [...s.blocks, block] }
                      : s
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          selectedBlockId: block.id,
        });
      },

      updateBlock: (projectId, slideId, blockId, updates) => {
        const state = get();
        set({
          past: [...state.past, state.projects].slice(-MAX_HISTORY),
          future: [],
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  slides: p.slides.map((s) =>
                    s.id === slideId
                      ? {
                          ...s,
                          blocks: s.blocks.map((b) =>
                            b.id === blockId ? ({ ...b, ...updates } as Block) : b
                          ),
                        }
                      : s
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        });
      },

      deleteBlock: (projectId, slideId, blockId) => {
        const state = get();
        set({
          past: [...state.past, state.projects].slice(-MAX_HISTORY),
          future: [],
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  slides: p.slides.map((s) =>
                    s.id === slideId
                      ? { ...s, blocks: s.blocks.filter((b) => b.id !== blockId) }
                      : s
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          selectedBlockId:
            state.selectedBlockId === blockId ? null : state.selectedBlockId,
        });
      },

      setSelectedBlock: (id) => set({ selectedBlockId: id }),

      // ─── Theme ─────────────────────────────────────────

      setTheme: (projectId, theme) => {
        const state = get();
        set({
          past: [...state.past, state.projects].slice(-MAX_HISTORY),
          future: [],
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  theme: { ...p.theme, ...theme },
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        });
      },

      applyThemeToAllSlides: (projectId) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        if (!project) return;

        const { primaryColor, secondaryColor, fontFamily } = project.theme;

        set({
          past: [...state.past, state.projects].slice(-MAX_HISTORY),
          future: [],
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              updatedAt: new Date().toISOString(),
              slides: p.slides.map((slide) => ({
                ...slide,
                blocks: slide.blocks.map((block) => {
                  if (block.type === "text") {
                    // Update text blocks: apply font and color
                    const textBlock = block as TextBlock;
                    // Replace font-family in HTML content
                    let content = textBlock.content;
                    content = content.replace(
                      /font-family:[^;"]+/g,
                      `font-family: ${fontFamily}`
                    );
                    return {
                      ...textBlock,
                      color: secondaryColor,
                      content,
                    };
                  }
                  if (block.type === "flashcard") {
                    const fc = block as FlashcardBlock;
                    return {
                      ...fc,
                      frontBg: primaryColor,
                      backBg: secondaryColor,
                    };
                  }
                  return block;
                }),
              })),
            };
          }),
        });
      },

      // ─── Undo / Redo ──────────────────────────────────

      undo: () => {
        const state = get();
        if (state.past.length === 0) return;
        const previous = state.past[state.past.length - 1];
        set({
          past: state.past.slice(0, -1),
          future: [state.projects, ...state.future].slice(0, MAX_HISTORY),
          projects: previous,
        });
      },

      redo: () => {
        const state = get();
        if (state.future.length === 0) return;
        const next = state.future[0];
        set({
          past: [...state.past, state.projects].slice(-MAX_HISTORY),
          future: state.future.slice(1),
          projects: next,
        });
      },

      // ─── Preview ───────────────────────────────────────

      setPreviewMode: (mode) => set({ previewMode: mode }),

      // ─── Getters ───────────────────────────────────────

      getCurrentProject: () => {
        const state = get();
        return (
          state.projects.find((p) => p.id === state.currentProjectId) ?? null
        );
      },

      getCurrentSlide: () => {
        const state = get();
        const project = state.projects.find(
          (p) => p.id === state.currentProjectId
        );
        if (!project) return null;
        return project.slides.find((s) => s.id === state.currentSlideId) ?? null;
      },

      getSelectedBlock: () => {
        const state = get();
        const project = state.projects.find(
          (p) => p.id === state.currentProjectId
        );
        if (!project) return null;
        const slide = project.slides.find(
          (s) => s.id === state.currentSlideId
        );
        if (!slide) return null;
        return slide.blocks.find((b) => b.id === state.selectedBlockId) ?? null;
      },
      // ─── Cloud Hydration ──────────────────────────────

      hydrateProject: (project) => {
        set((s) => {
          const exists = s.projects.some((p) => p.id === project.id);
          if (exists) {
            return {
              projects: s.projects.map((p) =>
                p.id === project.id ? project : p
              ),
            };
          }
          return { projects: [...s.projects, project] };
        });
      },

      setProjects: (projects) => set({ projects }),
    })
);

// ─── Helper: Create a new default project ────────────────────────────────────

export function createDefaultProject(
  title: string,
  description: string = ""
): CourseProject {
  const projectId = generateId();
  const slideId = generateId();
  return {
    id: projectId,
    title,
    description,
    thumbnail: randomGradient(),
    theme: {
      primaryColor: "#7c3aed",
      secondaryColor: "#4f46e5",
      fontFamily: "Inter, sans-serif",
      customFontUrl: null,
      mode: "light",
    },
    slides: [
      {
        id: slideId,
        order: 0,
        blocks: [],
        background: "#ffffff",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

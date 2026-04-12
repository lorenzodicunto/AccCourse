import { create } from "zustand";

// ─── Types (imported & re-exported for backward compatibility) ───────────────
export type {
  ThemeConfig,
  AnimationType,
  AnimationEasing,
  BlockAnimation,
  BaseBlock,
  TextBlock,
  ImageBlock,
  FlashcardBlock,
  QuizOption,
  QuizBlock,
  VideoInteraction,
  VideoBlock,
  ShapeType,
  ShapeBlock,
  AudioBlock,
  TrueFalseBlock,
  MatchingBlock,
  FillBlankBlock,
  SortingBlock,
  HotspotBlock,
  AccordionBlock,
  TabsBlock,
  BranchingBlock,
  TimelineBlock,
  DragDropBlock,
  InteractiveVideoBlock,
  GameBlock,
  Block,
  SlideTransition,
  Slide,
  QuizSettings,
  GamificationSettings,
  CourseProject,
} from "./types";

import type {
  ThemeConfig,
  TextBlock,
  FlashcardBlock,
  Block,
  Slide,
  SlideTransition,
  CourseProject,
} from "./types";

// ─── Store Interface ─────────────────────────────────────────────────────────

interface EditorState {
  projects: CourseProject[];
  currentProjectId: string | null;
  currentSlideId: string | null;
  selectedBlockId: string | null;
  selectedBlockIds: string[];
  past: CourseProject[][];
  future: CourseProject[][];
  previewMode: "desktop" | "mobile";
  zoom: number;
}

interface EditorActions {
  // Project CRUD
  addProject: (project: CourseProject) => void;
  updateProject: (id: string, updates: Partial<CourseProject>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;

  // Slide CRUD
  addSlide: (projectId: string) => string;
  duplicateSlide: (projectId: string, slideId: string) => void;
  deleteSlide: (projectId: string, slideId: string) => void;
  reorderSlides: (projectId: string, slideIds: string[]) => void;
  insertSlideContextual: (
    projectId: string,
    targetSlide: Slide,
    insertAfterId?: string
  ) => void;
  setCurrentSlide: (id: string | null) => void;
  updateSlideBackground: (
    projectId: string,
    slideId: string,
    background: string
  ) => void;

  // Block CRUD
  addBlock: (projectId: string, slideId: string, block: Block) => void;
  addBlocks: (projectId: string, slideId: string, blocks: Block[]) => void;
  updateBlock: (
    projectId: string,
    slideId: string,
    blockId: string,
    updates: Partial<Block>
  ) => void;
  updateBlocks: (
    projectId: string,
    slideId: string,
    updates: { id: string; changes: Partial<Block> }[]
  ) => void;
  deleteBlock: (
    projectId: string,
    slideId: string,
    blockId: string
  ) => void;
  deleteBlocks: (
    projectId: string,
    slideId: string,
    blockIds: string[]
  ) => void;
  duplicateBlock: (
    projectId: string,
    slideId: string,
    blockId: string
  ) => void;
  duplicateBlocks: (
    projectId: string,
    slideId: string,
    blockIds: string[]
  ) => void;
  setSelectedBlock: (id: string | null) => void;
  toggleBlockSelection: (blockId: string) => void;
  clearBlockSelection: () => void;
  selectAllBlocks: (projectId: string, slideId: string) => void;

  // Slide extras
  updateSlideTransition: (
    projectId: string,
    slideId: string,
    transition: SlideTransition
  ) => void;
  updateSlideNotes: (
    projectId: string,
    slideId: string,
    notes: string
  ) => void;

  // Theme
  setTheme: (projectId: string, theme: Partial<ThemeConfig>) => void;
  applyThemeToAllSlides: (projectId: string) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;

  // Preview
  setPreviewMode: (mode: "desktop" | "mobile") => void;

  // Zoom
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomFit: () => void;

  // Cloud Hydration
  hydrateProject: (project: CourseProject) => void;
  setProjects: (projects: CourseProject[]) => void;

  // Helpers
  getCurrentProject: () => CourseProject | null;
  getCurrentSlide: () => Slide | null;
  getSelectedBlock: () => Block | null;
  getSelectedBlocks: () => Block[];
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
      selectedBlockIds: [],
      past: [],
      future: [],
      previewMode: "desktop",
      zoom: 100,

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
        if (!project) return "";

        const newSlide: Slide = {
          id: generateId(),
          order: project.slides.length,
          blocks: [],
          background: "#ffffff",
          transition: "none",
          notes: "",
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

        return newSlide.id;
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

      insertSlideContextual: (projectId, targetSlide, insertAfterId) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        if (!project) return;

        const newSlide: Slide = {
          ...JSON.parse(JSON.stringify(targetSlide)),
          id: generateId(),
          blocks: targetSlide.blocks.map((b: Block) => ({ ...b, id: generateId() })),
        };

        let newSlides = [...project.slides];
        if (insertAfterId) {
          const idx = newSlides.findIndex((s) => s.id === insertAfterId);
          if (idx >= 0) {
            newSlides.splice(idx + 1, 0, newSlide);
          } else {
            newSlides.push(newSlide);
          }
        } else {
          newSlides.push(newSlide);
        }

        newSlides = newSlides.map((s, i) => ({ ...s, order: i }));

        set({
          past: [...state.past, state.projects].slice(-MAX_HISTORY),
          future: [],
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  slides: newSlides,
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          currentSlideId: newSlide.id,
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
          selectedBlockIds: [block.id],
        });
      },

      addBlocks: (projectId, slideId, blocks) => {
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
                      ? { ...s, blocks: [...s.blocks, ...blocks] }
                      : s
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          selectedBlockIds: blocks.map((b) => b.id),
          selectedBlockId: blocks.length === 1 ? blocks[0].id : null,
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

      updateBlocks: (projectId, slideId, blockUpdates) => {
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
                          blocks: s.blocks.map((b) => {
                            const update = blockUpdates.find((u) => u.id === b.id);
                            return update ? ({ ...b, ...update.changes } as Block) : b;
                          }),
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
          selectedBlockIds: state.selectedBlockIds.filter((id) => id !== blockId),
        });
      },

      deleteBlocks: (projectId, slideId, blockIds) => {
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
                          blocks: s.blocks.filter((b) => !blockIds.includes(b.id)),
                        }
                      : s
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          selectedBlockIds: state.selectedBlockIds.filter((id) => !blockIds.includes(id)),
          selectedBlockId:
            state.selectedBlockId && blockIds.includes(state.selectedBlockId)
              ? null
              : state.selectedBlockId,
        });
      },

      setSelectedBlock: (id) => set({ selectedBlockId: id, selectedBlockIds: id ? [id] : [] }),
      toggleBlockSelection: (blockId) => set((state) => {
        const ids = state.selectedBlockIds;
        const exists = ids.includes(blockId);
        const newIds = exists ? ids.filter(id => id !== blockId) : [...ids, blockId];
        return { selectedBlockIds: newIds, selectedBlockId: newIds.length === 1 ? newIds[0] : newIds.length === 0 ? null : state.selectedBlockId };
      }),
      clearBlockSelection: () => set({ selectedBlockIds: [], selectedBlockId: null }),

      selectAllBlocks: (projectId, slideId) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        if (!project) return;
        const slide = project.slides.find((s) => s.id === slideId);
        if (!slide) return;

        const allIds = slide.blocks.map(b => b.id);
        set({
          selectedBlockIds: allIds,
          selectedBlockId: allIds.length === 1 ? allIds[0] : null,
        });
      },

      // ─── Duplicate Blocks ──────────────────────────────

      duplicateBlock: (projectId, slideId, blockId) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        if (!project) return;
        const slide = project.slides.find((s) => s.id === slideId);
        if (!slide) return;
        const block = slide.blocks.find((b) => b.id === blockId);
        if (!block) return;

        const newBlock: Block = {
          ...JSON.parse(JSON.stringify(block)),
          id: generateId(),
          x: Math.min(block.x + 20, 960 - block.width),
          y: Math.min(block.y + 20, 540 - block.height),
        };

        set({
          past: [...state.past, state.projects].slice(-MAX_HISTORY),
          future: [],
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  slides: p.slides.map((s) =>
                    s.id === slideId
                      ? { ...s, blocks: [...s.blocks, newBlock] }
                      : s
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          selectedBlockId: newBlock.id,
          selectedBlockIds: [newBlock.id],
        });
      },

      duplicateBlocks: (projectId, slideId, blockIds) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        if (!project) return;
        const slide = project.slides.find((s) => s.id === slideId);
        if (!slide) return;

        const blocksToDuplicate = slide.blocks.filter((b) => blockIds.includes(b.id));
        if (blocksToDuplicate.length === 0) return;

        const newBlocks: Block[] = blocksToDuplicate.map((block) => ({
          ...JSON.parse(JSON.stringify(block)),
          id: generateId(),
          x: Math.min(block.x + 20, 960 - block.width),
          y: Math.min(block.y + 20, 540 - block.height),
        }));

        set({
          past: [...state.past, state.projects].slice(-MAX_HISTORY),
          future: [],
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  slides: p.slides.map((s) =>
                    s.id === slideId
                      ? { ...s, blocks: [...s.blocks, ...newBlocks] }
                      : s
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          selectedBlockIds: newBlocks.map((b) => b.id),
          selectedBlockId: newBlocks.length === 1 ? newBlocks[0].id : null,
        });
      },

      // ─── Slide Transition & Notes ─────────────────────

      updateSlideTransition: (projectId, slideId, transition) => {
        const state = get();
        set({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  slides: p.slides.map((s) =>
                    s.id === slideId ? { ...s, transition } : s
                  ),
                }
              : p
          ),
        });
      },

      updateSlideNotes: (projectId, slideId, notes) => {
        const state = get();
        set({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  slides: p.slides.map((s) =>
                    s.id === slideId ? { ...s, notes } : s
                  ),
                }
              : p
          ),
        });
      },

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

      // ─── Zoom ───────────────────────────────────────────

      setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(200, zoom)) }),
      zoomIn: () => set((state) => ({ zoom: Math.min(200, state.zoom + 10) })),
      zoomOut: () => set((state) => ({ zoom: Math.max(25, state.zoom - 10) })),
      zoomFit: () => set({ zoom: 100 }),

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

      getSelectedBlocks: () => {
        const state = get();
        const project = state.projects.find(
          (p) => p.id === state.currentProjectId
        );
        if (!project) return [];
        const slide = project.slides.find(
          (s) => s.id === state.currentSlideId
        );
        if (!slide) return [];
        return slide.blocks.filter((b) => state.selectedBlockIds.includes(b.id));
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
        transition: "none",
        notes: "",
      },
    ],
    quizSettings: {
      passingScore: 70,
      showResults: true,
      allowRetry: true,
      maxAttempts: 3,
    },
    gamification: {
      enableXP: false,
      enableBadges: false,
      enableStreak: false,
      xpPerSlide: 5,
      xpPerCorrectAnswer: 15,
      badges: [
        { id: "complete", name: "Concluído", icon: "🎓", condition: "complete_course" },
        { id: "perfect", name: "Nota Máxima", icon: "⭐", condition: "perfect_score" },
        { id: "explorer", name: "Explorador", icon: "🧭", condition: "all_slides" },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

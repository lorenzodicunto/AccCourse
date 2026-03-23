import { create } from "zustand";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  customFontUrl: string | null;
  mode: "light" | "dark";
}

export type AnimationType = "none" | "fadeIn" | "fadeOut" | "slideLeft" | "slideRight" | "slideUp" | "slideDown" | "zoomIn" | "zoomOut" | "bounceIn" | "rotateIn" | "flipIn";
export type AnimationEasing = "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear";

export interface BlockAnimation {
  type: AnimationType;
  duration: number; // seconds
  delay: number; // seconds
  easing: AnimationEasing;
}

export interface BaseBlock {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  animation?: BlockAnimation;
}

export interface TextBlock extends BaseBlock {
  type: "text";
  content: string; // HTML (rich text) — sanitize with DOMPurify before rendering!
  fontSize: number;
  fontWeight: string;
  fontStyle: "normal" | "italic";
  textDecorationLine: "none" | "underline" | "line-through";
  color: string;
  textAlign: "left" | "center" | "right";
  lineHeight: number; // multiplier, e.g. 1.5
  letterSpacing: number; // px
  textShadow: string; // CSS text-shadow value
  backgroundColor: string; // block bg color (transparent = none)
  borderRadius: number; // px
  opacity: number; // 0–1
  listType: "none" | "ul" | "ol";
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  src: string;
  alt: string;
  objectFit: "cover" | "contain" | "fill";
  opacity: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  boxShadow: string;
}

export interface FlashcardBlock extends BaseBlock {
  type: "flashcard";
  frontContent: string;
  backContent: string;
  frontBg: string;
  backBg: string;
  frontColor: string;
  backColor: string;
  frontImage?: string;
  backImage?: string;
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
  pointsValue: number; // points awarded for correct answer
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

export type ShapeType = "rectangle" | "circle" | "rounded-rect" | "triangle" | "arrow" | "line" | "star";

export interface ShapeBlock extends BaseBlock {
  type: "shape";
  shapeType: ShapeType;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  rotation: number;
}

export interface AudioBlock extends BaseBlock {
  type: "audio";
  src: string;
  autoplay: boolean;
  loop: boolean;
  showControls: boolean;
}

// ─── Interactive Assessment Blocks ─────────────────────────────────────────

export interface TrueFalseBlock extends BaseBlock {
  type: "truefalse";
  statement: string;
  isTrue: boolean;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  pointsValue: number;
}

export interface MatchingBlock extends BaseBlock {
  type: "matching";
  pairs: { id: string; left: string; right: string }[];
  feedbackCorrect: string;
  feedbackIncorrect: string;
  pointsValue: number;
  shuffleRight: boolean;
}

export interface FillBlankBlock extends BaseBlock {
  type: "fillblank";
  segments: (
    | { type: "text"; content: string }
    | { type: "blank"; id: string; correctAnswer: string; acceptedVariants: string[] }
  )[];
  caseSensitive: boolean;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  pointsValue: number;
}

export interface SortingBlock extends BaseBlock {
  type: "sorting";
  items: { id: string; content: string }[];
  correctOrder: string[];
  feedbackCorrect: string;
  feedbackIncorrect: string;
  pointsValue: number;
}

export interface HotspotBlock extends BaseBlock {
  type: "hotspot";
  imageSrc: string;
  spots: {
    id: string;
    x: number;
    y: number;
    radius: number;
    label: string;
    content: string;
    isCorrect?: boolean;
  }[];
  mode: "explore" | "quiz";
  pointsValue: number;
}

// ─── Content Presentation Blocks ───────────────────────────────────────────

export interface AccordionBlock extends BaseBlock {
  type: "accordion";
  sections: { id: string; title: string; content: string }[];
  allowMultipleOpen: boolean;
  style: "minimal" | "boxed" | "bordered";
}

export interface TabsBlock extends BaseBlock {
  type: "tabs";
  tabs: { id: string; label: string; content: string; icon?: string }[];
  orientation: "horizontal" | "vertical";
  style: "underline" | "boxed" | "pills";
}

// ─── Advanced Blocks ───────────────────────────────────────────────────────

export interface BranchingBlock extends BaseBlock {
  type: "branching";
  scenario: string;
  choices: {
    id: string;
    text: string;
    targetSlideId: string;
    feedback: string;
    isCorrect?: boolean;
  }[];
  pointsValue: number;
}

export interface TimelineBlock extends BaseBlock {
  type: "timeline";
  events: {
    id: string;
    date: string;
    title: string;
    description: string;
    icon?: string;
  }[];
  orientation: "horizontal" | "vertical";
  style: "minimal" | "detailed" | "cards";
}

export interface DragDropBlock extends BaseBlock {
  type: "dragdrop";
  categories: { id: string; label: string }[];
  items: { id: string; content: string; correctCategoryId: string }[];
  feedbackCorrect: string;
  feedbackIncorrect: string;
  pointsValue: number;
}

export interface InteractiveVideoBlock extends BaseBlock {
  type: "interactiveVideo";
  src: string;
  poster: string;
  chapters: {
    id: string;
    time: number; // seconds
    title: string;
    description: string;
  }[];
  quizPoints: {
    id: string;
    time: number; // seconds — video pauses here
    question: string;
    options: string[];
    correctIndex: number;
    pointsValue: number;
  }[];
  bookmarks: {
    id: string;
    time: number;
    label: string;
  }[];
  autoplay: boolean;
  loop: boolean;
}

export type Block = TextBlock | ImageBlock | FlashcardBlock | QuizBlock | VideoBlock | ShapeBlock | AudioBlock | TrueFalseBlock | MatchingBlock | FillBlankBlock | SortingBlock | HotspotBlock | AccordionBlock | TabsBlock | BranchingBlock | TimelineBlock | DragDropBlock | InteractiveVideoBlock;

export type SlideTransition = "none" | "fade" | "slide" | "zoom";

export interface Slide {
  id: string;
  order: number;
  blocks: Block[];
  background: string;
  transition: SlideTransition;
  notes: string;
  narration?: string; // audio URL for slide narration
  duration?: number;  // estimated duration in seconds
}

export interface QuizSettings {
  passingScore: number; // percentage 0-100
  showResults: boolean;
  allowRetry: boolean;
  maxAttempts: number;
}

export interface GamificationSettings {
  enableXP: boolean;
  enableBadges: boolean;
  enableStreak: boolean;
  xpPerSlide: number;
  xpPerCorrectAnswer: number;
  badges: {
    id: string;
    name: string;
    icon: string;
    condition: "complete_course" | "perfect_score" | "fast_finish" | "all_slides";
  }[];
}

export interface CourseProject {
  id: string;
  title: string;
  description: string;
  thumbnail: string; // gradient CSS string
  theme: ThemeConfig;
  slides: Slide[];
  quizSettings: QuizSettings;
  gamification: GamificationSettings;
  createdAt: string;
  updatedAt: string;
}

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
  duplicateBlock: (
    projectId: string,
    slideId: string,
    blockId: string
  ) => void;
  setSelectedBlock: (id: string | null) => void;
  toggleBlockSelection: (blockId: string) => void;
  clearBlockSelection: () => void;

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

      setSelectedBlock: (id) => set({ selectedBlockId: id, selectedBlockIds: id ? [id] : [] }),
      toggleBlockSelection: (blockId) => set((state) => {
        const ids = state.selectedBlockIds;
        const exists = ids.includes(blockId);
        const newIds = exists ? ids.filter(id => id !== blockId) : [...ids, blockId];
        return { selectedBlockIds: newIds, selectedBlockId: newIds.length === 1 ? newIds[0] : newIds.length === 0 ? null : state.selectedBlockId };
      }),
      clearBlockSelection: () => set({ selectedBlockIds: [], selectedBlockId: null }),

      // ─── Duplicate Block ──────────────────────────────

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

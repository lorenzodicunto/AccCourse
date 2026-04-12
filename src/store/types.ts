// ─── Editor Store Types ─────────────────────────────────────────────────────
// Extracted from useEditorStore.ts for better code organization.
// All types are re-exported from useEditorStore.ts for backward compatibility.

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

export interface GameBlock extends BaseBlock {
  type: "game";
  gameType: "trivia" | "memory" | "words" | "swipe" | "alphabet";
  gameData: any; // TriviaGameData | MemoryGameData | WordsGameData | SwipeGameData | AlphabetGameData
  title: string;
}

// ─── Wave 6: New Content Blocks ───────────────────────────────────────────

export interface LabeledGraphicMarker {
  id: string;
  x: number;
  y: number;
  label: string;
  content: string;
  icon?: "pin" | "number" | "plus" | "info" | "star";
  image?: string;
}

export interface LabeledGraphicBlock extends BaseBlock {
  type: "labeled-graphic";
  backgroundImage: string;
  markers: LabeledGraphicMarker[];
  markerStyle: "pin" | "numbered" | "icon";
  markerColor: string;
  popupPosition: "auto" | "top" | "bottom" | "left" | "right";
  completionRule: "view-all" | "none";
}

export interface ProcessStep {
  id: string;
  title: string;
  content: string;
  image?: string;
  icon?: string;
}

export interface ProcessBlock extends BaseBlock {
  type: "process";
  steps: ProcessStep[];
  layout: "horizontal" | "vertical";
  style: "numbered" | "icon" | "minimal";
  connectorStyle: "line" | "arrow" | "dashed";
  activeColor: string;
  interactive: boolean;
}

export interface LightboxBlock extends BaseBlock {
  type: "lightbox";
  triggerType: "button" | "image";
  triggerLabel: string;
  triggerImage?: string;
  modalTitle: string;
  modalContent: string;
  modalImage?: string;
  modalVideo?: string;
  modalWidth: "small" | "medium" | "large";
  overlayColor: string;
}

export interface QuoteBlock extends BaseBlock {
  type: "quote";
  text: string;
  author: string;
  authorTitle?: string;
  authorImage?: string;
  quoteStyle: "classic" | "modern" | "callout" | "speech-bubble";
  accentColor: string;
  alignment: "left" | "center";
}

export interface DownloadFile {
  id: string;
  name: string;
  url: string;
  size: number;
  fileType: string;
  description?: string;
}

export interface DownloadBlock extends BaseBlock {
  type: "download";
  files: DownloadFile[];
  downloadStyle: "list" | "card" | "button";
  icon: "file" | "download" | "document";
}

export interface CounterItem {
  id: string;
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  icon?: string;
  color: string;
}

export interface CounterBlock extends BaseBlock {
  type: "counter";
  items: CounterItem[];
  layout: "row" | "grid";
  animationDuration: number;
  counterStyle: "card" | "minimal" | "circle";
}

export interface ButtonBlock extends BaseBlock {
  type: "button";
  label: string;
  action: "link" | "slide" | "download";
  url?: string;
  targetSlideIndex?: number;
  downloadUrl?: string;
  buttonStyle: "primary" | "secondary" | "outline" | "ghost";
  size: "small" | "medium" | "large";
  icon?: string;
  iconPosition: "left" | "right";
  fullWidth: boolean;
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
  dividerStyle: "solid" | "dashed" | "dotted" | "gradient";
  color: string;
  thickness: number;
}

export interface EmbedBlock extends BaseBlock {
  type: "embed";
  url: string;
  title: string;
  aspectRatio: "16:9" | "4:3" | "1:1";
  allowFullscreen: boolean;
}

// ─── Wave 7: Advanced Quiz Types ──────────────────────────────────────────

export interface LikertBlock extends BaseBlock {
  type: "likert";
  question: string;
  statements: { id: string; text: string }[];
  scale: { labels: string[]; values: number[] };
  required: boolean;
  points: number;
  expectedValues?: Record<string, number>;
}

export interface RankingBlock extends BaseBlock {
  type: "ranking";
  question: string;
  items: { id: string; text: string; correctPosition: number; image?: string }[];
  shuffleOnLoad: boolean;
  showNumbers: boolean;
  partialCredit: boolean;
  points: number;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export interface EssayBlock extends BaseBlock {
  type: "essay";
  question: string;
  placeholder: string;
  minWords?: number;
  maxWords?: number;
  showWordCount: boolean;
  rubric?: string;
  sampleAnswer?: string;
  autoGrade: boolean;
  points: number;
  feedbackAfterSubmit: string;
}

export interface NumericBlock extends BaseBlock {
  type: "numeric";
  question: string;
  correctAnswer: number;
  tolerance: number;
  unit?: string;
  decimalPlaces?: number;
  min?: number;
  max?: number;
  points: number;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  feedbackClose?: string;
}

export interface DropdownItem {
  id: string;
  text: string;
  options: string[];
  correctOption: string;
}

export interface DropdownBlock extends BaseBlock {
  type: "dropdown";
  question: string;
  items: DropdownItem[];
  points: number;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export interface MatrixRow { id: string; label: string }
export interface MatrixColumn { id: string; label: string }

export interface MatrixBlock extends BaseBlock {
  type: "matrix";
  question: string;
  rows: MatrixRow[];
  columns: MatrixColumn[];
  inputType: "radio" | "checkbox";
  correctAnswers: Record<string, string[]>;
  points: number;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export interface ImageChoice {
  id: string;
  image: string;
  label?: string;
  isCorrect: boolean;
}

export interface ImageChoiceBlock extends BaseBlock {
  type: "image-choice";
  question: string;
  choices: ImageChoice[];
  multiSelect: boolean;
  columns: 2 | 3 | 4;
  showLabels: boolean;
  points: number;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export type Block = TextBlock | ImageBlock | FlashcardBlock | QuizBlock | VideoBlock | ShapeBlock | AudioBlock | TrueFalseBlock | MatchingBlock | FillBlankBlock | SortingBlock | HotspotBlock | AccordionBlock | TabsBlock | BranchingBlock | TimelineBlock | DragDropBlock | InteractiveVideoBlock | GameBlock | LabeledGraphicBlock | ProcessBlock | LightboxBlock | QuoteBlock | DownloadBlock | CounterBlock | ButtonBlock | DividerBlock | EmbedBlock | LikertBlock | RankingBlock | EssayBlock | NumericBlock | DropdownBlock | MatrixBlock | ImageChoiceBlock;

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

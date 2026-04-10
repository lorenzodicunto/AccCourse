"use client";

import { useEditorStore, Block } from "@/store/useEditorStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RibbonGroup, RibbonButton } from "./RibbonGroup";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Download,
  GraduationCap,
  Loader2,
  Share2,
  Link,
  Check,
  CloudUpload,
  Type,
  Image,
  CreditCard,
  HelpCircle,
  Play,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Paintbrush,
  Monitor,
  Smartphone,
  Copy,
  Scissors,
  ClipboardPaste,
  Hexagon,
  Music,
  CheckCircle2,
  Link2,
  PenLine,
  ArrowUpDown,
  MousePointer,
  ChevronDown,
  PanelTop,
  GitBranch,
  Clock,
  GripVertical,
  Video,
  Layers,
  Strikethrough,
  List,
  ListOrdered,
  Minus,
  MessageSquare,
  Code,
  FileText,
  SlidersHorizontal,
  Zap,
  Eye,
  Grid3X3,
  Ruler,
  StickyNote,
  Globe,
  LayoutGrid,
  AlignJustify,
  ChevronRight,
  Sparkles,
  FileDown,
} from "lucide-react";
import { useState, useRef } from "react";
import { exportScormPackage } from "@/lib/scorm/packager";
import { shareCourse } from "@/actions/review";
import { saveCourse } from "@/actions/courses";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { AssetLibraryDialog } from "./AssetLibraryDialog";
import { SlideTemplatesDialog } from "./SlideTemplatesDialog";
import { AIQuizDialog } from "./AIQuizDialog";
import { AICourseDialog } from "./AICourseDialog";
import { ContrastChecker } from "./ContrastChecker";
import { ImportPPTXDialog } from "./ImportPPTXDialog";
import { PreviewDialog } from "./PreviewDialog";
import { CourseSettingsDialog } from "./CourseSettingsDialog";
import { SlideLayoutsDialog } from "./SlideLayoutsDialog";
import { exportAsPDF } from "@/lib/export/pdfExporter";

interface TopToolbarProps {
  courseId?: string;
  onToggleComponentLib?: () => void;
}

type RibbonTabId = "home" | "insert" | "interactions" | "design" | "export" | "tools";

const RIBBON_TABS: { id: RibbonTabId; label: string }[] = [
  { id: "home", label: "Início" },
  { id: "insert", label: "Inserir" },
  { id: "interactions", label: "Interações" },
  { id: "design", label: "Design" },
  { id: "export", label: "Exportar" },
  { id: "tools", label: "Ferramentas" },
];

const THEME_PRESETS = [
  { name: "Violet", primary: "#7c3aed", secondary: "#a78bfa", accent: "#ede9fe" },
  { name: "Indigo", primary: "#4f46e5", secondary: "#818cf8", accent: "#e0e7ff" },
  { name: "Blue", primary: "#2563eb", secondary: "#60a5fa", accent: "#dbeafe" },
  { name: "Sky", primary: "#0284c7", secondary: "#7dd3fc", accent: "#e0f2fe" },
  { name: "Teal", primary: "#0d9488", secondary: "#5eead4", accent: "#ccfbf1" },
  { name: "Emerald", primary: "#059669", secondary: "#6ee7b7", accent: "#d1fae5" },
  { name: "Amber", primary: "#d97706", secondary: "#fbbf24", accent: "#fef3c7" },
  { name: "Orange", primary: "#ea580c", secondary: "#fb923c", accent: "#ffedd5" },
  { name: "Rose", primary: "#e11d48", secondary: "#fb7185", accent: "#ffe4e6" },
  { name: "Pink", primary: "#db2777", secondary: "#f9a8d4", accent: "#fce7f3" },
  { name: "Slate", primary: "#475569", secondary: "#94a3b8", accent: "#f1f5f9" },
  { name: "Zinc", primary: "#3f3f46", secondary: "#a1a1aa", accent: "#f4f4f5" },
  { name: "Corporate Blue", primary: "#1e40af", secondary: "#3b82f6", accent: "#dbeafe" },
  { name: "Forest", primary: "#166534", secondary: "#22c55e", accent: "#dcfce7" },
];

const SLIDE_BG_PRESETS = [
  "#ffffff",
  "#f8fafc",
  "#f1f5f9",
  "#e2e8f0",
  "#1e293b",
  "#0f172a",
  "#fef2f2",
  "#f0fdf4",
  "#eff6ff",
  "#faf5ff",
  "#fdf4ff",
  "#fff7ed",
];

const FONT_OPTIONS = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Open Sans", value: "Open Sans, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" },
  { name: "Lato", value: "Lato, sans-serif" },
  { name: "Nunito", value: "Nunito, sans-serif" },
  { name: "Source Sans Pro", value: "Source Sans 3, sans-serif" },
  { name: "Playfair Display", value: "Playfair Display, serif" },
  { name: "Merriweather", value: "Merriweather, serif" },
];

const FONT_WEIGHT_OPTIONS = [
  { name: "Normal", value: "normal" },
  { name: "Medium", value: "500" },
  { name: "Semibold", value: "600" },
  { name: "Bold", value: "bold" },
];

const LINE_HEIGHT_OPTIONS = [
  { label: "1.0", value: "1.0" },
  { label: "1.25", value: "1.25" },
  { label: "1.5", value: "1.5" },
  { label: "1.75", value: "1.75" },
  { label: "2.0", value: "2.0" },
];

const TRANSITION_OPTIONS = [
  { label: "Nenhuma", value: "none" },
  { label: "Fade", value: "fade" },
  { label: "Slide", value: "slide" },
  { label: "Zoom", value: "zoom" },
  { label: "Flip", value: "flip" },
  { label: "Push", value: "push" },
];

const SLIDE_SIZE_PRESETS = [
  { name: "16:9", width: 960, height: 540 },
  { name: "4:3", width: 800, height: 600 },
  { name: "Quadrado", width: 600, height: 600 },
];

export function TopToolbar({ courseId, onToggleComponentLib }: TopToolbarProps) {
  const router = useRouter();
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const getCurrentSlide = useEditorStore((s) => s.getCurrentSlide);
  const getSelectedBlock = useEditorStore((s) => s.getSelectedBlock);
  const updateProject = useEditorStore((s) => s.updateProject);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const addBlock = useEditorStore((s) => s.addBlock);
  const deleteBlock = useEditorStore((s) => s.deleteBlock);
  const setSelectedBlock = useEditorStore((s) => s.setSelectedBlock);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const past = useEditorStore((s) => s.past);
  const future = useEditorStore((s) => s.future);
  const previewMode = useEditorStore((s) => s.previewMode);
  const setPreviewMode = useEditorStore((s) => s.setPreviewMode);
  const setTheme = useEditorStore((s) => s.setTheme);
  const updateSlideBackground = useEditorStore((s) => s.updateSlideBackground);

  const project = getCurrentProject();
  const slide = getCurrentSlide();
  const block = getSelectedBlock();

  // State for title editing
  const [activeTab, setActiveTab] = useState<RibbonTabId>("home");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  // New state for expanded toolbar features
  const [fontSizeValue, setFontSizeValue] = useState(block?.type === "text" ? block.fontSize : 18);
  const [fontColorValue, setFontColorValue] = useState(block?.type === "text" ? block.color : "#1a1a2e");
  const [slideTransition, setSlideTransition] = useState("none");
  const [slideWidth, setSlideWidth] = useState(960);
  const [slideHeight, setSlideHeight] = useState(540);
  const [zoom, setZoom] = useState(100);
  const [showHighContrast, setShowHighContrast] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  // Update font size and color when block selection changes
  const handleTitleClick = () => {
    if (project) {
      setTitleValue(project.title);
      setEditingTitle(true);
    }
  };

  const handleTitleBlur = () => {
    if (project && titleValue.trim()) {
      updateProject(project.id, { title: titleValue.trim() });
    }
    setEditingTitle(false);
  };

  const handleExport = async () => {
    if (!project || exporting) return;
    setExporting(true);
    toast.promise(exportScormPackage(project), {
      loading: "Empacotando SCORM... Aguarde.",
      success: "Curso exportado com sucesso! Download iniciado.",
      error: "Erro ao exportar o pacote SCORM.",
    });
    setTimeout(() => setExporting(false), 1500);
  };

  const handleExportHTML5 = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => resolve(true), 500);
      }),
      {
        loading: "Preparando exportação HTML5...",
        success: "Exportação HTML5 em breve — recursos de desenvolvimento em progresso.",
        error: "Erro ao preparar exportação.",
      }
    );
  };

  const handleExportXAPI = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => resolve(true), 500);
      }),
      {
        loading: "Preparando exportação xAPI...",
        success: "Exportação xAPI em breve — recursos de desenvolvimento em progresso.",
        error: "Erro ao preparar exportação.",
      }
    );
  };

  const handlePublicLink = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => resolve(true), 500);
      }),
      {
        loading: "Gerando link público...",
        success: "Link público em breve — recursos de desenvolvimento em progresso.",
        error: "Erro ao gerar link.",
      }
    );
  };

  const handleShare = async () => {
    if (!project || sharing) return;
    setSharing(true);
    try {
      const courseData = JSON.stringify(project);
      const result = await shareCourse(project.title, courseData);
      const link = `${window.location.origin}/review/${result.id}`;
      setShareLink(link);
      setShareDialogOpen(true);
      toast.success("Link de revisão gerado com sucesso!");
    } catch {
      toast.error("Erro ao compartilhar o curso para revisão.");
    } finally {
      setSharing(false);
    }
  };

  const handleSaveToCloud = async () => {
    if (!project || !courseId || saving) return;
    setSaving(true);
    try {
      const courseData = JSON.stringify(project);
      await saveCourse(courseId, courseData, {
        title: project.title,
        description: project.description,
        thumbnail: project.thumbnail,
      });
      toast.success("Curso salvo na nuvem com sucesso!");
    } catch {
      toast.error("Erro ao salvar na nuvem.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddBlock = (type: Block["type"]) => {
    if (!project || !slide) return;
    const baseBlock = {
      id: crypto.randomUUID(),
      x: 80 + Math.random() * 200,
      y: 60 + Math.random() * 100,
      zIndex: 0,
    };

    let newBlock: Block;
    switch (type) {
      case "text":
        newBlock = {
          ...baseBlock,
          type: "text",
          width: 300,
          height: 40,
          content: "Digite seu texto...",
          fontSize: 18,
          fontWeight: "normal",
          fontStyle: "normal",
          textDecorationLine: "none",
          color: "#1a1a2e",
          textAlign: "left",
          lineHeight: 1.5,
          letterSpacing: 0,
          textShadow: "none",
          backgroundColor: "transparent",
          borderRadius: 0,
          opacity: 1,
          listType: "none",
        };
        break;
      case "image":
        newBlock = {
          ...baseBlock,
          type: "image",
          width: 300,
          height: 200,
          src: "",
          alt: "Imagem",
          objectFit: "cover",
          opacity: 1,
          borderRadius: 12,
          borderWidth: 0,
          borderColor: "#e2e8f0",
          boxShadow: "none",
        };
        break;
      case "flashcard":
        newBlock = {
          ...baseBlock,
          type: "flashcard",
          width: 320,
          height: 200,
          frontContent: "Frente do Flashcard",
          backContent: "Verso do Flashcard",
          frontBg: "#7c3aed",
          backBg: "#4f46e5",
          frontColor: "#ffffff",
          backColor: "#ffffff",
        };
        break;
      case "quiz":
        newBlock = {
          ...baseBlock,
          type: "quiz",
          width: 450,
          height: 280,
          question: "Qual é a resposta correta?",
          options: [
            { id: crypto.randomUUID(), text: "Opção A", isCorrect: true },
            { id: crypto.randomUUID(), text: "Opção B", isCorrect: false },
            { id: crypto.randomUUID(), text: "Opção C", isCorrect: false },
          ],
          feedback: {
            correct: "Parabéns! Resposta correta!",
            incorrect: "Tente novamente.",
          },
          pointsValue: 10,
        };
        break;
      case "video":
        newBlock = {
          ...baseBlock,
          type: "video",
          width: 480,
          height: 270,
          url: "",
          interactions: [],
        };
        break;
      case "shape":
        newBlock = {
          ...baseBlock,
          type: "shape",
          width: 200,
          height: 200,
          shapeType: "rectangle",
          fillColor: "#7c3aed",
          strokeColor: "#4f46e5",
          strokeWidth: 2,
          opacity: 1,
          rotation: 0,
        };
        break;
      case "audio":
        newBlock = {
          ...baseBlock,
          type: "audio",
          width: 300,
          height: 60,
          src: "",
          autoplay: false,
          loop: false,
          showControls: true,
        };
        break;
      case "truefalse":
        newBlock = {
          ...baseBlock,
          type: "truefalse",
          width: 600,
          height: 200,
          statement: "O céu é azul.",
          isTrue: true,
          feedbackCorrect: "Correto! ✅",
          feedbackIncorrect: "Incorreto! ❌",
          pointsValue: 10,
        };
        break;
      case "matching":
        newBlock = {
          ...baseBlock,
          type: "matching",
          width: 700,
          height: 350,
          pairs: [
            { id: crypto.randomUUID(), left: "Item A", right: "Definição 1" },
            { id: crypto.randomUUID(), left: "Item B", right: "Definição 2" },
            { id: crypto.randomUUID(), left: "Item C", right: "Definição 3" },
          ],
          feedbackCorrect: "Todas as conexões estão corretas! ✅",
          feedbackIncorrect: "Algumas conexões estão incorretas. ❌",
          pointsValue: 10,
          shuffleRight: true,
        };
        break;
      case "fillblank":
        newBlock = {
          ...baseBlock,
          type: "fillblank",
          width: 700,
          height: 200,
          segments: [
            { type: "text", content: "O Brasil foi descoberto em " },
            { type: "blank", id: crypto.randomUUID(), correctAnswer: "1500", acceptedVariants: ["1.500"] },
            { type: "text", content: " por " },
            { type: "blank", id: crypto.randomUUID(), correctAnswer: "Pedro Álvares Cabral", acceptedVariants: ["Cabral", "Pedro Cabral"] },
            { type: "text", content: "." },
          ],
          caseSensitive: false,
          feedbackCorrect: "Correto! ✅",
          feedbackIncorrect: "Tente novamente! ❌",
          pointsValue: 10,
        };
        break;
      case "sorting":
        newBlock = {
          ...baseBlock,
          type: "sorting",
          width: 500,
          height: 350,
          items: [
            { id: "s1", content: "Primeiro passo" },
            { id: "s2", content: "Segundo passo" },
            { id: "s3", content: "Terceiro passo" },
          ],
          correctOrder: ["s1", "s2", "s3"],
          feedbackCorrect: "Ordem correta! ✅",
          feedbackIncorrect: "Ordem incorreta. ❌",
          pointsValue: 10,
        };
        break;
      case "hotspot":
        newBlock = {
          ...baseBlock,
          type: "hotspot",
          width: 600,
          height: 400,
          imageSrc: "",
          spots: [
            { id: crypto.randomUUID(), x: 30, y: 40, radius: 8, label: "Ponto 1", content: "Descrição do ponto 1", isCorrect: true },
            { id: crypto.randomUUID(), x: 70, y: 60, radius: 8, label: "Ponto 2", content: "Descrição do ponto 2", isCorrect: false },
          ],
          mode: "explore",
          pointsValue: 10,
        };
        break;
      case "accordion":
        newBlock = {
          ...baseBlock,
          type: "accordion",
          width: 600,
          height: 350,
          sections: [
            { id: crypto.randomUUID(), title: "Seção 1", content: "Conteúdo da primeira seção." },
            { id: crypto.randomUUID(), title: "Seção 2", content: "Conteúdo da segunda seção." },
            { id: crypto.randomUUID(), title: "Seção 3", content: "Conteúdo da terceira seção." },
          ],
          allowMultipleOpen: false,
          style: "boxed",
        };
        break;
      case "tabs":
        newBlock = {
          ...baseBlock,
          type: "tabs",
          width: 700,
          height: 350,
          tabs: [
            { id: crypto.randomUUID(), label: "Tab 1", content: "Conteúdo da primeira aba." },
            { id: crypto.randomUUID(), label: "Tab 2", content: "Conteúdo da segunda aba." },
            { id: crypto.randomUUID(), label: "Tab 3", content: "Conteúdo da terceira aba." },
          ],
          orientation: "horizontal",
          style: "underline",
        };
        break;
      case "branching":
        newBlock = {
          ...baseBlock,
          type: "branching",
          width: 700,
          height: 350,
          scenario: "O colaborador encontra um cliente insatisfeito. O que ele deve fazer?",
          choices: [
            { id: crypto.randomUUID(), text: "Ouvir o cliente com empatia", targetSlideId: "", feedback: "Excelente! Ouvir com empatia é o primeiro passo.", isCorrect: true },
            { id: crypto.randomUUID(), text: "Transferir para o supervisor", targetSlideId: "", feedback: "Transferir sem ouvir pode piorar a situação.", isCorrect: false },
            { id: crypto.randomUUID(), text: "Ignorar a reclamação", targetSlideId: "", feedback: "Ignorar um cliente nunca é a resposta correta.", isCorrect: false },
          ],
          pointsValue: 10,
        };
        break;
      case "timeline":
        newBlock = {
          ...baseBlock,
          type: "timeline",
          width: 800,
          height: 200,
          events: [
            { id: crypto.randomUUID(), date: "2020", title: "Fundação", description: "Início das operações", icon: "🏢" },
            { id: crypto.randomUUID(), date: "2022", title: "Expansão", description: "Abertura de novas filiais", icon: "📈" },
            { id: crypto.randomUUID(), date: "2024", title: "Inovação", description: "Lançamento de novos produtos", icon: "🚀" },
          ],
          orientation: "horizontal",
          style: "detailed",
        };
        break;
      case "dragdrop":
        newBlock = {
          ...baseBlock,
          type: "dragdrop",
          width: 700,
          height: 350,
          categories: [
            { id: crypto.randomUUID(), label: "Categoria A" },
            { id: crypto.randomUUID(), label: "Categoria B" },
          ],
          items: [
            { id: crypto.randomUUID(), content: "Item 1", correctCategoryId: "" },
            { id: crypto.randomUUID(), content: "Item 2", correctCategoryId: "" },
            { id: crypto.randomUUID(), content: "Item 3", correctCategoryId: "" },
          ],
          feedbackCorrect: "Parabéns! Todos os itens estão corretos! 🎉",
          feedbackIncorrect: "Alguns itens estão no lugar errado. Tente novamente!",
          pointsValue: 10,
        };
        break;
      case "interactiveVideo":
        newBlock = {
          ...baseBlock,
          type: "interactiveVideo",
          width: 640,
          height: 360,
          src: "",
          poster: "",
          chapters: [],
          quizPoints: [],
          bookmarks: [],
          autoplay: false,
          loop: false,
        };
        break;
      default:
        return;
    }

    addBlock(project.id, slide.id, newBlock);
    setSelectedBlock(newBlock.id);
    toast.success(`${type} adicionado com sucesso!`);
  };

  // Helper to create special blocks using existing text/shape blocks
  const handleAddSpecialBlock = (specialType: "titulo" | "legenda" | "divisor" | "callout" | "embed") => {
    if (!project || !slide) return;
    const baseBlock = {
      id: crypto.randomUUID(),
      x: 80 + Math.random() * 200,
      y: 60 + Math.random() * 100,
      zIndex: 0,
    };

    let newBlock: Block;
    switch (specialType) {
      case "titulo":
        newBlock = {
          ...baseBlock,
          type: "text",
          width: 500,
          height: 60,
          content: "Título do Slide",
          fontSize: 32,
          fontWeight: "bold",
          fontStyle: "normal",
          textDecorationLine: "none",
          color: "#1a1a2e",
          textAlign: "left",
          lineHeight: 1.2,
          letterSpacing: 0,
          textShadow: "none",
          backgroundColor: "transparent",
          borderRadius: 0,
          opacity: 1,
          listType: "none",
        };
        break;
      case "legenda":
        newBlock = {
          ...baseBlock,
          type: "text",
          width: 400,
          height: 30,
          content: "Legenda explicativa",
          fontSize: 13,
          fontWeight: "normal",
          fontStyle: "normal",
          textDecorationLine: "none",
          color: "#6b7280",
          textAlign: "left",
          lineHeight: 1.4,
          letterSpacing: 0,
          textShadow: "none",
          backgroundColor: "transparent",
          borderRadius: 0,
          opacity: 1,
          listType: "none",
        };
        break;
      case "divisor":
        newBlock = {
          ...baseBlock,
          type: "shape",
          width: 600,
          height: 4,
          shapeType: "line",
          fillColor: "#e2e8f0",
          strokeColor: "#cbd5e1",
          strokeWidth: 2,
          opacity: 1,
          rotation: 0,
        };
        break;
      case "callout":
        newBlock = {
          ...baseBlock,
          type: "text",
          width: 500,
          height: 100,
          content: "💡 Nota importante...",
          fontSize: 14,
          fontWeight: "normal",
          fontStyle: "normal",
          textDecorationLine: "none",
          color: "#1e40af",
          textAlign: "left",
          lineHeight: 1.5,
          letterSpacing: 0,
          textShadow: "none",
          backgroundColor: "#EFF6FF",
          borderRadius: 8,
          opacity: 1,
          listType: "none",
        };
        break;
      case "embed":
        newBlock = {
          ...baseBlock,
          type: "text",
          width: 600,
          height: 400,
          content: "[Embed] Cole a URL aqui",
          fontSize: 14,
          fontWeight: "normal",
          fontStyle: "normal",
          textDecorationLine: "none",
          color: "#475569",
          textAlign: "center",
          lineHeight: 1.5,
          letterSpacing: 0,
          textShadow: "none",
          backgroundColor: "#f8fafc",
          borderRadius: 12,
          opacity: 1,
          listType: "none",
        };
        break;
    }

    addBlock(project.id, slide.id, newBlock);
    setSelectedBlock(newBlock.id);
    toast.success(`${specialType} adicionado com sucesso!`);
  };

  // Text formatting helpers (when a text block is selected)
  const handleTextFormat = (prop: string, value: string | number) => {
    if (!project || !slide || !block || block.type !== "text") return;
    updateBlock(project.id, slide.id, block.id, {
      [prop]: value,
    } as Partial<Block>);
  };

  // Clipboard helpers
  const clipboardRef = useRef<Block | null>(null);

  const handleCopy = () => {
    if (!block) return;
    clipboardRef.current = JSON.parse(JSON.stringify(block));
    toast.success("Bloco copiado!");
  };

  const handleCut = () => {
    if (!project || !slide || !block) return;
    clipboardRef.current = JSON.parse(JSON.stringify(block));
    deleteBlock(project.id, slide.id, block.id);
    toast.success("Bloco recortado!");
  };

  const handlePaste = () => {
    if (!project || !slide || !clipboardRef.current) return;
    const newBlock: Block = {
      ...clipboardRef.current,
      id: crypto.randomUUID(),
      x: Math.min(clipboardRef.current.x + 20, 960 - clipboardRef.current.width),
      y: Math.min(clipboardRef.current.y + 20, 540 - clipboardRef.current.height),
    };
    addBlock(project.id, slide.id, newBlock);
    setSelectedBlock(newBlock.id);
    toast.success("Bloco colado!");
  };

  return (
    <>
      {/* Title Bar — Above the Ribbon */}
      <div className="h-10 bg-white border-b border-slate-200 flex items-center justify-between px-3 flex-shrink-0">
        {/* Left: Back + Logo + Title */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg h-7 w-7 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            onClick={() => router.push("/")}
            title="Voltar ao Dashboard"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-6 w-6 rounded-md bg-primary/10">
              <GraduationCap className="h-3 w-3 text-primary" />
            </div>
            {editingTitle ? (
              <input
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
                className="text-sm font-semibold bg-transparent border-b-2 border-primary outline-none py-0.5 px-1 min-w-[200px] text-slate-900"
                autoFocus
              />
            ) : (
              <button
                onClick={handleTitleClick}
                className="text-sm font-semibold text-slate-900 hover:text-purple-600 transition-colors cursor-pointer"
              >
                {project?.title ?? "Sem título"}
              </button>
            )}
          </div>
        </div>

        {/* Center: Quick Actions */}
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<Undo2 className="h-3.5 w-3.5" />}
            onClick={undo}
            disabled={past.length === 0}
            title="Desfazer (Ctrl+Z)"
          />
          <RibbonButton
            icon={<Redo2 className="h-3.5 w-3.5" />}
            onClick={redo}
            disabled={future.length === 0}
            title="Refazer (Ctrl+Y)"
          />
        </div>

        {/* Right: Save */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 rounded-lg text-xs h-7 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
            onClick={handleSaveToCloud}
            disabled={saving || !project}
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CloudUpload className="h-3.5 w-3.5" />
            )}
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Ribbon Tabs */}
      <div className="bg-white border-b border-slate-200 flex-shrink-0">
        {/* Tab Headers */}
        <div role="tablist" className="flex items-center gap-0 px-3 border-b border-slate-200">
          {RIBBON_TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-1.5 text-xs font-medium transition-all relative",
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {/* ─── HOME TAB PANEL ─── */}
        {activeTab === "home" && (
          <div role="tabpanel" id="tabpanel-home" className="flex items-stretch px-2 py-1.5 min-h-[66px] bg-slate-50 border-b border-slate-200 overflow-x-auto">
            <>
              <RibbonGroup label="Área de Transferência">
                <RibbonButton
                  icon={<ClipboardPaste className="h-4 w-4" />}
                  label="Colar"
                  variant="large"
                  onClick={handlePaste}
                  disabled={!clipboardRef.current}
                />
                <div className="flex flex-col gap-0.5">
                  <RibbonButton
                    icon={<Scissors className="h-3.5 w-3.5" />}
                    title="Recortar"
                    onClick={handleCut}
                    disabled={!block}
                  />
                  <RibbonButton
                    icon={<Copy className="h-3.5 w-3.5" />}
                    title="Copiar"
                    onClick={handleCopy}
                    disabled={!block}
                  />
                </div>
              </RibbonGroup>

              <RibbonGroup label="Fonte">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-0.5">
                    <RibbonButton
                      icon={<Bold className="h-3.5 w-3.5" />}
                      onClick={() => handleTextFormat("fontWeight", block?.type === "text" && block.fontWeight === "bold" ? "normal" : "bold")}
                      active={block?.type === "text" && block.fontWeight === "bold"}
                      disabled={!block || block.type !== "text"}
                      title="Negrito"
                    />
                    <RibbonButton
                      icon={<Italic className="h-3.5 w-3.5" />}
                      onClick={() => handleTextFormat("fontStyle", block?.type === "text" && block.fontStyle === "italic" ? "normal" : "italic")}
                      active={block?.type === "text" && block.fontStyle === "italic"}
                      disabled={!block || block.type !== "text"}
                      title="Itálico"
                    />
                    <RibbonButton
                      icon={<Underline className="h-3.5 w-3.5" />}
                      onClick={() => handleTextFormat("textDecorationLine", block?.type === "text" && block.textDecorationLine === "underline" ? "none" : "underline")}
                      active={block?.type === "text" && block.textDecorationLine === "underline"}
                      disabled={!block || block.type !== "text"}
                      title="Sublinhado"
                    />
                    <RibbonButton
                      icon={<Strikethrough className="h-3.5 w-3.5" />}
                      onClick={() => handleTextFormat("textDecorationLine", block?.type === "text" && block.textDecorationLine === "line-through" ? "none" : "line-through")}
                      active={block?.type === "text" && block.textDecorationLine === "line-through"}
                      disabled={!block || block.type !== "text"}
                      title="Tachado"
                    />
                  </div>
                  <div className="flex items-center gap-0.5">
                    <RibbonButton
                      icon={<AlignLeft className="h-3.5 w-3.5" />}
                      onClick={() => handleTextFormat("textAlign", "left")}
                      active={block?.type === "text" && block.textAlign === "left"}
                      disabled={!block || block.type !== "text"}
                      title="Alinhar à Esquerda"
                    />
                    <RibbonButton
                      icon={<AlignCenter className="h-3.5 w-3.5" />}
                      onClick={() => handleTextFormat("textAlign", "center")}
                      active={block?.type === "text" && block.textAlign === "center"}
                      disabled={!block || block.type !== "text"}
                      title="Centralizar"
                    />
                    <RibbonButton
                      icon={<AlignRight className="h-3.5 w-3.5" />}
                      onClick={() => handleTextFormat("textAlign", "right")}
                      active={block?.type === "text" && block.textAlign === "right"}
                      disabled={!block || block.type !== "text"}
                      title="Alinhar à Direita"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="8"
                      max="120"
                      value={block?.type === "text" ? block.fontSize : 18}
                      onChange={(e) => handleTextFormat("fontSize", parseInt(e.target.value) || 18)}
                      disabled={!block || block.type !== "text"}
                      className="h-6 w-12 px-2 text-xs rounded border border-slate-200 bg-white text-slate-900 font-medium"
                      title="Tamanho da Fonte"
                    />
                    <input
                      type="color"
                      value={block?.type === "text" ? block.color : "#1a1a2e"}
                      onChange={(e) => handleTextFormat("color", e.target.value)}
                      disabled={!block || block.type !== "text"}
                      className="w-6 h-6 rounded border border-slate-200 cursor-pointer"
                      title="Cor do Texto"
                    />
                  </div>
                </div>
              </RibbonGroup>

              <RibbonGroup label="Parágrafo">
                <div className="flex flex-col gap-1">
                  <select
                    value={block?.type === "text" ? block.lineHeight : "1.5"}
                    onChange={(e) => handleTextFormat("lineHeight", parseFloat(e.target.value))}
                    disabled={!block || block.type !== "text"}
                    className="h-6 px-2 text-xs rounded border border-slate-200 bg-white text-slate-900 font-medium"
                    title="Espaçamento Entre Linhas"
                  >
                    {LINE_HEIGHT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        Espaço: {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-0.5">
                    <RibbonButton
                      icon={<List className="h-3.5 w-3.5" />}
                      onClick={() => handleTextFormat("listType", block?.type === "text" && block.listType === "ul" ? "none" : "ul")}
                      active={block?.type === "text" && block.listType === "ul"}
                      disabled={!block || block.type !== "text"}
                      title="Marcadores"
                    />
                    <RibbonButton
                      icon={<ListOrdered className="h-3.5 w-3.5" />}
                      onClick={() => handleTextFormat("listType", block?.type === "text" && block.listType === "ol" ? "none" : "ol")}
                      active={block?.type === "text" && block.listType === "ol"}
                      disabled={!block || block.type !== "text"}
                      title="Numeração"
                    />
                  </div>
                </div>
              </RibbonGroup>

              <RibbonGroup label="Visualização">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
                    <RibbonButton
                      icon={<Monitor className="h-3.5 w-3.5" />}
                      onClick={() => setPreviewMode("desktop")}
                      active={previewMode === "desktop"}
                      title="Desktop"
                    />
                    <RibbonButton
                      icon={<Smartphone className="h-3.5 w-3.5" />}
                      onClick={() => setPreviewMode("mobile")}
                      active={previewMode === "mobile"}
                      title="Mobile"
                    />
                  </div>
                  <div className="flex items-center gap-1 px-2">
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={zoom}
                      onChange={(e) => setZoom(parseInt(e.target.value))}
                      className="h-2 w-20 rounded-lg appearance-none bg-slate-200 cursor-pointer"
                      title="Zoom"
                    />
                    <span className="text-xs font-medium text-slate-600 w-10">{zoom}%</span>
                  </div>
                </div>
              </RibbonGroup>
            </>
          </div>
        )}

        {/* ─── INSERT TAB PANEL ─── */}
        {activeTab === "insert" && (
          <div role="tabpanel" id="tabpanel-insert" className="flex items-stretch px-2 py-1.5 min-h-[66px] bg-slate-50 border-b border-slate-200 overflow-x-auto">
            <>
              <RibbonGroup label="Biblioteca">
                <RibbonButton
                  icon={<Layers className="h-5 w-5" />}
                  label="Componentes"
                  variant="large"
                  onClick={() => onToggleComponentLib?.()}
                />
              </RibbonGroup>

              <RibbonGroup label="Texto">
                <RibbonButton
                  icon={<Type className="h-5 w-5" />}
                  label="Texto"
                  variant="large"
                  onClick={() => handleAddBlock("text")}
                />
                <RibbonButton
                  icon={<FileText className="h-5 w-5" />}
                  label="Título"
                  variant="large"
                  onClick={() => handleAddSpecialBlock("titulo")}
                  title="Texto grande e em negrito"
                />
                <RibbonButton
                  icon={<Type className="h-4 w-4" />}
                  label="Legenda"
                  variant="large"
                  onClick={() => handleAddSpecialBlock("legenda")}
                  title="Texto pequeno e cinzento"
                />
              </RibbonGroup>

              <RibbonGroup label="Mídia">
                <RibbonButton
                  icon={<Image className="h-5 w-5" />}
                  label="Imagem"
                  variant="large"
                  onClick={() => handleAddBlock("image")}
                />
                <RibbonButton
                  icon={<Play className="h-5 w-5" />}
                  label="Vídeo"
                  variant="large"
                  onClick={() => handleAddBlock("video")}
                />
                <RibbonButton
                  icon={<Music className="h-5 w-5" />}
                  label="Áudio"
                  variant="large"
                  onClick={() => handleAddBlock("audio")}
                />
              </RibbonGroup>

              <RibbonGroup label="Conteúdo">
                <RibbonButton
                  icon={<CreditCard className="h-5 w-5" />}
                  label="Flashcard"
                  variant="large"
                  onClick={() => handleAddBlock("flashcard")}
                />
                <RibbonButton
                  icon={<HelpCircle className="h-5 w-5" />}
                  label="Quiz"
                  variant="large"
                  onClick={() => handleAddBlock("quiz")}
                />
                <RibbonButton
                  icon={<Hexagon className="h-5 w-5" />}
                  label="Forma"
                  variant="large"
                  onClick={() => handleAddBlock("shape")}
                />
                <RibbonButton
                  icon={<Minus className="h-5 w-5" />}
                  label="Divisor"
                  variant="large"
                  onClick={() => handleAddSpecialBlock("divisor")}
                  title="Linha horizontal"
                />
                <RibbonButton
                  icon={<MessageSquare className="h-5 w-5" />}
                  label="Callout"
                  variant="large"
                  onClick={() => handleAddSpecialBlock("callout")}
                  title="Caixa de nota destacada"
                />
                <RibbonButton
                  icon={<Code className="h-5 w-5" />}
                  label="Embed"
                  variant="large"
                  onClick={() => handleAddSpecialBlock("embed")}
                  title="Incorporar conteúdo externo"
                />
              </RibbonGroup>
            </>
          </div>
        )}

        {/* ─── INTERACTIONS TAB PANEL ─── */}
        {activeTab === "interactions" && (
          <div role="tabpanel" id="tabpanel-interactions" className="flex items-stretch px-2 py-1.5 min-h-[66px] bg-slate-50 border-b border-slate-200 overflow-x-auto">
            <>
              <RibbonGroup label="Avaliações">
                <RibbonButton
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  label="V ou F"
                  variant="large"
                  onClick={() => handleAddBlock("truefalse")}
                  title="Verdadeiro ou Falso — Avaliação binária simples"
                />
                <RibbonButton
                  icon={<Link2 className="h-5 w-5" />}
                  label="Liga Pontos"
                  variant="large"
                  onClick={() => handleAddBlock("matching")}
                  title="Liga Pontos — Conecte itens correspondentes"
                />
                <RibbonButton
                  icon={<PenLine className="h-5 w-5" />}
                  label="Lacunas"
                  variant="large"
                  onClick={() => handleAddBlock("fillblank")}
                  title="Preencher Lacunas — Complete o texto com palavras"
                />
                <RibbonButton
                  icon={<ArrowUpDown className="h-5 w-5" />}
                  label="Ordenação"
                  variant="large"
                  onClick={() => handleAddBlock("sorting")}
                  title="Ordenação — Coloque os itens na sequência correta"
                />
                <RibbonButton
                  icon={<MousePointer className="h-5 w-5" />}
                  label="Hotspot"
                  variant="large"
                  onClick={() => handleAddBlock("hotspot")}
                  title="Hotspot — Clique nas áreas sensíveis da imagem"
                />
              </RibbonGroup>

              <RibbonGroup label="Apresentação">
                <RibbonButton
                  icon={<ChevronDown className="h-5 w-5" />}
                  label="Accordion"
                  variant="large"
                  onClick={() => handleAddBlock("accordion")}
                  title="Accordion — Seções expansíveis e contraíveis"
                />
                <RibbonButton
                  icon={<PanelTop className="h-5 w-5" />}
                  label="Tabs"
                  variant="large"
                  onClick={() => handleAddBlock("tabs")}
                  title="Abas — Alterne entre diferentes conteúdos"
                />
              </RibbonGroup>

              <RibbonGroup label="Cenários & Gamificação">
                <RibbonButton
                  icon={<GitBranch className="h-5 w-5" />}
                  label="Branching"
                  variant="large"
                  onClick={() => handleAddBlock("branching")}
                  title="Branching — Caminhos condicionais baseados em respostas"
                />
                <RibbonButton
                  icon={<Clock className="h-5 w-5" />}
                  label="Timeline"
                  variant="large"
                  onClick={() => handleAddBlock("timeline")}
                  title="Timeline — Apresente eventos em sequência temporal"
                />
                <RibbonButton
                  icon={<GripVertical className="h-5 w-5" />}
                  label="Drag & Drop"
                  variant="large"
                  onClick={() => handleAddBlock("dragdrop")}
                  title="Arrastar e Soltar — Coloque itens nos locais corretos"
                />
                <RibbonButton
                  icon={<Video className="h-5 w-5" />}
                  label="Vídeo Int."
                  variant="large"
                  onClick={() => handleAddBlock("interactiveVideo")}
                  title="Vídeo Interativo — Vídeo com questões e pontos de ação"
                />
              </RibbonGroup>
            </>
          </div>
        )}

        {/* ─── DESIGN TAB PANEL ─── */}
        {activeTab === "design" && (
          <div role="tabpanel" id="tabpanel-design" className="flex items-stretch px-2 py-1.5 min-h-[66px] bg-slate-50 border-b border-slate-200 overflow-x-auto">
            <>
              <RibbonGroup label="Slides">
                <SlideLayoutsDialog />
                <SlideTemplatesDialog />
              </RibbonGroup>

              <RibbonGroup label="Transições">
                <select
                  value={slideTransition}
                  onChange={(e) => setSlideTransition(e.target.value)}
                  className="h-7 px-3 text-xs rounded-md border-2 border-slate-200 bg-white text-slate-900 font-medium hover:border-slate-300 focus:border-slate-600 focus:outline-none"
                  title="Transição do Slide"
                >
                  {TRANSITION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </RibbonGroup>

              <RibbonGroup label="Tema">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {THEME_PRESETS.map((preset) => (
                      <div key={preset.name} className="flex flex-col items-center">
                        <button
                          onClick={() =>
                            project &&
                            setTheme(project.id, {
                              primaryColor: preset.primary,
                              secondaryColor: preset.secondary,
                            })
                          }
                          className={cn(
                            "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 shadow-sm cursor-pointer",
                            project?.theme.primaryColor === preset.primary
                              ? "border-slate-900 scale-110 ring-2 ring-slate-600/30"
                              : "border-slate-200"
                          )}
                          style={{ backgroundColor: preset.primary }}
                          title={preset.name}
                        />
                        <span className="text-slate-600 text-[9px] mt-1 font-medium">
                          {preset.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <Palette className="h-3.5 w-3.5 text-slate-600" />
                    <span className="text-slate-600 text-[9px] uppercase tracking-wide font-semibold">
                      Personalizado
                    </span>
                    <input
                      type="color"
                      value={project?.theme.primaryColor ?? "#7c3aed"}
                      onChange={(e) =>
                        project &&
                        setTheme(project.id, { primaryColor: e.target.value })
                      }
                      className="w-6 h-6 rounded-md border border-slate-200 cursor-pointer"
                      title="Cor personalizada"
                    />
                  </div>
                </div>
              </RibbonGroup>

              <RibbonGroup label="Fundo do Slide">
                <div className="flex items-center gap-2">
                  <div className="flex flex-wrap gap-2">
                    {SLIDE_BG_PRESETS.map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          project &&
                          slide &&
                          updateSlideBackground(project.id, slide.id, color)
                        }
                        className={cn(
                          "w-6 h-6 rounded border-2 transition-all hover:scale-110 cursor-pointer shadow-sm",
                          slide?.background === color
                            ? "border-slate-900 ring-1 ring-slate-600/40 scale-105"
                            : "border-slate-200"
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={slide?.background ?? "#ffffff"}
                    onChange={(e) =>
                      project &&
                      slide &&
                      updateSlideBackground(project.id, slide.id, e.target.value)
                    }
                    className="w-6 h-6 rounded border-2 border-slate-200 cursor-pointer"
                    title="Cor personalizada"
                  />
                </div>
              </RibbonGroup>

              <RibbonGroup label="Tipografia">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Paintbrush className="h-3.5 w-3.5 text-slate-600" />
                    <select
                      value={project?.theme.fontFamily ?? "Inter, sans-serif"}
                      onChange={(e) =>
                        project &&
                        setTheme(project.id, {
                          fontFamily: e.target.value,
                          customFontUrl: null,
                        })
                      }
                      className="h-7 px-3 text-xs rounded-md border-2 border-slate-200 bg-white text-slate-900 font-medium hover:border-slate-300 focus:border-slate-600 focus:outline-none"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue="normal"
                      className="h-7 px-3 text-xs rounded-md border-2 border-slate-200 bg-white text-slate-900 font-medium hover:border-slate-300 focus:border-slate-600 focus:outline-none"
                      title="Peso da Fonte"
                    >
                      {FONT_WEIGHT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </RibbonGroup>

              <RibbonGroup label="Tamanho do Slide">
                <div className="flex items-center gap-1">
                  {SLIDE_SIZE_PRESETS.map((preset) => (
                    <RibbonButton
                      key={preset.name}
                      icon={<LayoutGrid className="h-3.5 w-3.5" />}
                      label={preset.name}
                      onClick={() => {
                        setSlideWidth(preset.width);
                        setSlideHeight(preset.height);
                        toast.success(`Tamanho alterado para ${preset.name}`);
                      }}
                      active={slideWidth === preset.width && slideHeight === preset.height}
                      title={`${preset.width}x${preset.height}`}
                    />
                  ))}
                </div>
              </RibbonGroup>
            </>
          </div>
        )}

        {/* ─── EXPORT TAB PANEL ─── */}
        {activeTab === "export" && (
          <div role="tabpanel" id="tabpanel-export" className="flex items-stretch px-2 py-1.5 min-h-[66px] bg-slate-50 border-b border-slate-200 overflow-x-auto">
            <>
              <RibbonGroup label="Publicar">
                <RibbonButton
                  icon={<Download className="h-5 w-5" />}
                  label="SCORM"
                  variant="large"
                  onClick={handleExport}
                  disabled={exporting || !project}
                />
                <RibbonButton
                  icon={<Download className="h-5 w-5 text-red-400" />}
                  label="PDF"
                  variant="large"
                  onClick={() => {
                    if (!project) return;
                    try {
                      exportAsPDF(project);
                      toast.success("PDF gerado — use Ctrl+P para salvar");
                    } catch {
                      toast.error("Erro ao gerar PDF");
                    }
                  }}
                  disabled={!project}
                />
                <RibbonButton
                  icon={<Code className="h-5 w-5" />}
                  label="HTML5"
                  variant="large"
                  onClick={handleExportHTML5}
                  title="Exportar como HTML5 autossuficiente"
                />
                <RibbonButton
                  icon={<Zap className="h-5 w-5" />}
                  label="xAPI"
                  variant="large"
                  onClick={handleExportXAPI}
                  title="Exportar com rastreamento xAPI"
                />
              </RibbonGroup>

              <RibbonGroup label="Compartilhar">
                <RibbonButton
                  icon={<Share2 className="h-5 w-5" />}
                  label="Revisão"
                  variant="large"
                  onClick={handleShare}
                  disabled={sharing || !project}
                />
                <RibbonButton
                  icon={<Globe className="h-5 w-5" />}
                  label="Link Público"
                  variant="large"
                  onClick={handlePublicLink}
                  title="Gerar link público de acesso"
                />
              </RibbonGroup>

              <RibbonGroup label="Importar">
                <ImportPPTXDialog />
              </RibbonGroup>
            </>
          </div>
        )}

        {/* ─── TOOLS TAB PANEL ─── */}
        {activeTab === "tools" && (
          <div role="tabpanel" id="tabpanel-tools" className="flex items-stretch px-2 py-1.5 min-h-[66px] bg-slate-50 border-b border-slate-200 overflow-x-auto">
            <>
              <RibbonGroup label="IA">
                <AIQuizDialog
                  onInsertQuiz={(data) => {
                    if (!project || !slide) return;
                    addBlock(project.id, slide.id, {
                      id: crypto.randomUUID(),
                      type: "quiz",
                      x: 100,
                      y: 100,
                      width: 700,
                      height: 350,
                      zIndex: slide.blocks.length,
                      ...data,
                    });
                  }}
                  onInsertTrueFalse={(data) => {
                    if (!project || !slide) return;
                    addBlock(project.id, slide.id, {
                      id: crypto.randomUUID(),
                      type: "truefalse",
                      x: 100,
                      y: 100,
                      width: 600,
                      height: 200,
                      zIndex: slide.blocks.length,
                      ...data,
                    });
                  }}
                />
                {project && <AICourseDialog projectId={project.id} />}
              </RibbonGroup>

              <RibbonGroup label="Acessibilidade">
                <ContrastChecker />
                <RibbonButton
                  icon={<Eye className="h-5 w-5" />}
                  label="Alto Contraste"
                  onClick={() => {
                    setShowHighContrast(!showHighContrast);
                    toast.success(showHighContrast ? "Alto contraste desativado" : "Alto contraste ativado");
                  }}
                  active={showHighContrast}
                  title="Modo de alto contraste para acessibilidade"
                />
              </RibbonGroup>

              <RibbonGroup label="Recursos">
                <AssetLibraryDialog />
              </RibbonGroup>

              <RibbonGroup label="Geral">
                <RibbonButton
                  icon={<StickyNote className="h-5 w-5" />}
                  label="Notas"
                  onClick={() => toast.info("Notas do apresentador visíveis no painel lateral")}
                  title="Exibir notas do apresentador"
                />
                <RibbonButton
                  icon={<Ruler className="h-5 w-5" />}
                  label="Régua"
                  onClick={() => {
                    setShowRuler(!showRuler);
                    toast.success(showRuler ? "Régua desativada" : "Régua habilitada");
                  }}
                  active={showRuler}
                  title="Mostrar régua de medida"
                />
                <RibbonButton
                  icon={<Grid3X3 className="h-5 w-5" />}
                  label="Grade"
                  onClick={() => {
                    setShowGrid(!showGrid);
                    toast.success(showGrid ? "Grade desativada" : "Grade habilitada");
                  }}
                  active={showGrid}
                  title="Mostrar grade de alinhamento"
                />
                <PreviewDialog />
                <CourseSettingsDialog />
                <KeyboardShortcutsDialog />
              </RibbonGroup>
            </>
          </div>
        )}
      </div>

      {/* Share Dialog (Modal Overlay) */}
      {shareDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShareDialogOpen(false)}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200 bg-white border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Share2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Compartilhar para Revisão
                </h3>
                <p className="text-xs text-slate-500">
                  Envie o link para que revisores deixem comentários
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Link className="h-4 w-4 text-slate-500 flex-shrink-0" />
              <input
                readOnly
                value={shareLink}
                className="flex-1 bg-transparent text-sm text-slate-900 outline-none font-mono truncate"
              />
              <Button
                size="sm"
                className="rounded-lg h-8 gap-1.5 flex-shrink-0 bg-purple-500 hover:bg-purple-600 cursor-pointer"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copiado!
                  </>
                ) : (
                  "Copiar"
                )}
              </Button>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                onClick={() => setShareDialogOpen(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
  { name: "Violet", primary: "#7c3aed", secondary: "#a78bfa" },
  { name: "Indigo", primary: "#4f46e5", secondary: "#818cf8" },
  { name: "Rose", primary: "#e11d48", secondary: "#fb7185" },
  { name: "Emerald", primary: "#059669", secondary: "#6ee7b7" },
  { name: "Amber", primary: "#d97706", secondary: "#fbbf24" },
  { name: "Sky", primary: "#0284c7", secondary: "#7dd3fc" },
  { name: "Pink", primary: "#db2777", secondary: "#f9a8d4" },
  { name: "Teal", primary: "#0d9488", secondary: "#5eead4" },
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

  const [activeTab, setActiveTab] = useState<RibbonTabId>("home");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

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
    }

    addBlock(project.id, slide.id, newBlock);
  };

  // Text formatting helpers (when a text block is selected)
  const handleTextFormat = (prop: string, value: string) => {
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
      <div className="h-10 border-b border-white/5 flex items-center justify-between px-3 flex-shrink-0" style={{ background: '#0F172A' }}>
        {/* Left: Back + Logo + Title */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
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
                className="text-sm font-semibold bg-transparent border-b-2 border-primary outline-none py-0.5 px-1 min-w-[200px] text-white"
                autoFocus
              />
            ) : (
              <button
                onClick={handleTitleClick}
                className="text-sm font-semibold text-white hover:text-purple-300 transition-colors cursor-pointer"
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

        {/* Right: Tools & Actions */}
        <div className="flex items-center gap-2">
          
          <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
            <PreviewDialog />
            <KeyboardShortcutsDialog />
            <CourseSettingsDialog />
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg text-xs h-8 bg-transparent border-white/10 hover:bg-white/5 text-slate-200"
              onClick={handleShare}
              disabled={sharing || !project}
            >
              {sharing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
              Compartilhar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg text-xs h-8 bg-transparent border-white/10 hover:bg-white/5 text-slate-200"
              onClick={handleExport}
              disabled={exporting || !project}
            >
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5 text-blue-400" />}
              SCORM
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 rounded-lg text-xs h-8 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer border border-emerald-500/20"
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
      </div>

      {/* Share Dialog (Modal Overlay) */}
      {shareDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShareDialogOpen(false)}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200"
            style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Share2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Compartilhar para Revisão
                </h3>
                <p className="text-xs text-slate-400">
                  Envie o link para que revisores deixem comentários
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
              <Link className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <input
                readOnly
                value={shareLink}
                className="flex-1 bg-transparent text-sm text-white outline-none font-mono truncate"
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
                className="rounded-xl text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
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

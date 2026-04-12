"use client";

import React, { useState, useRef } from "react";
import { useEditorStore, Block, QuizOption, AnimationType, AnimationEasing } from "@/store/useEditorStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/constants/canvas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Type,
  Image,
  CreditCard,
  HelpCircle,
  Layers,
  Trash2,
  Plus,
  Check,
  Upload,
  Play,
  Clock,
  Loader2,
  ChevronDown,
  Move,
  Maximize2,
  Palette,
  Settings2,
  Sparkles,
  ImageUp,
  Copy,
  Hexagon,
  Music,
  CheckCircle2,
  Link2,
  PenLine,
  ArrowUpDown,
  MousePointer,
  PanelTop,
  GitBranch,
  GripVertical,
  BarChart3,
  FileText,
  Calculator,
  Grid3x3,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function BlockIcon({ type }: { type: Block["type"] }) {
  const icons: Record<string, React.ReactNode> = {
    text: <Type className="h-4 w-4 text-violet-500" />,
    image: <Image className="h-4 w-4 text-blue-500" />,
    flashcard: <CreditCard className="h-4 w-4 text-emerald-500" />,
    quiz: <HelpCircle className="h-4 w-4 text-rose-500" />,
    video: <Play className="h-4 w-4 text-orange-500" />,
    shape: <Hexagon className="h-4 w-4 text-indigo-500" />,
    audio: <Music className="h-4 w-4 text-violet-500" />,
    truefalse: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    matching: <Link2 className="h-4 w-4 text-blue-500" />,
    fillblank: <PenLine className="h-4 w-4 text-amber-500" />,
    sorting: <ArrowUpDown className="h-4 w-4 text-purple-500" />,
    hotspot: <MousePointer className="h-4 w-4 text-cyan-500" />,
    accordion: <ChevronDown className="h-4 w-4 text-slate-500" />,
    tabs: <PanelTop className="h-4 w-4 text-indigo-500" />,
    branching: <GitBranch className="h-4 w-4 text-rose-500" />,
    timeline: <Clock className="h-4 w-4 text-sky-500" />,
    dragdrop: <GripVertical className="h-4 w-4 text-teal-500" />,
    "labeled-graphic": <MousePointer className="h-4 w-4 text-cyan-500" />,
    process: <Layers className="h-4 w-4 text-emerald-500" />,
    lightbox: <Maximize2 className="h-4 w-4 text-violet-500" />,
    quote: <Type className="h-4 w-4 text-amber-500" />,
    download: <Layers className="h-4 w-4 text-blue-500" />,
    counter: <Layers className="h-4 w-4 text-red-500" />,
    button: <Layers className="h-4 w-4 text-violet-500" />,
    divider: <Layers className="h-4 w-4 text-slate-400" />,
    embed: <Layers className="h-4 w-4 text-sky-500" />,
    likert: <BarChart3 className="h-4 w-4 text-violet-500" />,
    ranking: <ArrowUpDown className="h-4 w-4 text-cyan-500" />,
    essay: <PenLine className="h-4 w-4 text-amber-500" />,
    numeric: <Layers className="h-4 w-4 text-emerald-500" />,
    dropdown: <ChevronDown className="h-4 w-4 text-indigo-500" />,
    matrix: <Layers className="h-4 w-4 text-red-500" />,
    "image-choice": <Image className="h-4 w-4 text-blue-500" />,
  };
  return icons[type];
}

const BLOCK_LABELS: Record<string, string> = {
  text: "Texto",
  image: "Imagem",
  flashcard: "Flashcard",
  quiz: "Quiz",
  video: "Vídeo",
  shape: "Forma",
  audio: "Áudio",
  truefalse: "Verdadeiro/Falso",
  matching: "Liga Pontos",
  fillblank: "Preencher Lacunas",
  sorting: "Ordenação",
  hotspot: "Hotspot",
  accordion: "Accordion",
  tabs: "Tabs",
  branching: "Cenário",
  timeline: "Linha do Tempo",
  dragdrop: "Drag & Drop",
  "labeled-graphic": "Imagem Interativa",
  process: "Processo",
  lightbox: "Lightbox",
  quote: "Citação",
  download: "Download",
  counter: "Contador",
  button: "Botão",
  divider: "Divisor",
  embed: "Embed",
  likert: "Likert",
  ranking: "Ranking",
  essay: "Dissertativa",
  numeric: "Numérico",
  dropdown: "Dropdown",
  matrix: "Matriz",
  "image-choice": "Escolha Visual",
};

// ─── Collapsible Section ───
function Section({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
      >
        {icon}
        <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex-1">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-slate-400 transition-transform",
            !open && "-rotate-90"
          )}
        />
      </button>
      {open && <div className="px-4 pb-3 space-y-3">{children}</div>}
    </div>
  );
}

// ─── Field Row ───
function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] text-slate-600 w-14 flex-shrink-0">
        {label}
      </label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function PropertiesPanel() {
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const getCurrentSlide = useEditorStore((s) => s.getCurrentSlide);
  const getSelectedBlock = useEditorStore((s) => s.getSelectedBlock);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const deleteBlock = useEditorStore((s) => s.deleteBlock);
  const updateSlideBackground = useEditorStore(
    (s) => s.updateSlideBackground
  );
  const setTheme = useEditorStore((s) => s.setTheme);
  const updateSlideNotes = useEditorStore((s) => s.updateSlideNotes);
  const applyThemeToAllSlides = useEditorStore((s) => s.applyThemeToAllSlides);
  const addBlock = useEditorStore((s) => s.addBlock);

  const project = getCurrentProject();
  const slide = getCurrentSlide();
  const block = getSelectedBlock();

  const [activeTab, setActiveTab] = useState("design");

  React.useEffect(() => {
    if (block) {
      setActiveTab("design");
    }
  }, [block?.id]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const hotspotImageInputRef = useRef<HTMLInputElement>(null);
  const interactiveVideoInputRef = useRef<HTMLInputElement>(null);
  const interactiveVideoPosterInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingHotspotImage, setIsUploadingHotspotImage] = useState(false);
  const [isUploadingInteractiveVideo, setIsUploadingInteractiveVideo] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);

  // AI Theme state
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiFileName, setAiFileName] = useState<string | null>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);

  // Certificate state
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);

  const handleAiTheme = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, envie uma imagem.");
      return;
    }
    setAiFileName(file.name);
    setAiAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/ai/theme", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.primaryColor && data.secondaryColor && data.fontFamily) {
        setTheme(project.id, {
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          fontFamily: data.fontFamily,
        });
        // Apply theme to all existing blocks
        applyThemeToAllSlides(project.id);
        toast.success("Tema da marca aplicado com sucesso! ✨");
        setAiDialogOpen(false);
      } else {
        toast.error("Não foi possível extrair o tema.");
      }
    } catch (err) {
      console.error("AI Theme error:", err);
      toast.error("Erro ao analisar a imagem.");
    } finally {
      setAiAnalyzing(false);
      setAiFileName(null);
      if (aiFileInputRef.current) aiFileInputRef.current.value = "";
    }
  };

  const handleUpdate = (updates: Partial<Block>) => {
    if (!project || !slide || !block) return;
    updateBlock(project.id, slide.id, block.id, updates);
  };

  const handleDelete = () => {
    if (!project || !slide || !block) return;
    deleteBlock(project.id, slide.id, block.id);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !project || !slide || !block) return;
    if (!file.type.startsWith("image/")) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        handleUpdate({ src: data.url } as Partial<Block>);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    acceptPrefix: string,
    fieldName: string,
    setLoading: (v: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file || !project || !slide || !block) return;
    if (acceptPrefix && !file.type.startsWith(acceptPrefix)) {
      toast.error("Tipo de arquivo não suportado.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        handleUpdate({ [fieldName]: data.url } as any);
        toast.success("Upload concluído!");
      } else {
        toast.error(data.error || "Erro no upload.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Falha no upload.");
    } finally {
      setLoading(false);
      if (e.target) e.target.value = "";
    }
  };

  // Quiz helpers
  const handleAddOption = () => {
    if (!block || block.type !== "quiz") return;
    const newOption: QuizOption = {
      id: crypto.randomUUID(),
      text: `Opção ${String.fromCharCode(65 + block.options.length)}`,
      isCorrect: false,
    };
    handleUpdate({
      options: [...block.options, newOption],
    } as Partial<Block>);
  };

  const handleRemoveOption = (optionId: string) => {
    if (!block || block.type !== "quiz") return;
    handleUpdate({
      options: block.options.filter((o) => o.id !== optionId),
    } as Partial<Block>);
  };

  const handleUpdateOption = (
    optionId: string,
    updates: Partial<QuizOption>
  ) => {
    if (!block || block.type !== "quiz") return;
    handleUpdate({
      options: block.options.map((o) =>
        o.id === optionId ? { ...o, ...updates } : o
      ),
    } as Partial<Block>);
  };

  const handleSetCorrect = (optionId: string) => {
    if (!block || block.type !== "quiz") return;
    handleUpdate({
      options: block.options.map((o) => ({
        ...o,
        isCorrect: o.id === optionId,
      })),
    } as Partial<Block>);
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
          color: "#1a1a2e",
          textAlign: "left",
          backgroundColor: "transparent",
        } as Block;
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
          borderRadius: 12,
        } as Block;
        break;
      case "video":
        newBlock = {
          ...baseBlock,
          type: "video",
          width: 480,
          height: 270,
          url: "",
          provider: "youtube",
          autoplay: false,
          controls: true,
          loop: false,
          muted: false,
          borderRadius: 12,
        } as unknown as Block;
        break;
      case "flashcard":
        newBlock = {
          ...baseBlock,
          type: "flashcard",
          width: 320,
          height: 200,
          frontContent: "Frente",
          backContent: "Verso",
          frontBg: "#7c3aed",
          backBg: "#4f46e5",
          frontColor: "#ffffff",
          backColor: "#ffffff",
        } as unknown as Block;
        break;
      case "shape":
        newBlock = {
          ...baseBlock,
          type: "shape",
          width: 100,
          height: 100,
          shapeType: "rectangle",
          backgroundColor: "#e2e8f0",
          borderRadius: 0,
        } as unknown as Block;
        break;
      case "quiz":
        newBlock = {
          ...baseBlock,
          type: "quiz",
          width: 450,
          height: 280,
          question: "Qual a resposta?",
          options: [
            { id: crypto.randomUUID(), text: "Opção A", isCorrect: true },
            { id: crypto.randomUUID(), text: "Opção B", isCorrect: false }
          ],
          feedback: { correct: "Muito bem!", incorrect: "Tente novamente." },
          pointsValue: 10,
        } as Block;
        break;
      default:
        return;
    }
    addBlock(project.id, slide.id, newBlock);
  };

  return (
    <div className="w-[280px] border-l border-slate-200 flex flex-col flex-shrink-0" style={{ background: '#FFFFFF' }}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        {/* Modern Tab Header */}
        <div className="px-3 py-2 border-b border-slate-200 bg-white">
          <TabsList className="w-full grid grid-cols-2 bg-slate-100 border border-slate-300 h-9">
            <TabsTrigger value="insert" className="text-[11px] data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-sm">Inserir</TabsTrigger>
            <TabsTrigger value="design" className="text-[11px] data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-sm">Design</TabsTrigger>
          </TabsList>
        </div>

        {/* ─── ABA INSERIR ─── */}
        <TabsContent value="insert" className="m-0 flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              
              <div>
                <h4 className="text-[10px] font-semibold text-slate-700 uppercase tracking-widest mb-3">Básico</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleAddBlock("text")} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-300 rounded-xl hover:bg-slate-100 hover:border-purple-400 hover:shadow-sm transition-all group cursor-pointer">
                    <Type className="h-5 w-5 text-slate-600 group-hover:text-purple-500 transition-colors" />
                    <span className="text-[10px] text-slate-700 font-medium">Texto</span>
                  </button>
                  <button onClick={() => handleAddBlock("image")} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-300 rounded-xl hover:bg-slate-100 hover:border-purple-400 hover:shadow-sm transition-all group cursor-pointer">
                    <Image className="h-5 w-5 text-slate-600 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[10px] text-slate-700 font-medium">Imagem</span>
                  </button>
                  <button onClick={() => handleAddBlock("video")} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-300 rounded-xl hover:bg-slate-100 hover:border-purple-400 hover:shadow-sm transition-all group cursor-pointer">
                    <Play className="h-5 w-5 text-slate-600 group-hover:text-orange-500 transition-colors" />
                    <span className="text-[10px] text-slate-700 font-medium">Vídeo</span>
                  </button>
                  <button onClick={() => handleAddBlock("shape")} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-300 rounded-xl hover:bg-slate-100 hover:border-purple-400 hover:shadow-sm transition-all group cursor-pointer">
                    <Hexagon className="h-5 w-5 text-slate-600 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-[10px] text-slate-700 font-medium">Formas</span>
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-semibold text-slate-700 uppercase tracking-widest mb-3">Interativo</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleAddBlock("flashcard")} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-300 rounded-xl hover:bg-slate-100 hover:border-purple-400 hover:shadow-sm transition-all group cursor-pointer">
                    <CreditCard className="h-5 w-5 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                    <span className="text-[10px] text-slate-700 font-medium">Flashcard</span>
                  </button>
                  <button onClick={() => handleAddBlock("quiz")} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-300 rounded-xl hover:bg-slate-100 hover:border-purple-400 hover:shadow-sm transition-all group cursor-pointer">
                    <HelpCircle className="h-5 w-5 text-slate-600 group-hover:text-rose-500 transition-colors" />
                    <span className="text-[10px] text-slate-700 font-medium">Quiz</span>
                  </button>
                </div>
              </div>

            </div>
          </ScrollArea>
        </TabsContent>

        {/* ─── ABA DESIGN ─── */}
        <TabsContent value="design" className="m-0 flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            {block ? (
          <div>
            {/* Block Header */}
            <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/40">
                <BlockIcon type={block.type} />
                <span className="font-medium text-sm">
                  {BLOCK_LABELS[block.type]}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                  onClick={() => {
                    if (!project || !slide) return;
                    useEditorStore.getState().duplicateBlock(project.id, slide.id, block.id);
                  }}
                  title="Duplicar bloco (Ctrl+D)"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md"
                  onClick={handleDelete}
                  title="Excluir bloco"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Position & Size */}
            <Section
              title="Posição e Tamanho"
              icon={<Move className="h-3 w-3 text-muted-foreground/60" />}
            >
              <div className="grid grid-cols-2 gap-2">
                <FieldRow label="X">
                  <Input
                    type="number"
                    value={block.x}
                    onChange={(e) =>
                      handleUpdate({ x: Number(e.target.value) })
                    }
                    className="h-7 text-xs rounded-md"
                  />
                </FieldRow>
                <FieldRow label="Y">
                  <Input
                    type="number"
                    value={block.y}
                    onChange={(e) =>
                      handleUpdate({ y: Number(e.target.value) })
                    }
                    className="h-7 text-xs rounded-md"
                  />
                </FieldRow>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FieldRow label="Larg.">
                  <Input
                    type="number"
                    value={block.width}
                    onChange={(e) =>
                      handleUpdate({
                        width: Number(e.target.value),
                      })
                    }
                    className="h-7 text-xs rounded-md"
                  />
                </FieldRow>
                <FieldRow label="Alt.">
                  <Input
                    type="number"
                    value={block.height}
                    onChange={(e) =>
                      handleUpdate({
                        height: Number(e.target.value),
                      })
                    }
                    className="h-7 text-xs rounded-md"
                  />
                </FieldRow>
              </div>

              {/* Z-Index */}
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => handleUpdate({ zIndex: Math.max(0, (block.zIndex || 0) - 1) })}
                  className="h-7 text-[10px] rounded-md border border-border hover:bg-accent flex items-center justify-center"
                  title="Enviar para trás"
                >↓ Trás</button>
                <Input
                  type="number"
                  min="0"
                  max="99"
                  value={block.zIndex || 0}
                  onChange={(e) => handleUpdate({ zIndex: Number(e.target.value) })}
                  className="h-7 text-xs rounded-md text-center"
                />
                <button
                  onClick={() => handleUpdate({ zIndex: (block.zIndex || 0) + 1 })}
                  className="h-7 text-[10px] rounded-md border border-border hover:bg-accent flex items-center justify-center"
                  title="Trazer para frente"
                >↑ Frente</button>
              </div>
            </Section>

            {/* ─── ANIMATION ─── */}
            <Section
              title="Animação"
              icon={<Sparkles className="h-3 w-3 text-muted-foreground/60" />}
              defaultOpen={false}
            >
              <div className="space-y-2">
                <FieldRow label="Tipo">
                  <select
                    value={block.animation?.type || "none"}
                    onChange={(e) => handleUpdate({ animation: { ...(block.animation || { duration: 0.5, delay: 0, easing: "ease" as AnimationEasing }), type: e.target.value as AnimationType } })}
                    className="h-7 w-full text-xs rounded-md border border-border bg-background px-2"
                  >
                    <option value="none">Nenhuma</option>
                    <option value="fadeIn">Fade In</option>
                    <option value="fadeOut">Fade Out</option>
                    <option value="slideLeft">Slide da Esquerda</option>
                    <option value="slideRight">Slide da Direita</option>
                    <option value="slideUp">Slide de Baixo</option>
                    <option value="slideDown">Slide de Cima</option>
                    <option value="zoomIn">Zoom In</option>
                    <option value="zoomOut">Zoom Out</option>
                    <option value="bounceIn">Bounce</option>
                    <option value="rotateIn">Rotação</option>
                    <option value="flipIn">Flip</option>
                  </select>
                </FieldRow>
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="Duração (s)">
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="5"
                      value={block.animation?.duration || 0.5}
                      onChange={(e) => handleUpdate({ animation: { ...(block.animation || { type: "none" as const, delay: 0, easing: "ease" as const }), duration: Number(e.target.value) } })}
                      className="h-7 text-xs rounded-md"
                    />
                  </FieldRow>
                  <FieldRow label="Delay (s)">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={block.animation?.delay || 0}
                      onChange={(e) => handleUpdate({ animation: { ...(block.animation || { type: "none" as const, duration: 0.5, easing: "ease" as const }), delay: Number(e.target.value) } })}
                      className="h-7 text-xs rounded-md"
                    />
                  </FieldRow>
                </div>
                <FieldRow label="Easing">
                  <select
                    value={block.animation?.easing || "ease"}
                    onChange={(e) => handleUpdate({ animation: { ...(block.animation || { type: "none" as AnimationType, duration: 0.5, delay: 0 }), easing: e.target.value as AnimationEasing } })}
                    className="h-7 w-full text-xs rounded-md border border-border bg-background px-2"
                  >
                    <option value="ease">Ease</option>
                    <option value="ease-in">Ease In</option>
                    <option value="ease-out">Ease Out</option>
                    <option value="ease-in-out">Ease In-Out</option>
                    <option value="linear">Linear</option>
                  </select>
                </FieldRow>
              </div>
            </Section>

            {/* ─── STATES (Wave 10) ─── */}
            <Section
              title="Estados"
              icon={<Layers className="h-3 w-3 text-muted-foreground/60" />}
              defaultOpen={false}
            >
              <div className="space-y-3">
                {block.states && block.states.length > 0 ? (
                  <div className="space-y-2">
                    {block.states.map((state) => (
                      <div key={state.name} className="p-2 rounded border border-border/40 bg-muted/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{state.name}</span>
                          <button
                            onClick={() =>
                              handleUpdate({
                                states: block.states!.filter((s) => s.name !== state.name),
                              } as Partial<Block>)
                            }
                            className="h-5 w-5 flex items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors text-[10px]"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Nenhum estado configurado</p>
                )}
                <Button
                  onClick={() => {
                    const stateName = prompt("Nome do estado (ex: hover, selected, disabled):");
                    if (stateName) {
                      const newState = {
                        name: stateName,
                        overrides: {},
                      };
                      handleUpdate({
                        states: [...(block.states || []), newState],
                      } as Partial<Block>);
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar Estado
                </Button>
                {block.currentState && (
                  <div className="p-2 rounded border border-border/40 bg-blue-50">
                    <label className="text-[10px] font-semibold text-slate-700">
                      Estado Atual
                    </label>
                    <select
                      value={block.currentState || ""}
                      onChange={(e) =>
                        handleUpdate({ currentState: e.target.value } as Partial<Block>)
                      }
                      className="w-full h-6 text-xs rounded-md border border-border bg-background mt-1 px-2"
                    >
                      <option value="">Nenhum</option>
                      {block.states?.map((state) => (
                        <option key={state.name} value={state.name}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </Section>

            {/* ─── ALIGNMENT ─── */}
            <Section
              title="Alinhar no Slide"
              icon={<Maximize2 className="h-3 w-3 text-muted-foreground/60" />}
              defaultOpen={false}
            >
              <div className="grid grid-cols-3 gap-1">
                <button onClick={() => handleUpdate({ x: 0 })} className="h-7 text-[10px] rounded-md border border-border hover:bg-accent flex items-center justify-center" title="Alinhar à Esquerda">← Esq</button>
                <button onClick={() => handleUpdate({ x: Math.round((CANVAS_WIDTH - block.width) / 2) })} className="h-7 text-[10px] rounded-md border border-border hover:bg-accent flex items-center justify-center" title="Centralizar H">↔ Centro</button>
                <button onClick={() => handleUpdate({ x: CANVAS_WIDTH - block.width })} className="h-7 text-[10px] rounded-md border border-border hover:bg-accent flex items-center justify-center" title="Alinhar à Direita">Dir →</button>
                <button onClick={() => handleUpdate({ y: 0 })} className="h-7 text-[10px] rounded-md border border-border hover:bg-accent flex items-center justify-center" title="Alinhar Topo">↑ Topo</button>
                <button onClick={() => handleUpdate({ y: Math.round((CANVAS_HEIGHT - block.height) / 2) })} className="h-7 text-[10px] rounded-md border border-border hover:bg-accent flex items-center justify-center" title="Centralizar V">↕ Meio</button>
                <button onClick={() => handleUpdate({ y: CANVAS_HEIGHT - block.height })} className="h-7 text-[10px] rounded-md border border-border hover:bg-accent flex items-center justify-center" title="Alinhar Base">↓ Base</button>
              </div>
            </Section>

            {/* ─── TEXT PROPERTIES ─── */}
            {block.type === "text" && (
              <Section
                title="Tipografia"
                icon={
                  <Type className="h-3 w-3 text-muted-foreground/60" />
                }
              >
                {/* Font size + weight row */}
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="Tam.">
                    <Input
                      type="number"
                      value={block.fontSize}
                      onChange={(e) =>
                        handleUpdate({
                          fontSize: Number(e.target.value),
                        } as Partial<Block>)
                      }
                      className="h-7 text-xs rounded-md"
                    />
                  </FieldRow>
                  <FieldRow label="Peso">
                    <select
                      value={block.fontWeight}
                      onChange={(e) =>
                        handleUpdate({
                          fontWeight: e.target.value,
                        } as Partial<Block>)
                      }
                      className="w-full h-7 text-xs rounded-md border border-border bg-background px-1.5"
                    >
                      <option value="lighter">Leve</option>
                      <option value="normal">Normal</option>
                      <option value="500">Médio</option>
                      <option value="600">Semi-Bold</option>
                      <option value="bold">Negrito</option>
                      <option value="800">Extra-Bold</option>
                    </select>
                  </FieldRow>
                </div>

                {/* B I U S format buttons */}
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => handleUpdate({ fontWeight: block.fontWeight === "bold" ? "normal" : "bold" } as Partial<Block>)}
                    className={`h-7 w-7 flex items-center justify-center rounded-md text-xs font-bold border transition-colors ${block.fontWeight === "bold" || block.fontWeight === "800" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
                    title="Negrito"
                  >B</button>
                  <button
                    onClick={() => handleUpdate({ fontStyle: (block as any).fontStyle === "italic" ? "normal" : "italic" } as Partial<Block>)}
                    className={`h-7 w-7 flex items-center justify-center rounded-md text-xs italic border transition-colors ${(block as any).fontStyle === "italic" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
                    title="Itálico"
                  >I</button>
                  <button
                    onClick={() => handleUpdate({ textDecorationLine: (block as any).textDecorationLine === "underline" ? "none" : "underline" } as Partial<Block>)}
                    className={`h-7 w-7 flex items-center justify-center rounded-md text-xs underline border transition-colors ${(block as any).textDecorationLine === "underline" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
                    title="Sublinhado"
                  >U</button>
                  <button
                    onClick={() => handleUpdate({ textDecorationLine: (block as any).textDecorationLine === "line-through" ? "none" : "line-through" } as Partial<Block>)}
                    className={`h-7 w-7 flex items-center justify-center rounded-md text-xs line-through border transition-colors ${(block as any).textDecorationLine === "line-through" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
                    title="Tachado"
                  >S</button>
                  <div className="w-px bg-border mx-0.5" />
                  <select
                    value={(block as any).listType || "none"}
                    onChange={(e) => handleUpdate({ listType: e.target.value } as Partial<Block>)}
                    className="h-7 text-xs rounded-md border border-border bg-background px-1.5 flex-1"
                    title="Tipo de lista"
                  >
                    <option value="none">Sem lista</option>
                    <option value="ul">• Lista</option>
                    <option value="ol">1. Numerada</option>
                  </select>
                </div>

                {/* Color */}
                <FieldRow label="Cor">
                  <div className="flex gap-1.5">
                    <input
                      type="color"
                      value={block.color}
                      onChange={(e) =>
                        handleUpdate({
                          color: e.target.value,
                        } as Partial<Block>)
                      }
                      className="w-7 h-7 rounded-md border border-border cursor-pointer"
                    />
                    <Input
                      value={block.color}
                      onChange={(e) =>
                        handleUpdate({
                          color: e.target.value,
                        } as Partial<Block>)
                      }
                      className="h-7 text-xs rounded-md"
                    />
                  </div>
                </FieldRow>

                {/* Align */}
                <FieldRow label="Alinhar">
                  <select
                    value={block.textAlign}
                    onChange={(e) =>
                      handleUpdate({
                        textAlign: e.target.value as
                          | "left"
                          | "center"
                          | "right",
                      } as Partial<Block>)
                    }
                    className="w-full h-7 text-xs rounded-md border border-border bg-background px-1.5"
                  >
                    <option value="left">Esquerda</option>
                    <option value="center">Centro</option>
                    <option value="right">Direita</option>
                  </select>
                </FieldRow>

                {/* Line height + Letter spacing */}
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="Entrelinha">
                    <Input
                      type="number"
                      step="0.1"
                      min="0.8"
                      max="3"
                      value={(block as any).lineHeight ?? 1.5}
                      onChange={(e) =>
                        handleUpdate({ lineHeight: Number(e.target.value) } as Partial<Block>)
                      }
                      className="h-7 text-xs rounded-md"
                    />
                  </FieldRow>
                  <FieldRow label="Espaço">
                    <Input
                      type="number"
                      step="0.5"
                      min="-2"
                      max="10"
                      value={(block as any).letterSpacing ?? 0}
                      onChange={(e) =>
                        handleUpdate({ letterSpacing: Number(e.target.value) } as Partial<Block>)
                      }
                      className="h-7 text-xs rounded-md"
                    />
                  </FieldRow>
                </div>

                {/* Background + Opacity */}
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="Fundo">
                    <div className="flex gap-1">
                      <input
                        type="color"
                        value={(block as any).backgroundColor === "transparent" ? "#ffffff" : ((block as any).backgroundColor || "#ffffff")}
                        onChange={(e) =>
                          handleUpdate({ backgroundColor: e.target.value } as Partial<Block>)
                        }
                        className="w-7 h-7 rounded-md border border-border cursor-pointer"
                      />
                      <button
                        onClick={() => handleUpdate({ backgroundColor: "transparent" } as Partial<Block>)}
                        className="h-7 px-1.5 text-[10px] rounded-md border border-border hover:bg-accent"
                        title="Sem fundo"
                      >∅</button>
                    </div>
                  </FieldRow>
                  <FieldRow label="Opacidade">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={(block as any).opacity ?? 1}
                      onChange={(e) =>
                        handleUpdate({ opacity: Number(e.target.value) } as Partial<Block>)
                      }
                      className="h-7 text-xs rounded-md"
                    />
                  </FieldRow>
                </div>

                {/* Border radius */}
                <FieldRow label="Borda">
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={(block as any).borderRadius ?? 0}
                    onChange={(e) =>
                      handleUpdate({ borderRadius: Number(e.target.value) } as Partial<Block>)
                    }
                    className="h-7 text-xs rounded-md"
                    placeholder="Raio (px)"
                  />
                </FieldRow>
              </Section>
            )}

            {/* ─── IMAGE PROPERTIES ─── */}
            {block.type === "image" && (
              <Section
                title="Imagem"
                icon={
                  <Image className="h-3 w-3 text-muted-foreground/60" />
                }
              >
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 rounded-lg text-xs h-8"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  {isUploadingImage
                    ? "Enviando..."
                    : block.src
                    ? "Trocar Imagem"
                    : "Upload de Imagem"}
                </Button>
                {block.src && (
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img
                      src={block.src}
                      alt={block.alt}
                      className="w-full h-20 object-cover"
                    />
                  </div>
                )}
                <FieldRow label="Alt">
                  <Input
                    value={block.alt}
                    onChange={(e) =>
                      handleUpdate({
                        alt: e.target.value,
                      } as Partial<Block>)
                    }
                    className="h-7 text-xs rounded-md"
                    placeholder="Descreva a imagem..."
                  />
                </FieldRow>
                <FieldRow label="Ajuste">
                  <select
                    value={block.objectFit}
                    onChange={(e) =>
                      handleUpdate({
                        objectFit: e.target.value as
                          | "cover"
                          | "contain"
                          | "fill",
                      } as Partial<Block>)
                    }
                    className="w-full h-7 text-xs rounded-md border border-border bg-background px-1.5"
                  >
                    <option value="cover">Cobrir</option>
                    <option value="contain">Conter</option>
                    <option value="fill">Preencher</option>
                  </select>
                </FieldRow>

                {/* Opacity + Border radius */}
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="Opacidade">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={(block as any).opacity ?? 1}
                      onChange={(e) =>
                        handleUpdate({ opacity: Number(e.target.value) } as Partial<Block>)
                      }
                      className="h-7 text-xs rounded-md"
                    />
                  </FieldRow>
                  <FieldRow label="Raio">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={(block as any).borderRadius ?? 12}
                      onChange={(e) =>
                        handleUpdate({ borderRadius: Number(e.target.value) } as Partial<Block>)
                      }
                      className="h-7 text-xs rounded-md"
                    />
                  </FieldRow>
                </div>

                {/* Border */}
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="Borda">
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={(block as any).borderWidth ?? 0}
                      onChange={(e) =>
                        handleUpdate({ borderWidth: Number(e.target.value) } as Partial<Block>)
                      }
                      className="h-7 text-xs rounded-md"
                      placeholder="px"
                    />
                  </FieldRow>
                  <FieldRow label="Cor borda">
                    <input
                      type="color"
                      value={(block as any).borderColor || "#e2e8f0"}
                      onChange={(e) =>
                        handleUpdate({ borderColor: e.target.value } as Partial<Block>)
                      }
                      className="w-full h-7 rounded-md border border-border cursor-pointer"
                    />
                  </FieldRow>
                </div>

                {/* Shadow */}
                <FieldRow label="Sombra">
                  <select
                    value={(block as any).boxShadow || "none"}
                    onChange={(e) =>
                      handleUpdate({ boxShadow: e.target.value } as Partial<Block>)
                    }
                    className="w-full h-7 text-xs rounded-md border border-border bg-background px-1.5"
                  >
                    <option value="none">Nenhuma</option>
                    <option value="0 2px 8px rgba(0,0,0,0.1)">Leve</option>
                    <option value="0 4px 16px rgba(0,0,0,0.15)">Média</option>
                    <option value="0 8px 32px rgba(0,0,0,0.25)">Forte</option>
                    <option value="0 0 0 3px rgba(124,58,237,0.3)">Contorno</option>
                  </select>
                </FieldRow>
              </Section>
            )}

            {/* ─── FLASHCARD PROPERTIES ─── */}
            {block.type === "flashcard" && (
              <Section
                title="Flashcard"
                icon={
                  <CreditCard className="h-3 w-3 text-muted-foreground/60" />
                }
              >
                <FieldRow label="Frente">
                  <textarea
                    value={block.frontContent}
                    onChange={(e) =>
                      handleUpdate({
                        frontContent: e.target.value,
                      } as Partial<Block>)
                    }
                    className="w-full h-14 text-xs rounded-md border border-border bg-background p-2 resize-none"
                    placeholder="Conteúdo da frente..."
                  />
                </FieldRow>
                <FieldRow label="Verso">
                  <textarea
                    value={block.backContent}
                    onChange={(e) =>
                      handleUpdate({
                        backContent: e.target.value,
                      } as Partial<Block>)
                    }
                    className="w-full h-14 text-xs rounded-md border border-border bg-background p-2 resize-none"
                    placeholder="Conteúdo do verso..."
                  />
                </FieldRow>

                {/* Cores de fundo */}
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="Fundo Frente">
                    <input
                      type="color"
                      value={block.frontBg}
                      onChange={(e) =>
                        handleUpdate({
                          frontBg: e.target.value,
                        } as Partial<Block>)
                      }
                      className="w-full h-7 rounded-md border border-border cursor-pointer"
                    />
                  </FieldRow>
                  <FieldRow label="Fundo Verso">
                    <input
                      type="color"
                      value={block.backBg}
                      onChange={(e) =>
                        handleUpdate({
                          backBg: e.target.value,
                        } as Partial<Block>)
                      }
                      className="w-full h-7 rounded-md border border-border cursor-pointer"
                    />
                  </FieldRow>
                </div>

                {/* Cores de texto */}
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="Texto Frente">
                    <input
                      type="color"
                      value={block.frontColor || "#ffffff"}
                      onChange={(e) =>
                        handleUpdate({
                          frontColor: e.target.value,
                        } as Partial<Block>)
                      }
                      className="w-full h-7 rounded-md border border-border cursor-pointer"
                    />
                  </FieldRow>
                  <FieldRow label="Texto Verso">
                    <input
                      type="color"
                      value={block.backColor || "#ffffff"}
                      onChange={(e) =>
                        handleUpdate({
                          backColor: e.target.value,
                        } as Partial<Block>)
                      }
                      className="w-full h-7 rounded-md border border-border cursor-pointer"
                    />
                  </FieldRow>
                </div>

                {/* Imagem da Frente */}
                <FieldRow label="Imagem Frente">
                  <div className="space-y-1.5">
                    {block.frontImage ? (
                      <div className="relative group rounded-md overflow-hidden border border-border">
                        <img
                          src={block.frontImage}
                          alt="Frente"
                          className="w-full h-16 object-contain bg-black/20"
                        />
                        <button
                          onClick={() =>
                            handleUpdate({ frontImage: undefined } as Partial<Block>)
                          }
                          className="absolute top-1 right-1 p-0.5 rounded bg-red-500/80 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remover imagem"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null}
                    <label className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors">
                      <ImageUp className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {block.frontImage ? "Trocar imagem" : "Upload imagem"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            const res = await fetch("/api/upload", { method: "POST", body: formData });
                            const data = await res.json();
                            if (data.url) handleUpdate({ frontImage: data.url } as Partial<Block>);
                          } catch (err) {
                            console.error("Upload failed:", err);
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </FieldRow>

                {/* Imagem do Verso */}
                <FieldRow label="Imagem Verso">
                  <div className="space-y-1.5">
                    {block.backImage ? (
                      <div className="relative group rounded-md overflow-hidden border border-border">
                        <img
                          src={block.backImage}
                          alt="Verso"
                          className="w-full h-16 object-contain bg-black/20"
                        />
                        <button
                          onClick={() =>
                            handleUpdate({ backImage: undefined } as Partial<Block>)
                          }
                          className="absolute top-1 right-1 p-0.5 rounded bg-red-500/80 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remover imagem"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null}
                    <label className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors">
                      <ImageUp className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {block.backImage ? "Trocar imagem" : "Upload imagem"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            const res = await fetch("/api/upload", { method: "POST", body: formData });
                            const data = await res.json();
                            if (data.url) handleUpdate({ backImage: data.url } as Partial<Block>);
                          } catch (err) {
                            console.error("Upload failed:", err);
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </FieldRow>
              </Section>
            )}

            {/* ─── QUIZ PROPERTIES ─── */}
            {block.type === "quiz" && (
              <Section
                title="Quiz"
                icon={
                  <HelpCircle className="h-3 w-3 text-muted-foreground/60" />
                }
              >
                <FieldRow label="Perg.">
                  <textarea
                    value={block.question}
                    onChange={(e) =>
                      handleUpdate({
                        question: e.target.value,
                      } as Partial<Block>)
                    }
                    className="w-full h-14 text-xs rounded-md border border-border bg-background p-2 resize-none"
                    placeholder="Digite a pergunta..."
                  />
                </FieldRow>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-medium">
                    Opções
                  </label>
                  {block.options.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className="flex items-center gap-1"
                    >
                      <button
                        onClick={() => handleSetCorrect(opt.id)}
                        className={cn(
                          "flex-shrink-0 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all",
                          opt.isCorrect
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-muted-foreground/30 hover:border-emerald-400"
                        )}
                        title={
                          opt.isCorrect
                            ? "Correta"
                            : "Marcar como correta"
                        }
                      >
                        {opt.isCorrect && (
                          <Check className="h-2.5 w-2.5 text-white" />
                        )}
                      </button>
                      <Input
                        value={opt.text}
                        onChange={(e) =>
                          handleUpdateOption(opt.id, {
                            text: e.target.value,
                          })
                        }
                        className="h-6 text-xs rounded-md flex-1"
                        placeholder={`Opção ${String.fromCharCode(
                          65 + idx
                        )}`}
                      />
                      {block.options.length > 2 && (
                        <button
                          onClick={() =>
                            handleRemoveOption(opt.id)
                          }
                          className="flex-shrink-0 p-0.5 rounded hover:bg-destructive/10"
                        >
                          <Trash2 className="h-2.5 w-2.5 text-destructive" />
                        </button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 rounded-md text-[10px] h-6 border-dashed"
                    onClick={handleAddOption}
                  >
                    <Plus className="h-2.5 w-2.5" />
                    Opção
                  </Button>
                </div>

                <Separator className="my-1" />

                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-medium">
                    Feedback
                  </label>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-emerald-600 w-3">
                        ✓
                      </span>
                      <Input
                        value={block.feedback.correct}
                        onChange={(e) =>
                          handleUpdate({
                            feedback: {
                              ...block.feedback,
                              correct: e.target.value,
                            },
                          } as Partial<Block>)
                        }
                        className="h-6 text-xs rounded-md"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-destructive w-3">
                        ✗
                      </span>
                      <Input
                        value={block.feedback.incorrect}
                        onChange={(e) =>
                          handleUpdate({
                            feedback: {
                              ...block.feedback,
                              incorrect: e.target.value,
                            },
                          } as Partial<Block>)
                        }
                        className="h-6 text-xs rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-1" />

                {/* Points value */}
                <FieldRow label="Pontos">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={(block as any).pointsValue ?? 10}
                    onChange={(e) =>
                      handleUpdate({ pointsValue: Number(e.target.value) } as Partial<Block>)
                    }
                    className="h-7 text-xs rounded-md"
                    placeholder="Pontos por acerto"
                  />
                </FieldRow>

                {/* Quiz Settings (course-level) */}
                {project && (
                  <>
                    <Separator className="my-1" />
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-foreground font-medium">
                        ⚙️ Config. Avaliação (Curso)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <FieldRow label="Nota mín.">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={project.quizSettings?.passingScore ?? 70}
                            onChange={(e) => {
                              const store = useEditorStore.getState();
                              const updatedProject = {
                                ...project,
                                quizSettings: {
                                  ...project.quizSettings,
                                  passingScore: Number(e.target.value),
                                },
                              };
                              store.hydrateProject(updatedProject);
                            }}
                            className="h-7 text-xs rounded-md"
                          />
                        </FieldRow>
                        <FieldRow label="Tentativas">
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={project.quizSettings?.maxAttempts ?? 3}
                            onChange={(e) => {
                              const store = useEditorStore.getState();
                              const updatedProject = {
                                ...project,
                                quizSettings: {
                                  ...project.quizSettings,
                                  maxAttempts: Number(e.target.value),
                                },
                              };
                              store.hydrateProject(updatedProject);
                            }}
                            className="h-7 text-xs rounded-md"
                          />
                        </FieldRow>
                      </div>
                    </div>
                  </>
                )}
              </Section>
            )}

            {/* ─── SHAPE PROPERTIES ─── */}
            {block.type === "shape" && (
              <Section
                title="Forma"
                icon={
                  <svg className="h-3 w-3 text-muted-foreground/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                }
              >
                <FieldRow label="Tipo">
                  <select
                    value={(block as any).shapeType || "rectangle"}
                    onChange={(e) =>
                      handleUpdate({ shapeType: e.target.value } as Partial<Block>)
                    }
                    className="w-full h-7 text-xs rounded-md border border-border bg-background px-1.5"
                  >
                    <option value="rectangle">■ Retângulo</option>
                    <option value="circle">● Círculo</option>
                    <option value="rounded-rect">▢ Ret. Arredondado</option>
                    <option value="triangle">▲ Triângulo</option>
                    <option value="star">★ Estrela</option>
                    <option value="arrow">↑ Seta</option>
                    <option value="line">─ Linha</option>
                  </select>
                </FieldRow>
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="Preencher">
                    <input
                      type="color"
                      value={(block as any).fillColor || "#7c3aed"}
                      onChange={(e) =>
                        handleUpdate({ fillColor: e.target.value } as Partial<Block>)
                      }
                      className="w-full h-7 rounded-md border border-border cursor-pointer"
                    />
                  </FieldRow>
                  <FieldRow label="Borda">
                    <input
                      type="color"
                      value={(block as any).strokeColor || "#4f46e5"}
                      onChange={(e) =>
                        handleUpdate({ strokeColor: e.target.value } as Partial<Block>)
                      }
                      className="w-full h-7 rounded-md border border-border cursor-pointer"
                    />
                  </FieldRow>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="Esp. borda">
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={(block as any).strokeWidth ?? 2}
                      onChange={(e) =>
                        handleUpdate({ strokeWidth: Number(e.target.value) } as Partial<Block>)
                      }
                      className="h-7 text-xs rounded-md"
                    />
                  </FieldRow>
                  <FieldRow label="Opacidade">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={(block as any).opacity ?? 1}
                      onChange={(e) =>
                        handleUpdate({ opacity: Number(e.target.value) } as Partial<Block>)
                      }
                      className="h-7 text-xs rounded-md"
                    />
                  </FieldRow>
                </div>
                <FieldRow label="Rotação">
                  <Input
                    type="number"
                    min="0"
                    max="360"
                    step="15"
                    value={(block as any).rotation ?? 0}
                    onChange={(e) =>
                      handleUpdate({ rotation: Number(e.target.value) } as Partial<Block>)
                    }
                    className="h-7 text-xs rounded-md"
                    placeholder="graus"
                  />
                </FieldRow>
              </Section>
            )}

            {/* ─── AUDIO PROPERTIES ─── */}
            {block.type === "audio" && (
              <Section
                title="Áudio"
                icon={
                  <svg className="h-3 w-3 text-muted-foreground/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>
                }
              >
                <input ref={audioInputRef} type="file" accept="audio/*" onChange={(e) => handleMediaUpload(e, "audio/", "src", setIsUploadingAudio)} className="hidden" />

                <Button variant="outline" size="sm" className="w-full gap-2 rounded-lg text-xs h-8" onClick={() => audioInputRef.current?.click()} disabled={isUploadingAudio}>
                  {isUploadingAudio ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  {isUploadingAudio ? "Enviando..." : (block as any).src ? "Trocar Áudio" : "Upload de Áudio"}
                </Button>

                {(block as any).src && (
                  <div className="rounded-lg overflow-hidden border border-slate-200 p-2 bg-slate-50">
                    <audio src={(block as any).src} controls className="w-full h-8" />
                  </div>
                )}

                <FieldRow label="Ou URL">
                  <Input value={(block as any).src || ""} onChange={(e) => handleUpdate({ src: e.target.value })} placeholder="https://... ou /api/uploads/..." className="h-7 text-xs" />
                </FieldRow>

                <FieldRow label="Autoplay">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(block as any).autoplay || false}
                      onChange={(e) => handleUpdate({ autoplay: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-xs text-muted-foreground">Iniciar automaticamente</span>
                  </label>
                </FieldRow>
                <FieldRow label="Loop">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(block as any).loop || false}
                      onChange={(e) => handleUpdate({ loop: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-xs text-muted-foreground">Repetir continuamente</span>
                  </label>
                </FieldRow>
                <FieldRow label="Controles">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(block as any).showControls !== false}
                      onChange={(e) => handleUpdate({ showControls: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-xs text-muted-foreground">Mostrar player</span>
                  </label>
                </FieldRow>
              </Section>
            )}

            {/* ─── TRUE/FALSE PROPERTIES ─── */}
            {block.type === "truefalse" && (
              <Section title="Verdadeiro/Falso" icon={<CheckCircle2 className="h-3 w-3 text-emerald-500" />}>
                <FieldRow label="Afirmação">
                  <Input
                    value={(block as any).statement || ""}
                    onChange={(e) => handleUpdate({ statement: e.target.value } as any)}
                    placeholder="Ex: O céu é azul."
                    className="h-7 text-xs"
                  />
                </FieldRow>
                <FieldRow label="Resposta correta">
                  <select
                    value={(block as any).isTrue ? "true" : "false"}
                    onChange={(e) => handleUpdate({ isTrue: e.target.value === "true" } as any)}
                    className="h-7 text-xs rounded-md border bg-background px-2 w-full"
                  >
                    <option value="true">Verdadeiro</option>
                    <option value="false">Falso</option>
                  </select>
                </FieldRow>
                <FieldRow label="Feedback correto">
                  <Input
                    value={(block as any).feedbackCorrect || ""}
                    onChange={(e) => handleUpdate({ feedbackCorrect: e.target.value } as any)}
                    className="h-7 text-xs"
                  />
                </FieldRow>
                <FieldRow label="Feedback incorreto">
                  <Input
                    value={(block as any).feedbackIncorrect || ""}
                    onChange={(e) => handleUpdate({ feedbackIncorrect: e.target.value } as any)}
                    className="h-7 text-xs"
                  />
                </FieldRow>
                <FieldRow label="Pontos">
                  <Input
                    type="number"
                    min={0}
                    value={(block as any).pointsValue ?? 10}
                    onChange={(e) => handleUpdate({ pointsValue: Number(e.target.value) } as any)}
                    className="h-7 text-xs"
                  />
                </FieldRow>
              </Section>
            )}

            {/* ─── MATCHING PROPERTIES ─── */}
            {block.type === "matching" && (
              <Section title="Liga Pontos" icon={<Link2 className="h-3 w-3 text-blue-500" />}>
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground font-medium">Pares (esquerda → direita):</p>
                  {((block as any).pairs || []).map((pair: any, i: number) => (
                    <div key={pair.id} className="flex items-center gap-1">
                      <Input
                        value={pair.left}
                        onChange={(e) => {
                          const pairs = [...(block as any).pairs];
                          pairs[i] = { ...pairs[i], left: e.target.value };
                          handleUpdate({ pairs } as any);
                        }}
                        className="h-6 text-[10px] flex-1"
                        placeholder="Esquerda"
                      />
                      <span className="text-[9px] text-muted-foreground">→</span>
                      <Input
                        value={pair.right}
                        onChange={(e) => {
                          const pairs = [...(block as any).pairs];
                          pairs[i] = { ...pairs[i], right: e.target.value };
                          handleUpdate({ pairs } as any);
                        }}
                        className="h-6 text-[10px] flex-1"
                        placeholder="Direita"
                      />
                      <button
                        onClick={() => {
                          const pairs = (block as any).pairs.filter((_: any, j: number) => j !== i);
                          handleUpdate({ pairs } as any);
                        }}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >✕</button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-6 text-[10px]"
                    onClick={() => {
                      const pairs = [...((block as any).pairs || []), { id: crypto.randomUUID(), left: "Novo item", right: "Nova definição" }];
                      handleUpdate({ pairs } as any);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Adicionar Par
                  </Button>
                </div>
                <FieldRow label="Embaralhar direita">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={(block as any).shuffleRight !== false} onChange={(e) => handleUpdate({ shuffleRight: e.target.checked } as any)} className="rounded" />
                    <span className="text-xs text-muted-foreground">Sim</span>
                  </label>
                </FieldRow>
                <FieldRow label="Pontos">
                  <Input type="number" min={0} value={(block as any).pointsValue ?? 10} onChange={(e) => handleUpdate({ pointsValue: Number(e.target.value) } as any)} className="h-7 text-xs" />
                </FieldRow>
              </Section>
            )}

            {/* ─── FILL-BLANK PROPERTIES ─── */}
            {block.type === "fillblank" && (
              <Section title="Preencher Lacunas" icon={<PenLine className="h-3 w-3 text-amber-500" />}>
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground font-medium">Segmentos (texto e lacunas):</p>
                  {((block as any).segments || []).map((seg: any, i: number) => (
                    <div key={i} className="flex items-center gap-1">
                      {seg.type === "text" ? (
                        <Input
                          value={seg.content}
                          onChange={(e) => {
                            const segments = [...(block as any).segments];
                            segments[i] = { ...segments[i], content: e.target.value };
                            handleUpdate({ segments } as any);
                          }}
                          className="h-6 text-[10px] flex-1"
                          placeholder="Texto..."
                        />
                      ) : (
                        <div className="flex-1 flex items-center gap-1">
                          <span className="text-[9px] bg-amber-100 text-amber-700 px-1 rounded">LACUNA</span>
                          <Input
                            value={seg.correctAnswer || ""}
                            onChange={(e) => {
                              const segments = [...(block as any).segments];
                              segments[i] = { ...segments[i], correctAnswer: e.target.value };
                              handleUpdate({ segments } as any);
                            }}
                            className="h-6 text-[10px] flex-1"
                            placeholder="Resposta correta"
                          />
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const segments = (block as any).segments.filter((_: any, j: number) => j !== i);
                          handleUpdate({ segments } as any);
                        }}
                        className="text-red-400 hover:text-red-600 text-xs shrink-0"
                      >✕</button>
                    </div>
                  ))}
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-6 text-[10px]"
                      onClick={() => {
                        const segments = [...((block as any).segments || []), { type: "text", content: "texto " }];
                        handleUpdate({ segments } as any);
                      }}
                    >+ Texto</Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-6 text-[10px]"
                      onClick={() => {
                        const segments = [...((block as any).segments || []), { type: "blank", id: crypto.randomUUID(), correctAnswer: "", acceptedVariants: [] }];
                        handleUpdate({ segments } as any);
                      }}
                    >+ Lacuna</Button>
                  </div>
                </div>
                <FieldRow label="Case-sensitive">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={(block as any).caseSensitive || false} onChange={(e) => handleUpdate({ caseSensitive: e.target.checked } as any)} className="rounded" />
                    <span className="text-xs text-muted-foreground">Diferenciar maiúsc./minúsc.</span>
                  </label>
                </FieldRow>
                <FieldRow label="Pontos">
                  <Input type="number" min={0} value={(block as any).pointsValue ?? 10} onChange={(e) => handleUpdate({ pointsValue: Number(e.target.value) } as any)} className="h-7 text-xs" />
                </FieldRow>
              </Section>
            )}

            {/* ─── SORTING PROPERTIES ─── */}
            {block.type === "sorting" && (
              <Section title="Ordenação" icon={<ArrowUpDown className="h-3 w-3 text-purple-500" />}>
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground font-medium">Itens (na ordem correta):</p>
                  {((block as any).items || []).map((item: any, i: number) => (
                    <div key={item.id} className="flex items-center gap-1">
                      <span className="text-[9px] text-purple-400 font-mono w-4">{i + 1}.</span>
                      <Input
                        value={item.content}
                        onChange={(e) => {
                          const items = [...(block as any).items];
                          items[i] = { ...items[i], content: e.target.value };
                          handleUpdate({ items } as any);
                        }}
                        className="h-6 text-[10px] flex-1"
                      />
                      <button
                        onClick={() => {
                          const items = (block as any).items.filter((_: any, j: number) => j !== i);
                          const correctOrder = items.map((it: any) => it.id);
                          handleUpdate({ items, correctOrder } as any);
                        }}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >✕</button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-6 text-[10px]"
                    onClick={() => {
                      const newId = `s${Date.now()}`;
                      const items = [...((block as any).items || []), { id: newId, content: "Novo passo" }];
                      const correctOrder = items.map((it: any) => it.id);
                      handleUpdate({ items, correctOrder } as any);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Adicionar Item
                  </Button>
                </div>
                <FieldRow label="Pontos">
                  <Input type="number" min={0} value={(block as any).pointsValue ?? 10} onChange={(e) => handleUpdate({ pointsValue: Number(e.target.value) } as any)} className="h-7 text-xs" />
                </FieldRow>
              </Section>
            )}

            {/* ─── HOTSPOT PROPERTIES ─── */}
            {block.type === "hotspot" && (
              <Section title="Hotspot" icon={<MousePointer className="h-3 w-3 text-cyan-500" />}>
                <FieldRow label="Imagem">
                  <div className="flex-1 space-y-1.5">
                    <input ref={hotspotImageInputRef} type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, "image/", "imageSrc", setIsUploadingHotspotImage)} className="hidden" />
                    <Button variant="outline" size="sm" className="w-full gap-2 rounded-lg text-[10px] h-7" onClick={() => hotspotImageInputRef.current?.click()} disabled={isUploadingHotspotImage}>
                      {isUploadingHotspotImage ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                      {isUploadingHotspotImage ? "Enviando..." : (block as any).imageSrc ? "Trocar" : "Upload"}
                    </Button>
                    <Input value={(block as any).imageSrc || ""} onChange={(e) => handleUpdate({ imageSrc: e.target.value } as any)} placeholder="Ou cole a URL..." className="h-6 text-[10px]" />
                  </div>
                </FieldRow>
                <FieldRow label="Modo">
                  <select
                    value={(block as any).mode || "explore"}
                    onChange={(e) => handleUpdate({ mode: e.target.value } as any)}
                    className="h-7 text-xs rounded-md border bg-background px-2 w-full"
                  >
                    <option value="explore">🔍 Explorar (informativo)</option>
                    <option value="quiz">🎯 Quiz (pontuação)</option>
                  </select>
                </FieldRow>
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground font-medium">Pontos ({((block as any).spots || []).length}):</p>
                  {((block as any).spots || []).map((spot: any, i: number) => (
                    <div key={spot.id} className="p-1.5 rounded border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1">
                        <Input value={spot.label} onChange={(e) => { const spots = [...(block as any).spots]; spots[i] = { ...spots[i], label: e.target.value }; handleUpdate({ spots } as any); }} className="h-5 text-[9px] flex-1" placeholder="Label" />
                        <button onClick={() => { handleUpdate({ spots: (block as any).spots.filter((_: any, j: number) => j !== i) } as any); }} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                      </div>
                      <div className="flex gap-1">
                        <Input type="number" min={0} max={100} value={spot.x} onChange={(e) => { const spots = [...(block as any).spots]; spots[i] = { ...spots[i], x: Number(e.target.value) }; handleUpdate({ spots } as any); }} className="h-5 text-[9px]" placeholder="X%" />
                        <Input type="number" min={0} max={100} value={spot.y} onChange={(e) => { const spots = [...(block as any).spots]; spots[i] = { ...spots[i], y: Number(e.target.value) }; handleUpdate({ spots } as any); }} className="h-5 text-[9px]" placeholder="Y%" />
                        <Input type="number" min={1} max={20} value={spot.radius} onChange={(e) => { const spots = [...(block as any).spots]; spots[i] = { ...spots[i], radius: Number(e.target.value) }; handleUpdate({ spots } as any); }} className="h-5 text-[9px]" placeholder="R" />
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-6 text-[10px]"
                    onClick={() => {
                      const spots = [...((block as any).spots || []), { id: crypto.randomUUID(), x: 50, y: 50, radius: 8, label: `Ponto ${((block as any).spots || []).length + 1}`, content: "Descrição", isCorrect: false }];
                      handleUpdate({ spots } as any);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Adicionar Ponto
                  </Button>
                </div>
                <FieldRow label="Pontos">
                  <Input type="number" min={0} value={(block as any).pointsValue ?? 10} onChange={(e) => handleUpdate({ pointsValue: Number(e.target.value) } as any)} className="h-7 text-xs" />
                </FieldRow>
              </Section>
            )}

            {/* ─── ACCORDION PROPERTIES ─── */}
            {block.type === "accordion" && (
              <Section title="Accordion" icon={<ChevronDown className="h-3 w-3 text-slate-500" />}>
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground font-medium">Seções:</p>
                  {((block as any).sections || []).map((section: any, i: number) => (
                    <div key={section.id} className="p-1.5 rounded border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1">
                        <Input
                          value={section.title}
                          onChange={(e) => { const sections = [...(block as any).sections]; sections[i] = { ...sections[i], title: e.target.value }; handleUpdate({ sections } as any); }}
                          className="h-5 text-[9px] flex-1 font-medium"
                          placeholder="Título"
                        />
                        <button onClick={() => { handleUpdate({ sections: (block as any).sections.filter((_: any, j: number) => j !== i) } as any); }} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                      </div>
                      <Input
                        value={section.content}
                        onChange={(e) => { const sections = [...(block as any).sections]; sections[i] = { ...sections[i], content: e.target.value }; handleUpdate({ sections } as any); }}
                        className="h-5 text-[9px]"
                        placeholder="Conteúdo..."
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-6 text-[10px]"
                    onClick={() => {
                      const sections = [...((block as any).sections || []), { id: crypto.randomUUID(), title: "Nova Seção", content: "Conteúdo" }];
                      handleUpdate({ sections } as any);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Adicionar Seção
                  </Button>
                </div>
                <FieldRow label="Múltiplos abertos">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={(block as any).allowMultipleOpen || false} onChange={(e) => handleUpdate({ allowMultipleOpen: e.target.checked } as any)} className="rounded" />
                    <span className="text-xs text-muted-foreground">Permitir</span>
                  </label>
                </FieldRow>
                <FieldRow label="Estilo">
                  <select value={(block as any).style || "boxed"} onChange={(e) => handleUpdate({ style: e.target.value } as any)} className="h-7 text-xs rounded-md border bg-background px-2 w-full">
                    <option value="minimal">Minimal</option>
                    <option value="boxed">Boxed</option>
                    <option value="bordered">Bordered</option>
                  </select>
                </FieldRow>
              </Section>
            )}

            {/* ─── TABS PROPERTIES ─── */}
            {block.type === "tabs" && (
              <Section title="Tabs" icon={<PanelTop className="h-3 w-3 text-indigo-500" />}>
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground font-medium">Abas:</p>
                  {((block as any).tabs || []).map((tab: any, i: number) => (
                    <div key={tab.id} className="p-1.5 rounded border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1">
                        <Input
                          value={tab.label}
                          onChange={(e) => { const tabs = [...(block as any).tabs]; tabs[i] = { ...tabs[i], label: e.target.value }; handleUpdate({ tabs } as any); }}
                          className="h-5 text-[9px] flex-1 font-medium"
                          placeholder="Label"
                        />
                        <button onClick={() => { handleUpdate({ tabs: (block as any).tabs.filter((_: any, j: number) => j !== i) } as any); }} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                      </div>
                      <Input
                        value={tab.content}
                        onChange={(e) => { const tabs = [...(block as any).tabs]; tabs[i] = { ...tabs[i], content: e.target.value }; handleUpdate({ tabs } as any); }}
                        className="h-5 text-[9px]"
                        placeholder="Conteúdo..."
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-6 text-[10px]"
                    onClick={() => {
                      const tabs = [...((block as any).tabs || []), { id: crypto.randomUUID(), label: "Nova Aba", content: "Conteúdo" }];
                      handleUpdate({ tabs } as any);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Adicionar Aba
                  </Button>
                </div>
                <FieldRow label="Orientação">
                  <select value={(block as any).orientation || "horizontal"} onChange={(e) => handleUpdate({ orientation: e.target.value } as any)} className="h-7 text-xs rounded-md border bg-background px-2 w-full">
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                  </select>
                </FieldRow>
                <FieldRow label="Estilo">
                  <select value={(block as any).style || "underline"} onChange={(e) => handleUpdate({ style: e.target.value } as any)} className="h-7 text-xs rounded-md border bg-background px-2 w-full">
                    <option value="underline">Underline</option>
                    <option value="boxed">Boxed</option>
                    <option value="pills">Pills</option>
                  </select>
                </FieldRow>
              </Section>
            )}

            {/* ─── BRANCHING PROPERTIES ─── */}
            {block.type === "branching" && (
              <Section title="Cenário de Decisão" icon={<GitBranch className="h-3 w-3 text-rose-500" />}>
                <FieldRow label="Cenário">
                  <Input value={(block as any).scenario || ""} onChange={(e) => handleUpdate({ scenario: e.target.value } as any)} className="h-7 text-xs" placeholder="Descreva a situação..." />
                </FieldRow>
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground font-medium">Escolhas:</p>
                  {((block as any).choices || []).map((choice: any, i: number) => (
                    <div key={choice.id} className="p-1.5 rounded border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1">
                        <Input value={choice.text} onChange={(e) => { const choices = [...(block as any).choices]; choices[i] = { ...choices[i], text: e.target.value }; handleUpdate({ choices } as any); }} className="h-5 text-[9px] flex-1" placeholder="Texto da escolha" />
                        <label className="flex items-center gap-1 shrink-0" title="Correta">
                          <input type="checkbox" checked={choice.isCorrect || false} onChange={(e) => { const choices = [...(block as any).choices]; choices[i] = { ...choices[i], isCorrect: e.target.checked }; handleUpdate({ choices } as any); }} className="rounded" />
                          <span className="text-[8px]">✓</span>
                        </label>
                        <button onClick={() => { handleUpdate({ choices: (block as any).choices.filter((_: any, j: number) => j !== i) } as any); }} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                      </div>
                      <Input value={choice.feedback} onChange={(e) => { const choices = [...(block as any).choices]; choices[i] = { ...choices[i], feedback: e.target.value }; handleUpdate({ choices } as any); }} className="h-5 text-[8px]" placeholder="Feedback..." />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full h-6 text-[10px]" onClick={() => { const choices = [...((block as any).choices || []), { id: crypto.randomUUID(), text: "Nova opção", targetSlideId: "", feedback: "Feedback", isCorrect: false }]; handleUpdate({ choices } as any); }}>
                    <Plus className="h-3 w-3 mr-1" /> Adicionar Escolha
                  </Button>
                </div>
                <FieldRow label="Pontos">
                  <Input type="number" min={0} value={(block as any).pointsValue ?? 10} onChange={(e) => handleUpdate({ pointsValue: Number(e.target.value) } as any)} className="h-7 text-xs" />
                </FieldRow>
              </Section>
            )}

            {/* ─── TIMELINE PROPERTIES ─── */}
            {block.type === "timeline" && (
              <Section title="Linha do Tempo" icon={<Clock className="h-3 w-3 text-sky-500" />}>
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground font-medium">Eventos:</p>
                  {((block as any).events || []).map((event: any, i: number) => (
                    <div key={event.id} className="p-1.5 rounded border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1">
                        <Input value={event.icon || ""} onChange={(e) => { const events = [...(block as any).events]; events[i] = { ...events[i], icon: e.target.value }; handleUpdate({ events } as any); }} className="h-5 text-[9px] w-8" placeholder="🎯" />
                        <Input value={event.date} onChange={(e) => { const events = [...(block as any).events]; events[i] = { ...events[i], date: e.target.value }; handleUpdate({ events } as any); }} className="h-5 text-[9px] w-16" placeholder="Data" />
                        <Input value={event.title} onChange={(e) => { const events = [...(block as any).events]; events[i] = { ...events[i], title: e.target.value }; handleUpdate({ events } as any); }} className="h-5 text-[9px] flex-1" placeholder="Título" />
                        <button onClick={() => { handleUpdate({ events: (block as any).events.filter((_: any, j: number) => j !== i) } as any); }} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                      </div>
                      <Input value={event.description} onChange={(e) => { const events = [...(block as any).events]; events[i] = { ...events[i], description: e.target.value }; handleUpdate({ events } as any); }} className="h-5 text-[8px]" placeholder="Descrição..." />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full h-6 text-[10px]" onClick={() => { const events = [...((block as any).events || []), { id: crypto.randomUUID(), date: "2025", title: "Novo evento", description: "", icon: "📌" }]; handleUpdate({ events } as any); }}>
                    <Plus className="h-3 w-3 mr-1" /> Adicionar Evento
                  </Button>
                </div>
                <FieldRow label="Orientação">
                  <select value={(block as any).orientation || "horizontal"} onChange={(e) => handleUpdate({ orientation: e.target.value } as any)} className="h-7 text-xs rounded-md border bg-background px-2 w-full">
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                  </select>
                </FieldRow>
                <FieldRow label="Estilo">
                  <select value={(block as any).style || "detailed"} onChange={(e) => handleUpdate({ style: e.target.value } as any)} className="h-7 text-xs rounded-md border bg-background px-2 w-full">
                    <option value="minimal">Minimal</option>
                    <option value="detailed">Detailed</option>
                    <option value="cards">Cards</option>
                  </select>
                </FieldRow>
              </Section>
            )}

            {/* ─── DRAG & DROP PROPERTIES ─── */}
            {block.type === "dragdrop" && (
              <Section title="Drag & Drop" icon={<GripVertical className="h-3 w-3 text-teal-500" />}>
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground font-medium">Categorias:</p>
                  {((block as any).categories || []).map((cat: any, i: number) => (
                    <div key={cat.id} className="flex items-center gap-1">
                      <Input value={cat.label} onChange={(e) => { const categories = [...(block as any).categories]; categories[i] = { ...categories[i], label: e.target.value }; handleUpdate({ categories } as any); }} className="h-6 text-[10px] flex-1" placeholder="Categoria" />
                      <button onClick={() => { handleUpdate({ categories: (block as any).categories.filter((_: any, j: number) => j !== i) } as any); }} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full h-6 text-[10px]" onClick={() => { const categories = [...((block as any).categories || []), { id: crypto.randomUUID(), label: "Nova Categoria" }]; handleUpdate({ categories } as any); }}>
                    <Plus className="h-3 w-3 mr-1" /> Adicionar Categoria
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  <p className="text-[10px] text-muted-foreground font-medium">Itens:</p>
                  {((block as any).items || []).map((item: any, i: number) => (
                    <div key={item.id} className="flex items-center gap-1">
                      <Input value={item.content} onChange={(e) => { const items = [...(block as any).items]; items[i] = { ...items[i], content: e.target.value }; handleUpdate({ items } as any); }} className="h-6 text-[10px] flex-1" placeholder="Item" />
                      <select value={item.correctCategoryId} onChange={(e) => { const items = [...(block as any).items]; items[i] = { ...items[i], correctCategoryId: e.target.value }; handleUpdate({ items } as any); }} className="h-6 text-[8px] rounded border bg-background px-1 w-24">
                        <option value="">Categoria...</option>
                        {((block as any).categories || []).map((cat: any) => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                      <button onClick={() => { handleUpdate({ items: (block as any).items.filter((_: any, j: number) => j !== i) } as any); }} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full h-6 text-[10px]" onClick={() => { const items = [...((block as any).items || []), { id: crypto.randomUUID(), content: "Novo Item", correctCategoryId: "" }]; handleUpdate({ items } as any); }}>
                    <Plus className="h-3 w-3 mr-1" /> Adicionar Item
                  </Button>
                </div>
                <FieldRow label="Pontos">
                  <Input type="number" min={0} value={(block as any).pointsValue ?? 10} onChange={(e) => handleUpdate({ pointsValue: Number(e.target.value) } as any)} className="h-7 text-xs" />
                </FieldRow>
              </Section>
            )}

            {block.type === "interactiveVideo" && (
              <Section title="🎬 Vídeo Interativo" icon={<Play className="h-3 w-3 text-purple-500" />}>
                <div className="space-y-3">
                  {/* Video Source */}
                  <FieldRow label="Vídeo">
                    <div className="flex-1 space-y-1.5">
                      <input ref={interactiveVideoInputRef} type="file" accept="video/*" onChange={(e) => handleMediaUpload(e, "video/", "src", setIsUploadingInteractiveVideo)} className="hidden" />
                      <Button variant="outline" size="sm" className="w-full gap-2 rounded-lg text-[10px] h-7" onClick={() => interactiveVideoInputRef.current?.click()} disabled={isUploadingInteractiveVideo}>
                        {isUploadingInteractiveVideo ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                        {isUploadingInteractiveVideo ? "Enviando..." : (block as any).src ? "Trocar" : "Upload"}
                      </Button>
                      <Input value={(block as any).src || ""} onChange={(e) => handleUpdate({ src: e.target.value } as any)} className="h-6 text-[10px]" placeholder="Ou cole URL..." />
                    </div>
                  </FieldRow>
                  <FieldRow label="Poster">
                    <div className="flex-1 space-y-1.5">
                      <input ref={interactiveVideoPosterInputRef} type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, "image/", "poster", setIsUploadingPoster)} className="hidden" />
                      <Button variant="outline" size="sm" className="w-full gap-2 rounded-lg text-[10px] h-7" onClick={() => interactiveVideoPosterInputRef.current?.click()} disabled={isUploadingPoster}>
                        {isUploadingPoster ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImageUp className="h-3 w-3" />}
                        {isUploadingPoster ? "Enviando..." : (block as any).poster ? "Trocar" : "Upload"}
                      </Button>
                      <Input value={(block as any).poster || ""} onChange={(e) => handleUpdate({ poster: e.target.value } as any)} className="h-6 text-[10px]" placeholder="Ou cole URL..." />
                    </div>
                  </FieldRow>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1.5 text-[10px]">
                      <input type="checkbox" checked={(block as any).autoplay || false} onChange={(e) => handleUpdate({ autoplay: e.target.checked } as any)} className="rounded" />
                      Autoplay
                    </label>
                    <label className="flex items-center gap-1.5 text-[10px]">
                      <input type="checkbox" checked={(block as any).loop || false} onChange={(e) => handleUpdate({ loop: e.target.checked } as any)} className="rounded" />
                      Loop
                    </label>
                  </div>

                  <Separator />

                  {/* Chapters */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-semibold text-purple-700">📑 Chapters</p>
                      <Button variant="outline" size="sm" className="h-5 text-[9px] px-1.5" onClick={() => {
                        const chapters = [...((block as any).chapters || []), { id: crypto.randomUUID(), time: 0, title: "Novo Chapter", description: "" }];
                        handleUpdate({ chapters } as any);
                      }}>
                        <Plus className="h-2.5 w-2.5 mr-0.5" /> Add
                      </Button>
                    </div>
                    {((block as any).chapters || []).map((ch: any, i: number) => (
                      <div key={ch.id} className="bg-purple-50/50 rounded-lg p-2 mb-1 space-y-1">
                        <div className="flex gap-1">
                          <Input type="number" min={0} value={ch.time} onChange={(e) => { const chapters = [...(block as any).chapters]; chapters[i] = { ...chapters[i], time: Number(e.target.value) }; handleUpdate({ chapters } as any); }} className="h-5 text-[9px] w-14" placeholder="seg" />
                          <Input value={ch.title} onChange={(e) => { const chapters = [...(block as any).chapters]; chapters[i] = { ...chapters[i], title: e.target.value }; handleUpdate({ chapters } as any); }} className="h-5 text-[9px] flex-1" placeholder="Título" />
                          <button onClick={() => handleUpdate({ chapters: (block as any).chapters.filter((_: any, j: number) => j !== i) } as any)} className="text-red-400 text-xs">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Quiz Points */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-semibold text-purple-700">❓ Quiz Points</p>
                      <Button variant="outline" size="sm" className="h-5 text-[9px] px-1.5" onClick={() => {
                        const quizPoints = [...((block as any).quizPoints || []), { id: crypto.randomUUID(), time: 10, question: "Pergunta?", options: ["Opção A", "Opção B"], correctIndex: 0, pointsValue: 10 }];
                        handleUpdate({ quizPoints } as any);
                      }}>
                        <Plus className="h-2.5 w-2.5 mr-0.5" /> Add
                      </Button>
                    </div>
                    {((block as any).quizPoints || []).map((qp: any, i: number) => (
                      <div key={qp.id} className="bg-rose-50/50 rounded-lg p-2 mb-1 space-y-1">
                        <div className="flex gap-1">
                          <Input type="number" min={0} value={qp.time} onChange={(e) => { const quizPoints = [...(block as any).quizPoints]; quizPoints[i] = { ...quizPoints[i], time: Number(e.target.value) }; handleUpdate({ quizPoints } as any); }} className="h-5 text-[9px] w-14" placeholder="seg" />
                          <Input value={qp.question} onChange={(e) => { const quizPoints = [...(block as any).quizPoints]; quizPoints[i] = { ...quizPoints[i], question: e.target.value }; handleUpdate({ quizPoints } as any); }} className="h-5 text-[9px] flex-1" placeholder="Pergunta" />
                          <button onClick={() => handleUpdate({ quizPoints: (block as any).quizPoints.filter((_: any, j: number) => j !== i) } as any)} className="text-red-400 text-xs">✕</button>
                        </div>
                        <div className="flex gap-1">
                          <Input value={(qp.options || []).join(", ")} onChange={(e) => { const quizPoints = [...(block as any).quizPoints]; quizPoints[i] = { ...quizPoints[i], options: e.target.value.split(", ") }; handleUpdate({ quizPoints } as any); }} className="h-5 text-[8px] flex-1" placeholder="Opções (separadas por , )" />
                          <Input type="number" min={0} value={qp.correctIndex} onChange={(e) => { const quizPoints = [...(block as any).quizPoints]; quizPoints[i] = { ...quizPoints[i], correctIndex: Number(e.target.value) }; handleUpdate({ quizPoints } as any); }} className="h-5 text-[9px] w-10" placeholder="Idx" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Bookmarks */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-semibold text-purple-700">🔖 Bookmarks</p>
                      <Button variant="outline" size="sm" className="h-5 text-[9px] px-1.5" onClick={() => {
                        const bookmarks = [...((block as any).bookmarks || []), { id: crypto.randomUUID(), time: 0, label: "Bookmark" }];
                        handleUpdate({ bookmarks } as any);
                      }}>
                        <Plus className="h-2.5 w-2.5 mr-0.5" /> Add
                      </Button>
                    </div>
                    {((block as any).bookmarks || []).map((bm: any, i: number) => (
                      <div key={bm.id} className="flex gap-1 mb-1">
                        <Input type="number" min={0} value={bm.time} onChange={(e) => { const bookmarks = [...(block as any).bookmarks]; bookmarks[i] = { ...bookmarks[i], time: Number(e.target.value) }; handleUpdate({ bookmarks } as any); }} className="h-5 text-[9px] w-14" placeholder="seg" />
                        <Input value={bm.label} onChange={(e) => { const bookmarks = [...(block as any).bookmarks]; bookmarks[i] = { ...bookmarks[i], label: e.target.value }; handleUpdate({ bookmarks } as any); }} className="h-5 text-[9px] flex-1" placeholder="Label" />
                        <button onClick={() => handleUpdate({ bookmarks: (block as any).bookmarks.filter((_: any, j: number) => j !== i) } as any)} className="text-red-400 text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>
            )}

            {/* ─── LABELED GRAPHIC ─── */}
            {block.type === "labeled-graphic" && (
              <Section title="Imagem Interativa" icon={<MousePointer className="h-3 w-3 text-cyan-500" />}>
                <FieldRow label="Imagem">
                  <Input value={(block as any).backgroundImage || ""} onChange={(e) => handleUpdate({ backgroundImage: e.target.value } as any)} className="h-7 text-xs" placeholder="URL da imagem de fundo" />
                </FieldRow>
                <FieldRow label="Estilo">
                  <select value={(block as any).markerStyle || "pin"} onChange={(e) => handleUpdate({ markerStyle: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="pin">Pin</option>
                    <option value="numbered">Numerado</option>
                    <option value="icon">Ícone</option>
                  </select>
                </FieldRow>
                <FieldRow label="Cor">
                  <Input type="color" value={(block as any).markerColor || "#7C3AED"} onChange={(e) => handleUpdate({ markerColor: e.target.value } as any)} className="h-7 w-14" />
                </FieldRow>
                <FieldRow label="Popup">
                  <select value={(block as any).popupPosition || "auto"} onChange={(e) => handleUpdate({ popupPosition: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="auto">Auto</option>
                    <option value="top">Topo</option>
                    <option value="bottom">Baixo</option>
                    <option value="left">Esquerda</option>
                    <option value="right">Direita</option>
                  </select>
                </FieldRow>
                <Separator />
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-cyan-700">Marcadores</p>
                  <Button variant="outline" size="sm" className="h-5 text-[9px] px-1.5" onClick={() => {
                    const markers = [...((block as any).markers || []), { id: crypto.randomUUID(), x: 50, y: 50, label: "Novo ponto", content: "Descrição", icon: "pin", image: "" }];
                    handleUpdate({ markers } as any);
                  }}>
                    <Plus className="h-2.5 w-2.5 mr-0.5" /> Add
                  </Button>
                </div>
                {((block as any).markers || []).map((m: any, i: number) => (
                  <div key={m.id} className="bg-cyan-50/50 rounded-lg p-2 mb-1 space-y-1">
                    <div className="flex gap-1">
                      <Input value={m.label} onChange={(e) => { const markers = [...(block as any).markers]; markers[i] = { ...markers[i], label: e.target.value }; handleUpdate({ markers } as any); }} className="h-5 text-[9px] flex-1" placeholder="Label" />
                      <button onClick={() => handleUpdate({ markers: (block as any).markers.filter((_: any, j: number) => j !== i) } as any)} className="text-red-400 text-xs">✕</button>
                    </div>
                    <Input value={m.content} onChange={(e) => { const markers = [...(block as any).markers]; markers[i] = { ...markers[i], content: e.target.value }; handleUpdate({ markers } as any); }} className="h-5 text-[9px]" placeholder="Conteúdo" />
                    <div className="flex gap-1">
                      <Input type="number" min={0} max={100} value={m.x} onChange={(e) => { const markers = [...(block as any).markers]; markers[i] = { ...markers[i], x: Number(e.target.value) }; handleUpdate({ markers } as any); }} className="h-5 text-[9px] w-16" placeholder="X %" />
                      <Input type="number" min={0} max={100} value={m.y} onChange={(e) => { const markers = [...(block as any).markers]; markers[i] = { ...markers[i], y: Number(e.target.value) }; handleUpdate({ markers } as any); }} className="h-5 text-[9px] w-16" placeholder="Y %" />
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {/* ─── PROCESS ─── */}
            {block.type === "process" && (
              <Section title="Processo" icon={<Layers className="h-3 w-3 text-emerald-500" />}>
                <FieldRow label="Layout">
                  <select value={(block as any).layout || "horizontal"} onChange={(e) => handleUpdate({ layout: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                  </select>
                </FieldRow>
                <FieldRow label="Estilo">
                  <select value={(block as any).style || "numbered"} onChange={(e) => handleUpdate({ style: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="numbered">Numerado</option>
                    <option value="icon">Ícone</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </FieldRow>
                <FieldRow label="Conector">
                  <select value={(block as any).connectorStyle || "arrow"} onChange={(e) => handleUpdate({ connectorStyle: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="line">Linha</option>
                    <option value="arrow">Seta</option>
                    <option value="dashed">Tracejado</option>
                  </select>
                </FieldRow>
                <FieldRow label="Cor">
                  <Input type="color" value={(block as any).activeColor || "#7C3AED"} onChange={(e) => handleUpdate({ activeColor: e.target.value } as any)} className="h-7 w-14" />
                </FieldRow>
                <label className="flex items-center gap-1.5 text-[10px]">
                  <input type="checkbox" checked={(block as any).interactive ?? true} onChange={(e) => handleUpdate({ interactive: e.target.checked } as any)} className="rounded" />
                  Interativo
                </label>
                <Separator />
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-emerald-700">Etapas</p>
                  <Button variant="outline" size="sm" className="h-5 text-[9px] px-1.5" onClick={() => {
                    const steps = [...((block as any).steps || []), { id: crypto.randomUUID(), title: "Nova Etapa", content: "Descrição", image: "", icon: "" }];
                    handleUpdate({ steps } as any);
                  }}>
                    <Plus className="h-2.5 w-2.5 mr-0.5" /> Add
                  </Button>
                </div>
                {((block as any).steps || []).map((step: any, i: number) => (
                  <div key={step.id} className="bg-emerald-50/50 rounded-lg p-2 mb-1 space-y-1">
                    <div className="flex gap-1">
                      <Input value={step.title} onChange={(e) => { const steps = [...(block as any).steps]; steps[i] = { ...steps[i], title: e.target.value }; handleUpdate({ steps } as any); }} className="h-5 text-[9px] flex-1" placeholder="Título" />
                      <button onClick={() => handleUpdate({ steps: (block as any).steps.filter((_: any, j: number) => j !== i) } as any)} className="text-red-400 text-xs">✕</button>
                    </div>
                    <Input value={step.content} onChange={(e) => { const steps = [...(block as any).steps]; steps[i] = { ...steps[i], content: e.target.value }; handleUpdate({ steps } as any); }} className="h-5 text-[9px]" placeholder="Conteúdo" />
                  </div>
                ))}
              </Section>
            )}

            {/* ─── LIGHTBOX ─── */}
            {block.type === "lightbox" && (
              <Section title="Lightbox" icon={<Maximize2 className="h-3 w-3 text-violet-500" />}>
                <FieldRow label="Trigger">
                  <select value={(block as any).triggerType || "button"} onChange={(e) => handleUpdate({ triggerType: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="button">Botão</option>
                    <option value="image">Imagem</option>
                  </select>
                </FieldRow>
                <FieldRow label="Label">
                  <Input value={(block as any).triggerLabel || ""} onChange={(e) => handleUpdate({ triggerLabel: e.target.value } as any)} className="h-7 text-xs" placeholder="Texto do botão" />
                </FieldRow>
                <FieldRow label="Título">
                  <Input value={(block as any).modalTitle || ""} onChange={(e) => handleUpdate({ modalTitle: e.target.value } as any)} className="h-7 text-xs" placeholder="Título do modal" />
                </FieldRow>
                <FieldRow label="Conteúdo">
                  <textarea value={(block as any).modalContent || ""} onChange={(e) => handleUpdate({ modalContent: e.target.value } as any)} className="w-full text-xs rounded border border-slate-200 p-2 min-h-[60px]" placeholder="Conteúdo do modal" />
                </FieldRow>
                <FieldRow label="Imagem">
                  <Input value={(block as any).modalImage || ""} onChange={(e) => handleUpdate({ modalImage: e.target.value } as any)} className="h-7 text-xs" placeholder="URL da imagem" />
                </FieldRow>
                <FieldRow label="Vídeo">
                  <Input value={(block as any).modalVideo || ""} onChange={(e) => handleUpdate({ modalVideo: e.target.value } as any)} className="h-7 text-xs" placeholder="URL do vídeo" />
                </FieldRow>
                <FieldRow label="Largura">
                  <select value={(block as any).modalWidth || "medium"} onChange={(e) => handleUpdate({ modalWidth: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="small">Pequeno</option>
                    <option value="medium">Médio</option>
                    <option value="large">Grande</option>
                  </select>
                </FieldRow>
                <FieldRow label="Overlay">
                  <Input value={(block as any).overlayColor || "rgba(0,0,0,0.5)"} onChange={(e) => handleUpdate({ overlayColor: e.target.value } as any)} className="h-7 text-xs" placeholder="rgba(0,0,0,0.5)" />
                </FieldRow>
              </Section>
            )}

            {/* ─── QUOTE ─── */}
            {block.type === "quote" && (
              <Section title="Citação" icon={<Type className="h-3 w-3 text-amber-500" />}>
                <FieldRow label="Texto">
                  <textarea value={(block as any).text || ""} onChange={(e) => handleUpdate({ text: e.target.value } as any)} className="w-full text-xs rounded border border-slate-200 p-2 min-h-[60px]" placeholder="Texto da citação" />
                </FieldRow>
                <FieldRow label="Autor">
                  <Input value={(block as any).author || ""} onChange={(e) => handleUpdate({ author: e.target.value } as any)} className="h-7 text-xs" placeholder="Nome do autor" />
                </FieldRow>
                <FieldRow label="Cargo">
                  <Input value={(block as any).authorTitle || ""} onChange={(e) => handleUpdate({ authorTitle: e.target.value } as any)} className="h-7 text-xs" placeholder="Cargo/título" />
                </FieldRow>
                <FieldRow label="Foto">
                  <Input value={(block as any).authorImage || ""} onChange={(e) => handleUpdate({ authorImage: e.target.value } as any)} className="h-7 text-xs" placeholder="URL da foto" />
                </FieldRow>
                <FieldRow label="Estilo">
                  <select value={(block as any).quoteStyle || "modern"} onChange={(e) => handleUpdate({ quoteStyle: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="classic">Clássico</option>
                    <option value="modern">Moderno</option>
                    <option value="callout">Callout</option>
                    <option value="speech-bubble">Balão</option>
                  </select>
                </FieldRow>
                <FieldRow label="Cor">
                  <Input type="color" value={(block as any).accentColor || "#7C3AED"} onChange={(e) => handleUpdate({ accentColor: e.target.value } as any)} className="h-7 w-14" />
                </FieldRow>
                <FieldRow label="Alinhamento">
                  <select value={(block as any).alignment || "left"} onChange={(e) => handleUpdate({ alignment: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="left">Esquerda</option>
                    <option value="center">Centro</option>
                  </select>
                </FieldRow>
              </Section>
            )}

            {/* ─── DOWNLOAD ─── */}
            {block.type === "download" && (
              <Section title="Downloads" icon={<Layers className="h-3 w-3 text-blue-500" />}>
                <FieldRow label="Estilo">
                  <select value={(block as any).downloadStyle || "card"} onChange={(e) => handleUpdate({ downloadStyle: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="list">Lista</option>
                    <option value="card">Card</option>
                    <option value="button">Botão</option>
                  </select>
                </FieldRow>
                <Separator />
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-blue-700">Arquivos</p>
                  <Button variant="outline" size="sm" className="h-5 text-[9px] px-1.5" onClick={() => {
                    const files = [...((block as any).files || []), { id: crypto.randomUUID(), name: "arquivo.pdf", url: "", size: 0, fileType: "pdf", description: "" }];
                    handleUpdate({ files } as any);
                  }}>
                    <Plus className="h-2.5 w-2.5 mr-0.5" /> Add
                  </Button>
                </div>
                {((block as any).files || []).map((file: any, i: number) => (
                  <div key={file.id} className="bg-blue-50/50 rounded-lg p-2 mb-1 space-y-1">
                    <div className="flex gap-1">
                      <Input value={file.name} onChange={(e) => { const files = [...(block as any).files]; files[i] = { ...files[i], name: e.target.value }; handleUpdate({ files } as any); }} className="h-5 text-[9px] flex-1" placeholder="Nome" />
                      <button onClick={() => handleUpdate({ files: (block as any).files.filter((_: any, j: number) => j !== i) } as any)} className="text-red-400 text-xs">✕</button>
                    </div>
                    <Input value={file.url} onChange={(e) => { const files = [...(block as any).files]; files[i] = { ...files[i], url: e.target.value }; handleUpdate({ files } as any); }} className="h-5 text-[9px]" placeholder="URL do arquivo" />
                    <Input value={file.description || ""} onChange={(e) => { const files = [...(block as any).files]; files[i] = { ...files[i], description: e.target.value }; handleUpdate({ files } as any); }} className="h-5 text-[9px]" placeholder="Descrição" />
                  </div>
                ))}
              </Section>
            )}

            {/* ─── COUNTER ─── */}
            {block.type === "counter" && (
              <Section title="Contador" icon={<Layers className="h-3 w-3 text-red-500" />}>
                <FieldRow label="Layout">
                  <select value={(block as any).layout || "row"} onChange={(e) => handleUpdate({ layout: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="row">Linha</option>
                    <option value="grid">Grid</option>
                  </select>
                </FieldRow>
                <FieldRow label="Estilo">
                  <select value={(block as any).counterStyle || "card"} onChange={(e) => handleUpdate({ counterStyle: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="card">Card</option>
                    <option value="minimal">Minimal</option>
                    <option value="circle">Círculo</option>
                  </select>
                </FieldRow>
                <FieldRow label="Duração">
                  <Input type="number" min={0.5} max={10} step={0.5} value={(block as any).animationDuration || 2} onChange={(e) => handleUpdate({ animationDuration: Number(e.target.value) } as any)} className="h-7 text-xs" />
                </FieldRow>
                <Separator />
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-red-700">Itens</p>
                  <Button variant="outline" size="sm" className="h-5 text-[9px] px-1.5" onClick={() => {
                    const items = [...((block as any).items || []), { id: crypto.randomUUID(), value: 0, prefix: "", suffix: "", label: "Novo", icon: "", color: "#7C3AED" }];
                    handleUpdate({ items } as any);
                  }}>
                    <Plus className="h-2.5 w-2.5 mr-0.5" /> Add
                  </Button>
                </div>
                {((block as any).items || []).map((item: any, i: number) => (
                  <div key={item.id} className="bg-red-50/50 rounded-lg p-2 mb-1 space-y-1">
                    <div className="flex gap-1">
                      <Input type="number" value={item.value} onChange={(e) => { const items = [...(block as any).items]; items[i] = { ...items[i], value: Number(e.target.value) }; handleUpdate({ items } as any); }} className="h-5 text-[9px] w-16" placeholder="Valor" />
                      <Input value={item.label} onChange={(e) => { const items = [...(block as any).items]; items[i] = { ...items[i], label: e.target.value }; handleUpdate({ items } as any); }} className="h-5 text-[9px] flex-1" placeholder="Label" />
                      <button onClick={() => handleUpdate({ items: (block as any).items.filter((_: any, j: number) => j !== i) } as any)} className="text-red-400 text-xs">✕</button>
                    </div>
                    <div className="flex gap-1">
                      <Input value={item.prefix || ""} onChange={(e) => { const items = [...(block as any).items]; items[i] = { ...items[i], prefix: e.target.value }; handleUpdate({ items } as any); }} className="h-5 text-[9px] w-12" placeholder="Pre" />
                      <Input value={item.suffix || ""} onChange={(e) => { const items = [...(block as any).items]; items[i] = { ...items[i], suffix: e.target.value }; handleUpdate({ items } as any); }} className="h-5 text-[9px] w-12" placeholder="Suf" />
                      <Input type="color" value={item.color || "#7C3AED"} onChange={(e) => { const items = [...(block as any).items]; items[i] = { ...items[i], color: e.target.value }; handleUpdate({ items } as any); }} className="h-5 w-10" />
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {/* ─── BUTTON ─── */}
            {block.type === "button" && (
              <Section title="Botão" icon={<Layers className="h-3 w-3 text-violet-500" />}>
                <FieldRow label="Label">
                  <Input value={(block as any).label || ""} onChange={(e) => handleUpdate({ label: e.target.value } as any)} className="h-7 text-xs" placeholder="Texto do botão" />
                </FieldRow>
                <FieldRow label="Ação">
                  <select value={(block as any).action || "link"} onChange={(e) => handleUpdate({ action: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="link">Link externo</option>
                    <option value="slide">Ir para slide</option>
                    <option value="download">Download</option>
                  </select>
                </FieldRow>
                {(block as any).action === "link" && (
                  <FieldRow label="URL">
                    <Input value={(block as any).url || ""} onChange={(e) => handleUpdate({ url: e.target.value } as any)} className="h-7 text-xs" placeholder="https://..." />
                  </FieldRow>
                )}
                {(block as any).action === "slide" && (
                  <FieldRow label="Slide">
                    <Input type="number" min={0} value={(block as any).targetSlideIndex || 0} onChange={(e) => handleUpdate({ targetSlideIndex: Number(e.target.value) } as any)} className="h-7 text-xs" />
                  </FieldRow>
                )}
                {(block as any).action === "download" && (
                  <FieldRow label="URL">
                    <Input value={(block as any).downloadUrl || ""} onChange={(e) => handleUpdate({ downloadUrl: e.target.value } as any)} className="h-7 text-xs" placeholder="URL do arquivo" />
                  </FieldRow>
                )}
                <FieldRow label="Estilo">
                  <select value={(block as any).buttonStyle || "primary"} onChange={(e) => handleUpdate({ buttonStyle: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="primary">Primário</option>
                    <option value="secondary">Secundário</option>
                    <option value="outline">Outline</option>
                    <option value="ghost">Ghost</option>
                  </select>
                </FieldRow>
                <FieldRow label="Tamanho">
                  <select value={(block as any).size || "medium"} onChange={(e) => handleUpdate({ size: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="small">Pequeno</option>
                    <option value="medium">Médio</option>
                    <option value="large">Grande</option>
                  </select>
                </FieldRow>
                <label className="flex items-center gap-1.5 text-[10px]">
                  <input type="checkbox" checked={(block as any).fullWidth || false} onChange={(e) => handleUpdate({ fullWidth: e.target.checked } as any)} className="rounded" />
                  Largura total
                </label>
              </Section>
            )}

            {/* ─── DIVIDER ─── */}
            {block.type === "divider" && (
              <Section title="Divisor" icon={<Layers className="h-3 w-3 text-slate-400" />}>
                <FieldRow label="Estilo">
                  <select value={(block as any).dividerStyle || "solid"} onChange={(e) => handleUpdate({ dividerStyle: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="solid">Sólido</option>
                    <option value="dashed">Tracejado</option>
                    <option value="dotted">Pontilhado</option>
                    <option value="gradient">Gradiente</option>
                  </select>
                </FieldRow>
                <FieldRow label="Cor">
                  <Input type="color" value={(block as any).color || "#CBD5E1"} onChange={(e) => handleUpdate({ color: e.target.value } as any)} className="h-7 w-14" />
                </FieldRow>
                <FieldRow label="Espessura">
                  <Input type="number" min={1} max={20} value={(block as any).thickness || 2} onChange={(e) => handleUpdate({ thickness: Number(e.target.value) } as any)} className="h-7 text-xs" />
                </FieldRow>
              </Section>
            )}

            {/* ─── EMBED ─── */}
            {block.type === "embed" && (
              <Section title="Embed" icon={<Layers className="h-3 w-3 text-sky-500" />}>
                <FieldRow label="URL">
                  <Input value={(block as any).url || ""} onChange={(e) => handleUpdate({ url: e.target.value } as any)} className="h-7 text-xs" placeholder="URL do conteúdo" />
                </FieldRow>
                <FieldRow label="Título">
                  <Input value={(block as any).title || ""} onChange={(e) => handleUpdate({ title: e.target.value } as any)} className="h-7 text-xs" placeholder="Título" />
                </FieldRow>
                <FieldRow label="Proporção">
                  <select value={(block as any).aspectRatio || "16:9"} onChange={(e) => handleUpdate({ aspectRatio: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="16:9">16:9</option>
                    <option value="4:3">4:3</option>
                    <option value="1:1">1:1</option>
                  </select>
                </FieldRow>
                <label className="flex items-center gap-1.5 text-[10px]">
                  <input type="checkbox" checked={(block as any).allowFullscreen ?? true} onChange={(e) => handleUpdate({ allowFullscreen: e.target.checked } as any)} className="rounded" />
                  Permitir fullscreen
                </label>
              </Section>
            )}

            {/* ─── LIKERT BLOCK ─── */}
            {block.type === "likert" && (
              <Section title="Likert" icon={<BarChart3 className="h-3 w-3 text-violet-500" />}>
                <FieldRow label="Pergunta">
                  <Input value={(block as any).question || ""} onChange={(e) => handleUpdate({ question: e.target.value } as any)} className="h-7 text-xs" placeholder="Pergunta" />
                </FieldRow>
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-slate-700">Afirmações</label>
                  {((block as any).statements || []).map((stmt: any) => (
                    <div key={stmt.id} className="flex gap-2">
                      <Input value={stmt.text} onChange={(e) => {
                        const updated = ((block as any).statements || []).map((s: any) => s.id === stmt.id ? {...s, text: e.target.value} : s);
                        handleUpdate({ statements: updated } as any);
                      }} className="h-7 text-xs flex-1" placeholder="Afirmação" />
                      <Button variant="ghost" size="sm" onClick={() => {
                        const filtered = ((block as any).statements || []).filter((s: any) => s.id !== stmt.id);
                        handleUpdate({ statements: filtered } as any);
                      }} className="h-7 w-7 p-0"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => {
                    const newStmt = { id: crypto.randomUUID(), text: "Nova afirmação" };
                    handleUpdate({ statements: [...((block as any).statements || []), newStmt] } as any);
                  }} className="w-full gap-2 rounded-lg text-xs h-7"><Plus className="h-3.5 w-3.5" /> Adicionar</Button>
                </div>
                <FieldRow label="Pontos">
                  <Input type="number" value={(block as any).points || 10} onChange={(e) => handleUpdate({ points: parseInt(e.target.value) || 10 } as any)} className="h-7 text-xs" />
                </FieldRow>
              </Section>
            )}

            {/* ─── RANKING BLOCK ─── */}
            {block.type === "ranking" && (
              <Section title="Ranking" icon={<ArrowUpDown className="h-3 w-3 text-cyan-500" />}>
                <FieldRow label="Pergunta">
                  <Input value={(block as any).question || ""} onChange={(e) => handleUpdate({ question: e.target.value } as any)} className="h-7 text-xs" placeholder="Pergunta" />
                </FieldRow>
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-slate-700">Itens</label>
                  {((block as any).items || []).map((item: any, idx: number) => (
                    <div key={item.id} className="flex gap-2">
                      <Input value={item.text} onChange={(e) => {
                        const updated = ((block as any).items || []).map((it: any) => it.id === item.id ? {...it, text: e.target.value} : it);
                        handleUpdate({ items: updated } as any);
                      }} className="h-7 text-xs flex-1" placeholder="Item" />
                      <Input type="number" value={item.correctPosition || idx + 1} onChange={(e) => {
                        const updated = ((block as any).items || []).map((it: any) => it.id === item.id ? {...it, correctPosition: parseInt(e.target.value) || 1} : it);
                        handleUpdate({ items: updated } as any);
                      }} className="h-7 text-xs w-16" placeholder="Pos" min="1" />
                      <Button variant="ghost" size="sm" onClick={() => {
                        const filtered = ((block as any).items || []).filter((it: any) => it.id !== item.id);
                        handleUpdate({ items: filtered } as any);
                      }} className="h-7 w-7 p-0"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => {
                    const newItem = { id: crypto.randomUUID(), text: "Novo item", correctPosition: ((block as any).items || []).length + 1 };
                    handleUpdate({ items: [...((block as any).items || []), newItem] } as any);
                  }} className="w-full gap-2 rounded-lg text-xs h-7"><Plus className="h-3.5 w-3.5" /> Adicionar</Button>
                </div>
                <label className="flex items-center gap-1.5 text-[10px]">
                  <input type="checkbox" checked={(block as any).shuffleOnLoad} onChange={(e) => handleUpdate({ shuffleOnLoad: e.target.checked } as any)} className="rounded" />
                  Embaralhar na carga
                </label>
                <label className="flex items-center gap-1.5 text-[10px]">
                  <input type="checkbox" checked={(block as any).showNumbers} onChange={(e) => handleUpdate({ showNumbers: e.target.checked } as any)} className="rounded" />
                  Mostrar números
                </label>
                <FieldRow label="Feedback Correto">
                  <Input value={(block as any).feedbackCorrect || ""} onChange={(e) => handleUpdate({ feedbackCorrect: e.target.value } as any)} className="h-7 text-xs" placeholder="Feedback" />
                </FieldRow>
                <FieldRow label="Feedback Incorreto">
                  <Input value={(block as any).feedbackIncorrect || ""} onChange={(e) => handleUpdate({ feedbackIncorrect: e.target.value } as any)} className="h-7 text-xs" placeholder="Feedback" />
                </FieldRow>
                <FieldRow label="Pontos">
                  <Input type="number" value={(block as any).points || 10} onChange={(e) => handleUpdate({ points: parseInt(e.target.value) || 10 } as any)} className="h-7 text-xs" />
                </FieldRow>
              </Section>
            )}

            {/* ─── ESSAY BLOCK ─── */}
            {block.type === "essay" && (
              <Section title="Dissertativa" icon={<PenLine className="h-3 w-3 text-amber-500" />}>
                <FieldRow label="Pergunta">
                  <Input value={(block as any).question || ""} onChange={(e) => handleUpdate({ question: e.target.value } as any)} className="h-7 text-xs" placeholder="Pergunta" />
                </FieldRow>
                <FieldRow label="Placeholder">
                  <Input value={(block as any).placeholder || ""} onChange={(e) => handleUpdate({ placeholder: e.target.value } as any)} className="h-7 text-xs" placeholder="Placeholder" />
                </FieldRow>
                <FieldRow label="Min. de Palavras">
                  <Input type="number" value={(block as any).minWords || 0} onChange={(e) => handleUpdate({ minWords: parseInt(e.target.value) || 0 } as any)} className="h-7 text-xs" />
                </FieldRow>
                <FieldRow label="Max. de Palavras">
                  <Input type="number" value={(block as any).maxWords || 500} onChange={(e) => handleUpdate({ maxWords: parseInt(e.target.value) || 500 } as any)} className="h-7 text-xs" />
                </FieldRow>
                <label className="flex items-center gap-1.5 text-[10px]">
                  <input type="checkbox" checked={(block as any).showWordCount} onChange={(e) => handleUpdate({ showWordCount: e.target.checked } as any)} className="rounded" />
                  Mostrar contador de palavras
                </label>
                <FieldRow label="Rúbrica">
                  <textarea value={(block as any).rubric || ""} onChange={(e) => handleUpdate({ rubric: e.target.value } as any)} className="h-16 text-xs w-full rounded border border-slate-200 p-2 resize-none" placeholder="Critérios de avaliação" />
                </FieldRow>
                <FieldRow label="Resposta Exemplo">
                  <textarea value={(block as any).sampleAnswer || ""} onChange={(e) => handleUpdate({ sampleAnswer: e.target.value } as any)} className="h-16 text-xs w-full rounded border border-slate-200 p-2 resize-none" placeholder="Resposta de exemplo" />
                </FieldRow>
                <FieldRow label="Feedback">
                  <Input value={(block as any).feedbackAfterSubmit || ""} onChange={(e) => handleUpdate({ feedbackAfterSubmit: e.target.value } as any)} className="h-7 text-xs" placeholder="Feedback após envio" />
                </FieldRow>
                <FieldRow label="Pontos">
                  <Input type="number" value={(block as any).points || 10} onChange={(e) => handleUpdate({ points: parseInt(e.target.value) || 10 } as any)} className="h-7 text-xs" />
                </FieldRow>
              </Section>
            )}

            {/* ─── NUMERIC BLOCK ─── */}
            {block.type === "numeric" && (
              <Section title="Numérico" icon={<Layers className="h-3 w-3 text-emerald-500" />}>
                <FieldRow label="Pergunta">
                  <Input value={(block as any).question || ""} onChange={(e) => handleUpdate({ question: e.target.value } as any)} className="h-7 text-xs" placeholder="Pergunta" />
                </FieldRow>
                <FieldRow label="Resposta Correta">
                  <Input type="number" value={(block as any).correctAnswer || 0} onChange={(e) => handleUpdate({ correctAnswer: parseFloat(e.target.value) || 0 } as any)} className="h-7 text-xs" placeholder="0" step="0.01" />
                </FieldRow>
                <FieldRow label="Tolerância">
                  <Input type="number" value={(block as any).tolerance || 0.5} onChange={(e) => handleUpdate({ tolerance: parseFloat(e.target.value) || 0 } as any)} className="h-7 text-xs" placeholder="0.5" step="0.01" />
                </FieldRow>
                <FieldRow label="Unidade">
                  <Input value={(block as any).unit || ""} onChange={(e) => handleUpdate({ unit: e.target.value } as any)} className="h-7 text-xs" placeholder="Ex: km, g, °C" />
                </FieldRow>
                <FieldRow label="Casas Decimais">
                  <Input type="number" value={(block as any).decimalPlaces || 2} onChange={(e) => handleUpdate({ decimalPlaces: parseInt(e.target.value) || 2 } as any)} className="h-7 text-xs" min="0" max="10" />
                </FieldRow>
                <FieldRow label="Mín.">
                  <Input type="number" value={(block as any).min || ""} onChange={(e) => handleUpdate({ min: e.target.value ? parseFloat(e.target.value) : undefined } as any)} className="h-7 text-xs" placeholder="Opcional" step="0.01" />
                </FieldRow>
                <FieldRow label="Máx.">
                  <Input type="number" value={(block as any).max || ""} onChange={(e) => handleUpdate({ max: e.target.value ? parseFloat(e.target.value) : undefined } as any)} className="h-7 text-xs" placeholder="Opcional" step="0.01" />
                </FieldRow>
                <FieldRow label="Feedback Correto">
                  <Input value={(block as any).feedbackCorrect || ""} onChange={(e) => handleUpdate({ feedbackCorrect: e.target.value } as any)} className="h-7 text-xs" placeholder="Feedback" />
                </FieldRow>
                <FieldRow label="Feedback Incorreto">
                  <Input value={(block as any).feedbackIncorrect || ""} onChange={(e) => handleUpdate({ feedbackIncorrect: e.target.value } as any)} className="h-7 text-xs" placeholder="Feedback" />
                </FieldRow>
                <FieldRow label="Feedback Próximo">
                  <Input value={(block as any).feedbackClose || ""} onChange={(e) => handleUpdate({ feedbackClose: e.target.value } as any)} className="h-7 text-xs" placeholder="Feedback quando quase acertou" />
                </FieldRow>
                <FieldRow label="Pontos">
                  <Input type="number" value={(block as any).points || 10} onChange={(e) => handleUpdate({ points: parseInt(e.target.value) || 10 } as any)} className="h-7 text-xs" />
                </FieldRow>
              </Section>
            )}

            {/* ─── DROPDOWN BLOCK ─── */}
            {block.type === "dropdown" && (
              <Section title="Dropdown" icon={<ChevronDown className="h-3 w-3 text-indigo-500" />}>
                <FieldRow label="Pergunta">
                  <Input value={(block as any).question || ""} onChange={(e) => handleUpdate({ question: e.target.value } as any)} className="h-7 text-xs" placeholder="Pergunta" />
                </FieldRow>
                <div className="space-y-3">
                  <label className="text-[10px] font-medium text-slate-700">Itens com Dropdown</label>
                  {((block as any).items || []).map((item: any) => (
                    <div key={item.id} className="border border-slate-200 rounded p-2 space-y-1.5">
                      <Input value={item.text} onChange={(e) => {
                        const updated = ((block as any).items || []).map((it: any) => it.id === item.id ? {...it, text: e.target.value} : it);
                        handleUpdate({ items: updated } as any);
                      }} className="h-7 text-xs w-full" placeholder="Texto (inclua ___ para lacuna)" />
                      <div className="text-[9px] text-slate-500 mb-1">Opções (uma por linha):</div>
                      <textarea value={item.options?.join('\n') || ""} onChange={(e) => {
                        const updated = ((block as any).items || []).map((it: any) => it.id === item.id ? {...it, options: e.target.value.split('\n').filter((o: string) => o.trim())} : it);
                        handleUpdate({ items: updated } as any);
                      }} className="h-12 text-xs w-full rounded border border-slate-200 p-1.5 resize-none" placeholder="Opção 1\nOpção 2\nOpção 3" />
                      <FieldRow label="Opção Correta">
                        <select value={item.correctOption || ""} onChange={(e) => {
                          const updated = ((block as any).items || []).map((it: any) => it.id === item.id ? {...it, correctOption: e.target.value} : it);
                          handleUpdate({ items: updated } as any);
                        }} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                          <option value="">Selecione</option>
                          {(item.options || []).map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </FieldRow>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const filtered = ((block as any).items || []).filter((it: any) => it.id !== item.id);
                        handleUpdate({ items: filtered } as any);
                      }} className="h-7 w-full rounded text-xs gap-2"><Trash2 className="h-3.5 w-3.5" /> Remover</Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => {
                    const newItem = { id: crypto.randomUUID(), text: "Texto ___", options: ["Opção 1", "Opção 2"], correctOption: "Opção 1" };
                    handleUpdate({ items: [...((block as any).items || []), newItem] } as any);
                  }} className="w-full gap-2 rounded-lg text-xs h-7"><Plus className="h-3.5 w-3.5" /> Adicionar Item</Button>
                </div>
                <FieldRow label="Feedback Correto">
                  <Input value={(block as any).feedbackCorrect || ""} onChange={(e) => handleUpdate({ feedbackCorrect: e.target.value } as any)} className="h-7 text-xs" placeholder="Feedback" />
                </FieldRow>
                <FieldRow label="Feedback Incorreto">
                  <Input value={(block as any).feedbackIncorrect || ""} onChange={(e) => handleUpdate({ feedbackIncorrect: e.target.value } as any)} className="h-7 text-xs" placeholder="Feedback" />
                </FieldRow>
                <FieldRow label="Pontos">
                  <Input type="number" value={(block as any).points || 10} onChange={(e) => handleUpdate({ points: parseInt(e.target.value) || 10 } as any)} className="h-7 text-xs" />
                </FieldRow>
              </Section>
            )}

            {/* ─── MATRIX BLOCK ─── */}
            {block.type === "matrix" && (
              <Section title="Matriz" icon={<Grid3x3 className="h-3 w-3 text-red-500" />}>
                <FieldRow label="Pergunta">
                  <Input value={(block as any).question || ""} onChange={(e) => handleUpdate({ question: e.target.value } as any)} className="h-7 text-xs" placeholder="Pergunta" />
                </FieldRow>
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-slate-700">Linhas</label>
                  {((block as any).rows || []).map((row: any) => (
                    <div key={row.id} className="flex gap-2">
                      <Input value={row.label} onChange={(e) => {
                        const updated = ((block as any).rows || []).map((r: any) => r.id === row.id ? {...r, label: e.target.value} : r);
                        handleUpdate({ rows: updated } as any);
                      }} className="h-7 text-xs flex-1" placeholder="Rótulo da linha" />
                      <Button variant="ghost" size="sm" onClick={() => {
                        const filtered = ((block as any).rows || []).filter((r: any) => r.id !== row.id);
                        handleUpdate({ rows: filtered } as any);
                      }} className="h-7 w-7 p-0"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => {
                    const newRow = { id: crypto.randomUUID(), label: "Nova linha" };
                    handleUpdate({ rows: [...((block as any).rows || []), newRow] } as any);
                  }} className="w-full gap-2 rounded-lg text-xs h-7"><Plus className="h-3.5 w-3.5" /> Adicionar Linha</Button>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-slate-700">Colunas</label>
                  {((block as any).columns || []).map((col: any) => (
                    <div key={col.id} className="flex gap-2">
                      <Input value={col.label} onChange={(e) => {
                        const updated = ((block as any).columns || []).map((c: any) => c.id === col.id ? {...c, label: e.target.value} : c);
                        handleUpdate({ columns: updated } as any);
                      }} className="h-7 text-xs flex-1" placeholder="Rótulo da coluna" />
                      <Button variant="ghost" size="sm" onClick={() => {
                        const filtered = ((block as any).columns || []).filter((c: any) => c.id !== col.id);
                        handleUpdate({ columns: filtered } as any);
                      }} className="h-7 w-7 p-0"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => {
                    const newCol = { id: crypto.randomUUID(), label: "Nova coluna" };
                    handleUpdate({ columns: [...((block as any).columns || []), newCol] } as any);
                  }} className="w-full gap-2 rounded-lg text-xs h-7"><Plus className="h-3.5 w-3.5" /> Adicionar Coluna</Button>
                </div>
                <FieldRow label="Tipo de Entrada">
                  <select value={(block as any).inputType || "radio"} onChange={(e) => handleUpdate({ inputType: e.target.value } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="radio">Rádio (uma resposta por linha)</option>
                    <option value="checkbox">Checkbox (múltiplas respostas)</option>
                  </select>
                </FieldRow>
                <FieldRow label="Feedback Correto">
                  <Input value={(block as any).feedbackCorrect || ""} onChange={(e) => handleUpdate({ feedbackCorrect: e.target.value } as any)} className="h-7 text-xs" placeholder="Feedback" />
                </FieldRow>
                <FieldRow label="Feedback Incorreto">
                  <Input value={(block as any).feedbackIncorrect || ""} onChange={(e) => handleUpdate({ feedbackIncorrect: e.target.value } as any)} className="h-7 text-xs" placeholder="Feedback" />
                </FieldRow>
                <FieldRow label="Pontos">
                  <Input type="number" value={(block as any).points || 10} onChange={(e) => handleUpdate({ points: parseInt(e.target.value) || 10 } as any)} className="h-7 text-xs" />
                </FieldRow>
              </Section>
            )}

            {/* ─── IMAGE CHOICE BLOCK ─── */}
            {block.type === "image-choice" && (
              <Section title="Escolha Visual" icon={<Image className="h-3 w-3 text-blue-500" />}>
                <FieldRow label="Pergunta">
                  <Input value={(block as any).question || ""} onChange={(e) => handleUpdate({ question: e.target.value } as any)} className="h-7 text-xs" placeholder="Pergunta" />
                </FieldRow>
                <label className="flex items-center gap-1.5 text-[10px]">
                  <input type="checkbox" checked={(block as any).multiSelect} onChange={(e) => handleUpdate({ multiSelect: e.target.checked } as any)} className="rounded" />
                  Múltipla seleção
                </label>
                <FieldRow label="Colunas">
                  <select value={(block as any).columns || 2} onChange={(e) => handleUpdate({ columns: parseInt(e.target.value) as 2 | 3 | 4 } as any)} className="h-7 text-xs w-full rounded border border-slate-200 px-2">
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </FieldRow>
                <label className="flex items-center gap-1.5 text-[10px]">
                  <input type="checkbox" checked={(block as any).showLabels} onChange={(e) => handleUpdate({ showLabels: e.target.checked } as any)} className="rounded" />
                  Mostrar rótulos
                </label>
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-slate-700">Opções</label>
                  {((block as any).choices || []).map((choice: any) => (
                    <div key={choice.id} className="border border-slate-200 rounded p-2 space-y-1.5">
                      <FieldRow label="Rótulo">
                        <Input value={choice.label || ""} onChange={(e) => {
                          const updated = ((block as any).choices || []).map((ch: any) => ch.id === choice.id ? {...ch, label: e.target.value} : ch);
                          handleUpdate({ choices: updated } as any);
                        }} className="h-7 text-xs" placeholder="Rótulo" />
                      </FieldRow>
                      <FieldRow label="URL da Imagem">
                        <Input value={choice.image || ""} onChange={(e) => {
                          const updated = ((block as any).choices || []).map((ch: any) => ch.id === choice.id ? {...ch, image: e.target.value} : ch);
                          handleUpdate({ choices: updated } as any);
                        }} className="h-7 text-xs" placeholder="https://..." />
                      </FieldRow>
                      <label className="flex items-center gap-1.5 text-[10px]">
                        <input type="checkbox" checked={choice.isCorrect} onChange={(e) => {
                          const updated = ((block as any).choices || []).map((ch: any) => ch.id === choice.id ? {...ch, isCorrect: e.target.checked} : ch);
                          handleUpdate({ choices: updated } as any);
                        }} className="rounded" />
                        Resposta correta
                      </label>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const filtered = ((block as any).choices || []).filter((ch: any) => ch.id !== choice.id);
                        handleUpdate({ choices: filtered } as any);
                      }} className="h-7 w-full rounded text-xs gap-2"><Trash2 className="h-3.5 w-3.5" /> Remover</Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => {
                    const newChoice = { id: crypto.randomUUID(), image: "", label: "Nova opção", isCorrect: false };
                    handleUpdate({ choices: [...((block as any).choices || []), newChoice] } as any);
                  }} className="w-full gap-2 rounded-lg text-xs h-7"><Plus className="h-3.5 w-3.5" /> Adicionar Opção</Button>
                </div>
                <FieldRow label="Feedback Correto">
                  <Input value={(block as any).feedbackCorrect || ""} onChange={(e) => handleUpdate({ feedbackCorrect: e.target.value } as any)} className="h-7 text-xs" placeholder="Feedback" />
                </FieldRow>
                <FieldRow label="Feedback Incorreto">
                  <Input value={(block as any).feedbackIncorrect || ""} onChange={(e) => handleUpdate({ feedbackIncorrect: e.target.value } as any)} className="h-7 text-xs" placeholder="Feedback" />
                </FieldRow>
                <FieldRow label="Pontos">
                  <Input type="number" value={(block as any).points || 10} onChange={(e) => handleUpdate({ points: parseInt(e.target.value) || 10 } as any)} className="h-7 text-xs" />
                </FieldRow>
              </Section>
            )}

            {block.type === "video" && (
              <>
                <Section
                  title="Vídeo"
                  icon={
                    <Play className="h-3 w-3 text-muted-foreground/60" />
                  }
                >
                  <input ref={videoInputRef} type="file" accept="video/*" onChange={(e) => handleMediaUpload(e, "video/", "url", setIsUploadingVideo)} className="hidden" />
                  <Button variant="outline" size="sm" className="w-full gap-2 rounded-lg text-xs h-8" onClick={() => videoInputRef.current?.click()} disabled={isUploadingVideo}>
                    {isUploadingVideo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {isUploadingVideo ? "Enviando..." : block.url ? "Trocar Vídeo" : "Upload de Vídeo"}
                  </Button>

                  {block.url && !block.url.includes("youtube") && !block.url.includes("vimeo") && (
                    <div className="rounded-lg overflow-hidden border border-slate-200">
                      <video src={block.url} className="w-full h-20 object-cover" />
                    </div>
                  )}

                  <FieldRow label="Ou URL">
                    <Input
                      value={block.url}
                      onChange={(e) =>
                        handleUpdate({
                          url: e.target.value,
                        } as Partial<Block>)
                      }
                      className="h-7 text-xs rounded-md"
                      placeholder="https://youtube.com/... ou upload"
                    />
                  </FieldRow>

                  <p className="text-[9px] text-slate-400">YouTube, Vimeo ou arquivo direto (MP4, WebM)</p>
                </Section>

                <Section
                  title="Interações"
                  icon={
                    <Clock className="h-3 w-3 text-muted-foreground/60" />
                  }
                  defaultOpen={false}
                >
                  <div className="flex justify-end mb-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-5 text-[9px] rounded gap-1 px-1.5"
                      onClick={() => {
                        if (block.type !== "video") return;
                        const newInteraction = {
                          id: crypto.randomUUID(),
                          timestampSeconds: 5,
                          question: "Pergunta no vídeo",
                          options: [
                            {
                              text: "Opção A",
                              isCorrect: true,
                            },
                            {
                              text: "Opção B",
                              isCorrect: false,
                            },
                          ],
                          answered: false,
                        };
                        handleUpdate({
                          interactions: [
                            ...block.interactions,
                            newInteraction,
                          ],
                        } as Partial<Block>);
                      }}
                    >
                      <Plus className="h-2.5 w-2.5" />
                      Adicionar
                    </Button>
                  </div>

                  {block.interactions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="border border-border/40 rounded-lg p-2 space-y-1.5 bg-muted/10"
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-2.5 w-2.5 text-orange-500 flex-shrink-0" />
                        <Input
                          type="number"
                          value={interaction.timestampSeconds}
                          onChange={(e) => {
                            if (block.type !== "video") return;
                            const updated =
                              block.interactions.map((i) =>
                                i.id === interaction.id
                                  ? {
                                      ...i,
                                      timestampSeconds:
                                        Number(e.target.value),
                                    }
                                  : i
                              );
                            handleUpdate({
                              interactions: updated,
                            } as Partial<Block>);
                          }}
                          className="h-5 text-[10px] rounded w-12"
                        />
                        <span className="text-[9px] text-muted-foreground">
                          seg
                        </span>
                        <button
                          onClick={() => {
                            if (block.type !== "video") return;
                            handleUpdate({
                              interactions:
                                block.interactions.filter(
                                  (i) =>
                                    i.id !== interaction.id
                                ),
                            } as Partial<Block>);
                          }}
                          className="ml-auto p-0.5 rounded hover:bg-destructive/10"
                        >
                          <Trash2 className="h-2.5 w-2.5 text-destructive" />
                        </button>
                      </div>
                      <Input
                        value={interaction.question}
                        onChange={(e) => {
                          if (block.type !== "video") return;
                          const updated =
                            block.interactions.map((i) =>
                              i.id === interaction.id
                                ? {
                                    ...i,
                                    question: e.target.value,
                                  }
                                : i
                            );
                          handleUpdate({
                            interactions: updated,
                          } as Partial<Block>);
                        }}
                        className="h-5 text-[10px] rounded"
                        placeholder="Pergunta..."
                      />
                      {interaction.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className="flex items-center gap-1"
                        >
                          <button
                            onClick={() => {
                              if (block.type !== "video")
                                return;
                              const updated =
                                block.interactions.map((i) =>
                                  i.id === interaction.id
                                    ? {
                                        ...i,
                                        options:
                                          i.options.map(
                                            (o, idx) => ({
                                              ...o,
                                              isCorrect:
                                                idx ===
                                                oIdx,
                                            })
                                          ),
                                      }
                                    : i
                                );
                              handleUpdate({
                                interactions: updated,
                              } as Partial<Block>);
                            }}
                            className={cn(
                              "flex-shrink-0 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center",
                              opt.isCorrect
                                ? "border-emerald-500 bg-emerald-500"
                                : "border-muted-foreground/30"
                            )}
                          >
                            {opt.isCorrect && (
                              <Check className="h-2 w-2 text-white" />
                            )}
                          </button>
                          <Input
                            value={opt.text}
                            onChange={(e) => {
                              if (block.type !== "video")
                                return;
                              const updated =
                                block.interactions.map(
                                  (i) =>
                                    i.id ===
                                    interaction.id
                                      ? {
                                          ...i,
                                          options:
                                            i.options.map(
                                              (
                                                o,
                                                idx
                                              ) =>
                                                idx ===
                                                oIdx
                                                  ? {
                                                      ...o,
                                                      text: e
                                                        .target
                                                        .value,
                                                    }
                                                  : o
                                            ),
                                        }
                                      : i
                                );
                              handleUpdate({
                                interactions: updated,
                              } as Partial<Block>);
                            }}
                            className="h-4 text-[9px] rounded flex-1"
                          />
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-4 text-[8px] gap-0.5"
                        onClick={() => {
                          if (block.type !== "video") return;
                          const updated =
                            block.interactions.map((i) =>
                              i.id === interaction.id
                                ? {
                                    ...i,
                                    options: [
                                      ...i.options,
                                      {
                                        text: `Opção ${String.fromCharCode(65 + i.options.length)}`,
                                        isCorrect: false,
                                      },
                                    ],
                                  }
                                : i
                            );
                          handleUpdate({
                            interactions: updated,
                          } as Partial<Block>);
                        }}
                      >
                        <Plus className="h-2 w-2" /> Opção
                      </Button>
                    </div>
                  ))}
                </Section>
              </>
            )}

            {/* ─── SLIDE BACKGROUND (always visible) ─── */}
            <Section
              title="Slide"
              icon={
                <Palette className="h-3 w-3 text-muted-foreground/60" />
              }
              defaultOpen={false}
            >
              <FieldRow label="Fundo">
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={slide?.background ?? "#ffffff"}
                    onChange={(e) =>
                      project &&
                      slide &&
                      updateSlideBackground(
                        project.id,
                        slide.id,
                        e.target.value
                      )
                    }
                    className="w-7 h-7 rounded-md border border-border cursor-pointer"
                  />
                  <Input
                    value={slide?.background ?? "#ffffff"}
                    onChange={(e) =>
                      project &&
                      slide &&
                      updateSlideBackground(
                        project.id,
                        slide.id,
                        e.target.value
                      )
                    }
                    className="h-7 text-xs rounded-md"
                  />
                </div>
              </FieldRow>
            </Section>

            {/* ─── AI MAGIC THEME ─── */}
            <div className="px-4 py-3 border-t border-border/30">
              <button
                onClick={() => setAiDialogOpen(true)}
                className="w-full relative overflow-hidden rounded-xl px-4 py-3 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group"
                style={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
                }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white tracking-wide">
                      ✨ Auto-Theme (AI)
                    </p>
                    <p className="text-[9px] text-white/70 mt-0.5">
                      Extraia cores da sua marca
                    </p>
                  </div>
                </div>
              </button>
              <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-violet-500" />
                      Magic Theme AI
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <p className="text-sm text-muted-foreground">
                      Envie o logotipo ou brandbook da sua marca. Nossa IA irá
                      extrair automaticamente as cores e tipografia ideais.
                    </p>

                    {aiAnalyzing ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-3">
                        <div className="relative">
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center animate-pulse">
                            <Sparkles className="h-7 w-7 text-white" />
                          </div>
                          <Loader2 className="absolute -bottom-1 -right-1 h-5 w-5 text-violet-500 animate-spin" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          🤖 Analisando identidade visual...
                        </p>
                        {aiFileName && (
                          <p className="text-[10px] text-muted-foreground">
                            {aiFileName}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <input
                          ref={aiFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAiTheme}
                          className="hidden"
                          id="ai-theme-upload"
                        />
                        <label
                          htmlFor="ai-theme-upload"
                          className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-violet-200 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-colors group"
                        >
                          <ImageUp className="h-8 w-8 text-violet-300 group-hover:text-violet-500 transition-colors mb-2" />
                          <span className="text-sm font-medium text-violet-600">
                            Clique para enviar imagem
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-1">
                            PNG, JPG, SVG ou WebP
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : (
          /* No block selected */
          <div className="flex flex-col items-center justify-center py-10 text-center px-6">
            <div className="h-12 w-12 rounded-xl bg-muted/40 flex items-center justify-center mb-3">
              <Layers className="h-6 w-6 text-muted-foreground/25" />
            </div>
            <p className="text-sm font-medium text-muted-foreground/50">
              Nenhum bloco selecionado
            </p>
            <p className="text-xs text-muted-foreground/30 mt-1 mb-6 leading-relaxed">
              Clique em um bloco no canvas
              <br />
              para editar suas propriedades
            </p>

            {/* Slide Notes */}
            {slide && (
              <div className="w-full px-2 mb-4">
                <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <PenLine className="h-3 w-3 text-amber-600" />
                    <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Notas do Narrador</span>
                  </div>
                  <textarea
                    value={slide.notes || ""}
                    onChange={(e) => {
                      if (project) {
                        updateSlideNotes(project.id, slide.id, e.target.value);
                      }
                    }}
                    placeholder="Notas de instrução, roteiro de narração, observações..."
                    className="w-full h-24 text-xs rounded-lg border border-amber-200 bg-white p-2 resize-none focus:outline-none focus:ring-1 focus:ring-amber-300 text-slate-700 placeholder:text-amber-300"
                  />
                  <p className="text-[9px] text-amber-400 mt-1">Visível apenas para o instrutor</p>
                </div>

                {/* Narration */}
                <div className="bg-violet-50/50 border border-violet-200/50 rounded-xl p-3 mt-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Music className="h-3 w-3 text-violet-600" />
                    <span className="text-[10px] font-semibold text-violet-700 uppercase tracking-wide">🎙️ Narração</span>
                  </div>
                  <Input
                    value={slide.narration || ""}
                    onChange={(e) => {
                      if (project) {
                        useEditorStore.setState((state) => ({
                          projects: state.projects.map(p =>
                            p.id === project.id ? {
                              ...p,
                              slides: p.slides.map(s =>
                                s.id === slide.id ? { ...s, narration: e.target.value } : s
                              ),
                            } : p
                          ),
                        }));
                      }
                    }}
                    placeholder="URL do áudio (mp3, wav, ogg...)"
                    className="h-7 text-xs rounded-md border-violet-200 mb-2"
                  />
                  {slide.narration && (
                    <audio src={slide.narration} controls className="w-full h-8" />
                  )}
                  <p className="text-[9px] text-violet-400 mt-1">Áudio reproduzido ao exibir o slide</p>
                </div>

                {/* Layers (Wave 10) */}
                <div className="bg-indigo-50/50 border border-indigo-200/50 rounded-xl p-3 mt-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Layers className="h-3 w-3 text-indigo-600" />
                    <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wide">Camadas</span>
                  </div>
                  <div className="space-y-2">
                    {slide.layers && slide.layers.length > 0 ? (
                      <div className="space-y-2">
                        {slide.layers.map((layer) => (
                          <div key={layer.id} className="p-2 rounded border border-indigo-200/40 bg-white text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="checkbox"
                                  checked={layer.visible}
                                  onChange={(e) => {
                                    if (project) {
                                      useEditorStore.getState().updateSlide(project.id, slide.id, {
                                        layers: slide.layers!.map((l) =>
                                          l.id === layer.id ? { ...l, visible: e.target.checked } : l
                                        ),
                                      });
                                    }
                                  }}
                                  className="w-3 h-3 rounded"
                                />
                                <span className="font-medium text-slate-700">{layer.name}</span>
                              </div>
                              <button
                                onClick={() => {
                                  if (project) {
                                    useEditorStore.getState().updateSlide(project.id, slide.id, {
                                      layers: slide.layers!.filter((l) => l.id !== layer.id),
                                    });
                                  }
                                }}
                                className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-indigo-600/70 text-[9px]">Nenhuma camada criada</p>
                    )}
                    <Button
                      onClick={() => {
                        const layerName = prompt("Nome da camada:");
                        if (layerName && project) {
                          const newLayer = {
                            id: crypto.randomUUID(),
                            name: layerName,
                            blocks: [],
                            visible: true,
                            preventBaseInteraction: false,
                            backdrop: "none" as const,
                            position: "overlay" as const,
                            animation: { enter: "fadeIn", exit: "fadeOut", duration: 0.3 },
                            autoClose: null,
                          };
                          useEditorStore.getState().updateSlide(project.id, slide.id, {
                            layers: [...(slide.layers || []), newLayer],
                          });
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full h-6 text-[10px]"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar Camada
                    </Button>
                  </div>
                  <p className="text-[9px] text-indigo-400 mt-2">Camadas permitem organizar blocos em diferentes níveis</p>
                </div>
              </div>
            )}

            {/* AI Theme button — also visible when no block is selected */}
            <div className="w-full px-2">
              <button
                onClick={() => setAiDialogOpen(true)}
                className="w-full relative overflow-hidden rounded-xl px-4 py-3 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group"
                style={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
                }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white tracking-wide">
                      ✨ Auto-Theme (AI)
                    </p>
                    <p className="text-[9px] text-white/70 mt-0.5">
                      Extraia cores da sua marca
                    </p>
                  </div>
                </div>
              </button>
              <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-violet-500" />
                      Magic Theme AI
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <p className="text-sm text-muted-foreground">
                      Envie o logotipo ou brandbook da sua marca. Nossa IA irá
                      extrair automaticamente as cores e tipografia ideais.
                    </p>
                    {aiAnalyzing ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-3">
                        <div className="relative">
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center animate-pulse">
                            <Sparkles className="h-7 w-7 text-white" />
                          </div>
                          <Loader2 className="absolute -bottom-1 -right-1 h-5 w-5 text-violet-500 animate-spin" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          🤖 Analisando identidade visual...
                        </p>
                        {aiFileName && (
                          <p className="text-[10px] text-muted-foreground">
                            {aiFileName}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <input
                          ref={aiFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAiTheme}
                          className="hidden"
                          id="ai-theme-upload-empty"
                        />
                        <label
                          htmlFor="ai-theme-upload-empty"
                          className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-violet-200 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-colors group"
                        >
                          <ImageUp className="h-8 w-8 text-violet-300 group-hover:text-violet-500 transition-colors mb-2" />
                          <span className="text-sm font-medium text-violet-600">
                            Clique para enviar imagem
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-1">
                            PNG, JPG, SVG ou WebP
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* ─── CERTIFICATE SETTINGS ─── */}
            <div className="px-2">
              <button
                onClick={() => setCertificateDialogOpen(true)}
                className="w-full mt-3 relative overflow-hidden rounded-xl px-4 py-3 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group"
                style={{
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
                }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white tracking-wide">
                      🎓 Certificados
                    </p>
                    <p className="text-[9px] text-white/70 mt-0.5">
                      Configure a conclusão
                    </p>
                  </div>
                </div>
              </button>
              <Dialog open={certificateDialogOpen} onOpenChange={setCertificateDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-600" />
                      Configuração de Certificados
                    </DialogTitle>
                  </DialogHeader>
                  {project ? (
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">
                          Habilitar Certificados
                        </label>
                        <button
                          onClick={() =>
                            project &&
                            useEditorStore.getState().updateProject(project.id, {
                              certificate: {
                                ...(project.certificate || {
                                  enabled: false,
                                  template: "classic",
                                  title: "Certificado de Conclusão",
                                  bodyText: "por completar com êxito este curso.",
                                  accentColor: "#7c3aed",
                                  orientation: "landscape",
                                  includeScore: true,
                                  includeHours: true,
                                  validationHash: true,
                                }),
                                enabled: !(project.certificate?.enabled ?? false),
                              },
                            })
                          }
                          className={`w-full h-8 text-xs rounded-md border transition-colors ${
                            project.certificate?.enabled
                              ? "bg-amber-100 border-amber-300 text-amber-800"
                              : "bg-slate-100 border-slate-300 text-slate-700"
                          }`}
                        >
                          {project.certificate?.enabled ? "✓ Habilitado" : "Desabilitado"}
                        </button>
                      </div>

                      {project.certificate?.enabled && (
                        <>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-700">
                              Template
                            </label>
                            <select
                              value={project.certificate?.template || "classic"}
                              onChange={(e) =>
                                project &&
                                useEditorStore.getState().updateProject(project.id, {
                                  certificate: {
                                    ...project.certificate!,
                                    template: e.target.value as any,
                                  },
                                })
                              }
                              className="w-full h-8 text-xs rounded-md border border-slate-300 bg-white px-2"
                            >
                              <option value="classic">Classic</option>
                              <option value="modern">Modern</option>
                              <option value="minimal">Minimal</option>
                              <option value="corporate">Corporate</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-700">
                              Título
                            </label>
                            <Input
                              type="text"
                              value={project.certificate?.title || "Certificado"}
                              onChange={(e) =>
                                project &&
                                useEditorStore.getState().updateProject(project.id, {
                                  certificate: {
                                    ...project.certificate!,
                                    title: e.target.value,
                                  },
                                })
                              }
                              className="h-8 text-xs rounded-md"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-700">
                              Cor Acentuada
                            </label>
                            <div className="flex gap-1.5">
                              <input
                                type="color"
                                value={project.certificate?.accentColor || "#7c3aed"}
                                onChange={(e) =>
                                  project &&
                                  useEditorStore.getState().updateProject(project.id, {
                                    certificate: {
                                      ...project.certificate!,
                                      accentColor: e.target.value,
                                    },
                                  })
                                }
                                className="w-8 h-8 rounded-md border border-slate-300 cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={project.certificate?.accentColor || "#7c3aed"}
                                onChange={(e) =>
                                  project &&
                                  useEditorStore.getState().updateProject(project.id, {
                                    certificate: {
                                      ...project.certificate!,
                                      accentColor: e.target.value,
                                    },
                                  })
                                }
                                className="h-8 text-xs rounded-md"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-700">
                              Orientação
                            </label>
                            <select
                              value={project.certificate?.orientation || "landscape"}
                              onChange={(e) =>
                                project &&
                                useEditorStore.getState().updateProject(project.id, {
                                  certificate: {
                                    ...project.certificate!,
                                    orientation: e.target.value as "landscape" | "portrait",
                                  },
                                })
                              }
                              className="w-full h-8 text-xs rounded-md border border-slate-300 bg-white px-2"
                            >
                              <option value="landscape">Paisagem</option>
                              <option value="portrait">Retrato</option>
                            </select>
                          </div>

                          <div className="space-y-2 border-t border-slate-200 pt-3">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={project.certificate?.includeScore ?? true}
                                onChange={(e) =>
                                  project &&
                                  useEditorStore.getState().updateProject(project.id, {
                                    certificate: {
                                      ...project.certificate!,
                                      includeScore: e.target.checked,
                                    },
                                  })
                                }
                                className="w-4 h-4 rounded border-slate-300"
                              />
                              Incluir Desempenho
                            </label>
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={project.certificate?.includeHours ?? true}
                                onChange={(e) =>
                                  project &&
                                  useEditorStore.getState().updateProject(project.id, {
                                    certificate: {
                                      ...project.certificate!,
                                      includeHours: e.target.checked,
                                    },
                                  })
                                }
                                className="w-4 h-4 rounded border-slate-300"
                              />
                              Incluir Horas
                            </label>
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={project.certificate?.validationHash ?? true}
                                onChange={(e) =>
                                  project &&
                                  useEditorStore.getState().updateProject(project.id, {
                                    certificate: {
                                      ...project.certificate!,
                                      validationHash: e.target.checked,
                                    },
                                  })
                                }
                                className="w-4 h-4 rounded border-slate-300"
                              />
                              Código de Validação
                            </label>
                          </div>

                          <p className="text-[10px] text-slate-500 pt-2">
                            Configurações avançadas (nome de assinatura, logo, etc.) estarão disponíveis em breve.
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Selecione um projeto para configurar certificados.
                    </p>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

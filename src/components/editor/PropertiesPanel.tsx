"use client";

import { useState, useRef } from "react";
import { useEditorStore, Block, QuizOption } from "@/store/useEditorStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    <div className="border-b border-border/30 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-muted/30 transition-colors text-left"
      >
        {icon}
        <span className="text-[11px] font-semibold text-foreground/80 uppercase tracking-wider flex-1">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground/50 transition-transform",
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
      <label className="text-[10px] text-muted-foreground w-14 flex-shrink-0">
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
  const applyThemeToAllSlides = useEditorStore((s) => s.applyThemeToAllSlides);

  const project = getCurrentProject();
  const slide = getCurrentSlide();
  const block = getSelectedBlock();

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // AI Theme state
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiFileName, setAiFileName] = useState<string | null>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="w-[280px] bg-white border-l border-border/40 flex flex-col flex-shrink-0">
      {/* Panel Header */}
      <div className="px-4 py-2.5 border-b border-border/40 flex items-center gap-2">
        <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
        <h2 className="text-[11px] font-semibold text-foreground/80 uppercase tracking-wider">
          Inspector
        </h2>
      </div>

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
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="Cor 1">
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
                  <FieldRow label="Cor 2">
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
                <FieldRow label="URL do Áudio">
                  <Input
                    value={(block as any).src || ""}
                    onChange={(e) => handleUpdate({ src: e.target.value })}
                    placeholder="https://... ou /api/uploads/..."
                    className="h-7 text-xs"
                  />
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

            {/* ─── VIDEO PROPERTIES ─── */}
            {block.type === "video" && (
              <>
                <Section
                  title="Vídeo"
                  icon={
                    <Play className="h-3 w-3 text-muted-foreground/60" />
                  }
                >
                  <FieldRow label="URL">
                    <Input
                      value={block.url}
                      onChange={(e) =>
                        handleUpdate({
                          url: e.target.value,
                        } as Partial<Block>)
                      }
                      className="h-7 text-xs rounded-md"
                      placeholder="https://youtube.com/..."
                    />
                  </FieldRow>
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
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

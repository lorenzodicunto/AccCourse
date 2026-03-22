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
} from "lucide-react";
import { useState } from "react";
import { exportScormPackage } from "@/lib/scorm/packager";
import { shareCourse } from "@/actions/review";
import { saveCourse } from "@/actions/courses";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TopToolbarProps {
  courseId?: string;
}

type RibbonTabId = "home" | "insert" | "design";

const RIBBON_TABS: { id: RibbonTabId; label: string }[] = [
  { id: "home", label: "Início" },
  { id: "insert", label: "Inserir" },
  { id: "design", label: "Design" },
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

export function TopToolbar({ courseId }: TopToolbarProps) {
  const router = useRouter();
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const getCurrentSlide = useEditorStore((s) => s.getCurrentSlide);
  const getSelectedBlock = useEditorStore((s) => s.getSelectedBlock);
  const updateProject = useEditorStore((s) => s.updateProject);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const addBlock = useEditorStore((s) => s.addBlock);
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
      await saveCourse(courseId, courseData);
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
    };

    let newBlock: Block;
    switch (type) {
      case "text":
        newBlock = {
          ...baseBlock,
          type: "text",
          width: 400,
          height: 80,
          content: "<p>Clique para editar o texto</p>",
          fontSize: 18,
          fontWeight: "normal",
          color: "#1a1a2e",
          textAlign: "left",
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

  return (
    <>
      {/* Title Bar — Above the Ribbon */}
      <div className="h-10 bg-white border-b border-border/40 flex items-center justify-between px-3 flex-shrink-0">
        {/* Left: Back + Logo + Title */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg h-7 w-7 p-0"
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
                className="text-sm font-semibold bg-transparent border-b-2 border-primary outline-none py-0.5 px-1 min-w-[200px]"
                autoFocus
              />
            ) : (
              <button
                onClick={handleTitleClick}
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
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

        {/* Right: Save + Share + Export */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 rounded-lg text-xs h-7 text-emerald-700 hover:bg-emerald-50"
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

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 rounded-lg text-xs h-7 text-primary hover:bg-primary/5"
            onClick={handleShare}
            disabled={sharing || !project}
          >
            {sharing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Share2 className="h-3.5 w-3.5" />
            )}
            Compartilhar
          </Button>

          <Button
            className="gap-1.5 rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-all text-xs h-7"
            size="sm"
            onClick={handleExport}
            disabled={exporting || !project}
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Exportar SCORM
          </Button>
        </div>
      </div>

      {/* Ribbon Tabs */}
      <div className="bg-white border-b border-border/40 flex-shrink-0">
        {/* Tab Headers */}
        <div className="flex items-center gap-0 px-3 border-b border-border/20">
          {RIBBON_TABS.map((tab) => (
            <button
              key={tab.id}
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
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex items-stretch px-2 py-1.5 min-h-[66px]">
          {/* ─── HOME TAB ─── */}
          {activeTab === "home" && (
            <>
              <RibbonGroup label="Área de Transferência">
                <RibbonButton
                  icon={<ClipboardPaste className="h-4 w-4" />}
                  label="Colar"
                  variant="large"
                />
                <div className="flex flex-col gap-0.5">
                  <RibbonButton
                    icon={<Scissors className="h-3.5 w-3.5" />}
                    title="Recortar"
                  />
                  <RibbonButton
                    icon={<Copy className="h-3.5 w-3.5" />}
                    title="Copiar"
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
                      disabled={!block || block.type !== "text"}
                      title="Itálico"
                    />
                    <RibbonButton
                      icon={<Underline className="h-3.5 w-3.5" />}
                      disabled={!block || block.type !== "text"}
                      title="Sublinhado"
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
                </div>
              </RibbonGroup>

              <RibbonGroup label="Visualização">
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
              </RibbonGroup>
            </>
          )}

          {/* ─── INSERT TAB ─── */}
          {activeTab === "insert" && (
            <>
              <RibbonGroup label="Texto">
                <RibbonButton
                  icon={<Type className="h-5 w-5" />}
                  label="Texto"
                  variant="large"
                  onClick={() => handleAddBlock("text")}
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
              </RibbonGroup>

              <RibbonGroup label="Interações">
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
              </RibbonGroup>
            </>
          )}

          {/* ─── DESIGN TAB ─── */}
          {activeTab === "design" && (
            <>
              <RibbonGroup label="Tema">
                <div className="flex items-center gap-1">
                  {THEME_PRESETS.slice(0, 8).map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() =>
                        project &&
                        setTheme(project.id, {
                          primaryColor: preset.primary,
                          secondaryColor: preset.secondary,
                        })
                      }
                      className={cn(
                        "w-7 h-7 rounded-full border-2 transition-all hover:scale-110 shadow-sm",
                        project?.theme.primaryColor === preset.primary
                          ? "border-foreground scale-110 ring-2 ring-primary/30"
                          : "border-white"
                      )}
                      style={{ backgroundColor: preset.primary }}
                      title={preset.name}
                    />
                  ))}
                  <div className="flex flex-col items-center ml-1">
                    <div className="flex items-center gap-1">
                      <Palette className="h-3 w-3 text-muted-foreground" />
                      <input
                        type="color"
                        value={project?.theme.primaryColor ?? "#7c3aed"}
                        onChange={(e) =>
                          project &&
                          setTheme(project.id, { primaryColor: e.target.value })
                        }
                        className="w-6 h-6 rounded-md border border-border cursor-pointer"
                        title="Cor personalizada"
                      />
                    </div>
                  </div>
                </div>
              </RibbonGroup>

              <RibbonGroup label="Fundo do Slide">
                <div className="flex items-center gap-1">
                  {SLIDE_BG_PRESETS.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        project &&
                        slide &&
                        updateSlideBackground(project.id, slide.id, color)
                      }
                      className={cn(
                        "w-5 h-5 rounded border transition-all hover:scale-125",
                        slide?.background === color
                          ? "border-primary ring-1 ring-primary/40 scale-110"
                          : "border-border/60"
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  <input
                    type="color"
                    value={slide?.background ?? "#ffffff"}
                    onChange={(e) =>
                      project &&
                      slide &&
                      updateSlideBackground(project.id, slide.id, e.target.value)
                    }
                    className="w-5 h-5 rounded border border-border cursor-pointer ml-1"
                    title="Cor personalizada"
                  />
                </div>
              </RibbonGroup>

              <RibbonGroup label="Tipografia">
                <div className="flex items-center gap-2">
                  <Paintbrush className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    value={
                      project?.theme.fontFamily?.replace(", sans-serif", "") ??
                      "Inter"
                    }
                    onChange={(e) =>
                      project &&
                      setTheme(project.id, {
                        fontFamily: `${e.target.value}, sans-serif`,
                        customFontUrl: null,
                      })
                    }
                    className="h-7 w-28 text-xs rounded-md border border-border bg-background px-2"
                    placeholder="Google Font..."
                  />
                </div>
              </RibbonGroup>
            </>
          )}
        </div>
      </div>

      {/* Share Dialog (Modal Overlay) */}
      {shareDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShareDialogOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
                <Share2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Compartilhar para Revisão
                </h3>
                <p className="text-xs text-muted-foreground">
                  Envie o link para que revisores deixem comentários
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl border border-border/50">
              <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                readOnly
                value={shareLink}
                className="flex-1 bg-transparent text-sm text-foreground outline-none font-mono truncate"
              />
              <Button
                size="sm"
                className="rounded-lg h-8 gap-1.5 flex-shrink-0"
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
                className="rounded-xl"
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

"use client";

import { useState, useRef } from "react";
import { useEditorStore, Block, QuizOption } from "@/store/useEditorStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings2,
  Palette,
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
} from "lucide-react";

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

function BlockIcon({ type }: { type: Block["type"] }) {
  const icons: Record<string, React.ReactNode> = {
    text: <Type className="h-4 w-4 text-violet-500" />,
    image: <Image className="h-4 w-4 text-blue-500" />,
    flashcard: <CreditCard className="h-4 w-4 text-emerald-500" />,
    quiz: <HelpCircle className="h-4 w-4 text-rose-500" />,
    video: <Play className="h-4 w-4 text-orange-500" />,
  };
  return icons[type];
}

function BlockLabel({ type }: { type: Block["type"] }) {
  const labels: Record<string, string> = {
    text: "Texto",
    image: "Imagem",
    flashcard: "Flashcard",
    quiz: "Quiz",
    video: "Vídeo",
  };
  return <span className="font-medium text-sm capitalize">{labels[type]}</span>;
}

export function PropertiesPanel() {
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const getCurrentSlide = useEditorStore((s) => s.getCurrentSlide);
  const getSelectedBlock = useEditorStore((s) => s.getSelectedBlock);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const deleteBlock = useEditorStore((s) => s.deleteBlock);
  const setTheme = useEditorStore((s) => s.setTheme);
  const updateSlideBackground = useEditorStore((s) => s.updateSlideBackground);

  const project = getCurrentProject();
  const slide = getCurrentSlide();
  const block = getSelectedBlock();

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (updates: Partial<Block>) => {
    if (!project || !slide || !block) return;
    updateBlock(project.id, slide.id, block.id, updates);
  };

  const handleDelete = () => {
    if (!project || !slide || !block) return;
    deleteBlock(project.id, slide.id, block.id);
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingFont, setIsUploadingFont] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project || !slide || !block) return;
    if (!file.type.startsWith("image/")) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
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

  // Quiz option helpers
  const handleAddOption = () => {
    if (!block || block.type !== "quiz") return;
    const newOption: QuizOption = {
      id: crypto.randomUUID(),
      text: `Opção ${String.fromCharCode(65 + block.options.length)}`,
      isCorrect: false,
    };
    handleUpdate({ options: [...block.options, newOption] } as Partial<Block>);
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
    <div className="w-[280px] bg-white border-l border-border/50 flex flex-col flex-shrink-0">
      <Tabs defaultValue="properties" className="flex flex-col h-full">
        <TabsList className="mx-3 mt-3 grid grid-cols-2 h-9 rounded-xl">
          <TabsTrigger value="properties" className="gap-1.5 text-xs rounded-lg">
            <Settings2 className="h-3.5 w-3.5" />
            Propriedades
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-1.5 text-xs rounded-lg">
            <Palette className="h-3.5 w-3.5" />
            Smart Colors
          </TabsTrigger>
        </TabsList>

        {/* Properties Tab */}
        <TabsContent value="properties" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-5">
              {block ? (
                <>
                  {/* Block Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50">
                      <BlockIcon type={block.type} />
                      <BlockLabel type={block.type} />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      onClick={handleDelete}
                      title="Excluir bloco"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Position */}
                  <div>
                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Posição
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">X</label>
                        <Input
                          type="number"
                          value={block.x}
                          onChange={(e) =>
                            handleUpdate({ x: Number(e.target.value) })
                          }
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Y</label>
                        <Input
                          type="number"
                          value={block.y}
                          onChange={(e) =>
                            handleUpdate({ y: Number(e.target.value) })
                          }
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div>
                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Dimensões
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">Largura</label>
                        <Input
                          type="number"
                          value={block.width}
                          onChange={(e) =>
                            handleUpdate({ width: Number(e.target.value) })
                          }
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Altura</label>
                        <Input
                          type="number"
                          value={block.height}
                          onChange={(e) =>
                            handleUpdate({ height: Number(e.target.value) })
                          }
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* ─── TEXT BLOCK ─── */}
                  {block.type === "text" && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Tipografia
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground">Tamanho</label>
                          <Input
                            type="number"
                            value={block.fontSize}
                            onChange={(e) =>
                              handleUpdate({ fontSize: Number(e.target.value) } as Partial<Block>)
                            }
                            className="h-8 text-xs rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground">Peso</label>
                          <select
                            value={block.fontWeight}
                            onChange={(e) =>
                              handleUpdate({ fontWeight: e.target.value } as Partial<Block>)
                            }
                            className="w-full h-8 text-xs rounded-lg border border-border bg-background px-2"
                          >
                            <option value="normal">Normal</option>
                            <option value="bold">Negrito</option>
                            <option value="lighter">Leve</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground">Cor</label>
                          <div className="flex gap-1.5">
                            <input
                              type="color"
                              value={block.color}
                              onChange={(e) =>
                                handleUpdate({ color: e.target.value } as Partial<Block>)
                              }
                              className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                            />
                            <Input
                              value={block.color}
                              onChange={(e) =>
                                handleUpdate({ color: e.target.value } as Partial<Block>)
                              }
                              className="h-8 text-xs rounded-lg"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground">Alinhamento</label>
                          <select
                            value={block.textAlign}
                            onChange={(e) =>
                              handleUpdate({
                                textAlign: e.target.value as "left" | "center" | "right",
                              } as Partial<Block>)
                            }
                            className="w-full h-8 text-xs rounded-lg border border-border bg-background px-2"
                          >
                            <option value="left">Esquerda</option>
                            <option value="center">Centro</option>
                            <option value="right">Direita</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── IMAGE BLOCK ─── */}
                  {block.type === "image" && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Imagem
                      </h4>
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
                        className="w-full gap-2 rounded-xl text-xs"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isUploadingImage}
                      >
                        {isUploadingImage ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        {isUploadingImage ? "Enviando..." : block.src ? "Trocar Imagem" : "Upload de Imagem"}
                      </Button>
                      {block.src && (
                        <div className="rounded-xl overflow-hidden border border-border">
                          <img
                            src={block.src}
                            alt={block.alt}
                            className="w-full h-24 object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <label className="text-[10px] text-muted-foreground">Texto Alternativo</label>
                        <Input
                          value={block.alt}
                          onChange={(e) =>
                            handleUpdate({ alt: e.target.value } as Partial<Block>)
                          }
                          className="h-8 text-xs rounded-lg"
                          placeholder="Descreva a imagem..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Ajuste</label>
                        <select
                          value={block.objectFit}
                          onChange={(e) =>
                            handleUpdate({
                              objectFit: e.target.value as "cover" | "contain" | "fill",
                            } as Partial<Block>)
                          }
                          className="w-full h-8 text-xs rounded-lg border border-border bg-background px-2"
                        >
                          <option value="cover">Cobrir</option>
                          <option value="contain">Conter</option>
                          <option value="fill">Preencher</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* ─── FLASHCARD BLOCK ─── */}
                  {block.type === "flashcard" && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Flashcard
                      </h4>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Frente</label>
                        <textarea
                          value={block.frontContent}
                          onChange={(e) =>
                            handleUpdate({ frontContent: e.target.value } as Partial<Block>)
                          }
                          className="w-full h-16 text-xs rounded-lg border border-border bg-background p-2 resize-none"
                          placeholder="Conteúdo da frente..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Verso</label>
                        <textarea
                          value={block.backContent}
                          onChange={(e) =>
                            handleUpdate({ backContent: e.target.value } as Partial<Block>)
                          }
                          className="w-full h-16 text-xs rounded-lg border border-border bg-background p-2 resize-none"
                          placeholder="Conteúdo do verso..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground">Cor Frente</label>
                          <div className="flex gap-1.5">
                            <input
                              type="color"
                              value={block.frontBg}
                              onChange={(e) =>
                                handleUpdate({ frontBg: e.target.value } as Partial<Block>)
                              }
                              className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                            />
                            <Input
                              value={block.frontBg}
                              onChange={(e) =>
                                handleUpdate({ frontBg: e.target.value } as Partial<Block>)
                              }
                              className="h-8 text-xs rounded-lg"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground">Cor Verso</label>
                          <div className="flex gap-1.5">
                            <input
                              type="color"
                              value={block.backBg}
                              onChange={(e) =>
                                handleUpdate({ backBg: e.target.value } as Partial<Block>)
                              }
                              className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                            />
                            <Input
                              value={block.backBg}
                              onChange={(e) =>
                                handleUpdate({ backBg: e.target.value } as Partial<Block>)
                              }
                              className="h-8 text-xs rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── QUIZ BLOCK ─── */}
                  {block.type === "quiz" && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Quiz
                      </h4>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Pergunta</label>
                        <textarea
                          value={block.question}
                          onChange={(e) =>
                            handleUpdate({ question: e.target.value } as Partial<Block>)
                          }
                          className="w-full h-16 text-xs rounded-lg border border-border bg-background p-2 resize-none"
                          placeholder="Digite a pergunta..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] text-muted-foreground">Opções</label>
                        {block.options.map((opt, idx) => (
                          <div key={opt.id} className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleSetCorrect(opt.id)}
                              className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                opt.isCorrect
                                  ? "border-emerald-500 bg-emerald-500"
                                  : "border-muted-foreground/30 hover:border-emerald-400"
                              }`}
                              title={opt.isCorrect ? "Correta" : "Marcar como correta"}
                            >
                              {opt.isCorrect && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </button>
                            <Input
                              value={opt.text}
                              onChange={(e) =>
                                handleUpdateOption(opt.id, {
                                  text: e.target.value,
                                })
                              }
                              className="h-7 text-xs rounded-lg flex-1"
                              placeholder={`Opção ${String.fromCharCode(65 + idx)}`}
                            />
                            {block.options.length > 2 && (
                              <button
                                onClick={() => handleRemoveOption(opt.id)}
                                className="flex-shrink-0 p-1 rounded-md hover:bg-destructive/10 transition-colors"
                                title="Remover opção"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </button>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1.5 rounded-lg text-[10px] h-7 border-dashed"
                          onClick={handleAddOption}
                        >
                          <Plus className="h-3 w-3" />
                          Adicionar Opção
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <label className="text-[10px] text-muted-foreground">Feedback</label>
                        <div>
                          <label className="text-[10px] text-emerald-600">✓ Correto</label>
                          <Input
                            value={block.feedback.correct}
                            onChange={(e) =>
                              handleUpdate({
                                feedback: { ...block.feedback, correct: e.target.value },
                              } as Partial<Block>)
                            }
                            className="h-7 text-xs rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-destructive">✗ Incorreto</label>
                          <Input
                            value={block.feedback.incorrect}
                            onChange={(e) =>
                              handleUpdate({
                                feedback: { ...block.feedback, incorrect: e.target.value },
                              } as Partial<Block>)
                            }
                            className="h-7 text-xs rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── VIDEO BLOCK ─── */}
                  {block.type === "video" && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Vídeo
                      </h4>
                      <div>
                        <label className="text-[10px] text-muted-foreground">URL (YouTube, Vimeo ou MP4)</label>
                        <Input
                          value={block.url}
                          onChange={(e) =>
                            handleUpdate({ url: e.target.value } as Partial<Block>)
                          }
                          className="h-8 text-xs rounded-lg"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Interações
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] rounded-lg gap-1 px-2"
                            onClick={() => {
                              if (block.type !== "video") return;
                              const newInteraction = {
                                id: crypto.randomUUID(),
                                timestampSeconds: 5,
                                question: "Pergunta no vídeo",
                                options: [
                                  { text: "Opção A", isCorrect: true },
                                  { text: "Opção B", isCorrect: false },
                                ],
                                answered: false,
                              };
                              handleUpdate({
                                interactions: [...block.interactions, newInteraction],
                              } as Partial<Block>);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                            Adicionar
                          </Button>
                        </div>

                        {block.interactions.map((interaction, iIdx) => (
                          <div
                            key={interaction.id}
                            className="border border-border/50 rounded-xl p-2.5 space-y-2 bg-muted/20"
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-orange-500 flex-shrink-0" />
                              <Input
                                type="number"
                                value={interaction.timestampSeconds}
                                onChange={(e) => {
                                  if (block.type !== "video") return;
                                  const updated = block.interactions.map((i) =>
                                    i.id === interaction.id
                                      ? { ...i, timestampSeconds: Number(e.target.value) }
                                      : i
                                  );
                                  handleUpdate({ interactions: updated } as Partial<Block>);
                                }}
                                className="h-6 text-[10px] rounded-md w-16"
                              />
                              <span className="text-[10px] text-muted-foreground">seg</span>
                              <button
                                onClick={() => {
                                  if (block.type !== "video") return;
                                  handleUpdate({
                                    interactions: block.interactions.filter(
                                      (i) => i.id !== interaction.id
                                    ),
                                  } as Partial<Block>);
                                }}
                                className="ml-auto p-1 rounded-md hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </button>
                            </div>
                            <Input
                              value={interaction.question}
                              onChange={(e) => {
                                if (block.type !== "video") return;
                                const updated = block.interactions.map((i) =>
                                  i.id === interaction.id
                                    ? { ...i, question: e.target.value }
                                    : i
                                );
                                handleUpdate({ interactions: updated } as Partial<Block>);
                              }}
                              className="h-6 text-[10px] rounded-md"
                              placeholder="Pergunta..."
                            />
                            {interaction.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    if (block.type !== "video") return;
                                    const updated = block.interactions.map((i) =>
                                      i.id === interaction.id
                                        ? {
                                            ...i,
                                            options: i.options.map((o, idx) => ({
                                              ...o,
                                              isCorrect: idx === oIdx,
                                            })),
                                          }
                                        : i
                                    );
                                    handleUpdate({ interactions: updated } as Partial<Block>);
                                  }}
                                  className={`flex-shrink-0 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                    opt.isCorrect
                                      ? "border-emerald-500 bg-emerald-500"
                                      : "border-muted-foreground/30"
                                  }`}
                                >
                                  {opt.isCorrect && <Check className="h-2.5 w-2.5 text-white" />}
                                </button>
                                <Input
                                  value={opt.text}
                                  onChange={(e) => {
                                    if (block.type !== "video") return;
                                    const updated = block.interactions.map((i) =>
                                      i.id === interaction.id
                                        ? {
                                            ...i,
                                            options: i.options.map((o, idx) =>
                                              idx === oIdx ? { ...o, text: e.target.value } : o
                                            ),
                                          }
                                        : i
                                    );
                                    handleUpdate({ interactions: updated } as Partial<Block>);
                                  }}
                                  className="h-5 text-[10px] rounded-md flex-1"
                                />
                              </div>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full h-5 text-[9px] gap-1"
                              onClick={() => {
                                if (block.type !== "video") return;
                                const updated = block.interactions.map((i) =>
                                  i.id === interaction.id
                                    ? {
                                        ...i,
                                        options: [
                                          ...i.options,
                                          { text: `Opção ${String.fromCharCode(65 + i.options.length)}`, isCorrect: false },
                                        ],
                                      }
                                    : i
                                );
                                handleUpdate({ interactions: updated } as Partial<Block>);
                              }}
                            >
                              <Plus className="h-2.5 w-2.5" /> Opção
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Slide Background */}
                  <div>
                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Fundo do Slide
                    </h4>
                    <div className="flex items-center gap-2">
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
                        className="w-8 h-8 rounded-lg border border-border cursor-pointer"
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
                        className="h-8 text-xs rounded-lg"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* No block selected */
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Layers className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground/50">
                    Nenhum bloco selecionado
                  </p>
                  <p className="text-xs text-muted-foreground/30 mt-1">
                    Clique em um bloco no canvas
                    <br />
                    para editar suas propriedades
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Smart Colors Tab */}
        <TabsContent value="colors" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-5">
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Temas Predefinidos
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all hover:shadow-md ${
                      project?.theme.primaryColor === preset.primary
                        ? "border-primary shadow-md"
                        : "border-transparent bg-muted/30 hover:border-border"
                    }`}
                    onClick={() =>
                      project &&
                      setTheme(project.id, {
                        primaryColor: preset.primary,
                        secondaryColor: preset.secondary,
                      })
                    }
                  >
                    <div
                      className="w-5 h-5 rounded-full shadow-inner flex-shrink-0"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <span className="text-xs font-medium truncate">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>

              <Separator />

              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Cor Customizada
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-muted-foreground">Primária</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={project?.theme.primaryColor ?? "#7c3aed"}
                      onChange={(e) =>
                        project &&
                        setTheme(project.id, { primaryColor: e.target.value })
                      }
                      className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                    />
                    <Input
                      value={project?.theme.primaryColor ?? "#7c3aed"}
                      onChange={(e) =>
                        project &&
                        setTheme(project.id, { primaryColor: e.target.value })
                      }
                      className="h-8 text-xs rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Secundária</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={project?.theme.secondaryColor ?? "#4f46e5"}
                      onChange={(e) =>
                        project &&
                        setTheme(project.id, {
                          secondaryColor: e.target.value,
                        })
                      }
                      className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                    />
                    <Input
                      value={project?.theme.secondaryColor ?? "#4f46e5"}
                      onChange={(e) =>
                        project &&
                        setTheme(project.id, {
                          secondaryColor: e.target.value,
                        })
                      }
                      className="h-8 text-xs rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Typography */}
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Tipografia Global
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-muted-foreground">Google Font</label>
                  <Input
                    value={project?.theme.fontFamily?.replace(', sans-serif', '') ?? 'Inter'}
                    onChange={(e) => {
                      if (!project) return;
                      setTheme(project.id, {
                        fontFamily: `${e.target.value}, sans-serif`,
                        customFontUrl: null,
                      });
                    }}
                    className="h-8 text-xs rounded-lg"
                    placeholder="Ex: Inter, Roboto, Outfit"
                  />
                </div>
                <div className="text-[10px] text-muted-foreground text-center">ou</div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Fonte Customizada (.ttf / .woff2)</label>
                  <input
                    ref={fontInputRef}
                    type="file"
                    accept=".ttf,.woff2"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !project) return;
                      setIsUploadingFont(true);
                      try {
                        const formData = new FormData();
                        formData.append("file", file);
                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                        const data = await res.json();
                        if (data.url) {
                          const fontName = file.name.replace(/\.(ttf|woff2)$/i, '');
                          setTheme(project.id, {
                            fontFamily: `${fontName}, sans-serif`,
                            customFontUrl: data.url,
                          });
                        }
                      } catch (err) {
                        console.error("Font upload failed:", err);
                      } finally {
                        setIsUploadingFont(false);
                      }
                    }}
                  />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 rounded-xl text-xs"
                      onClick={() => fontInputRef.current?.click()}
                      disabled={isUploadingFont}
                    >
                      {isUploadingFont ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      {isUploadingFont ? 'Enviando...' : project?.theme.customFontUrl ? 'Trocar Fonte' : 'Upload Fonte'}
                    </Button>
                  {project?.theme.customFontUrl && (
                    <p className="text-[10px] text-emerald-600 mt-1">
                      ✓ Fonte customizada carregada: {project.theme.fontFamily.replace(', sans-serif', '')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

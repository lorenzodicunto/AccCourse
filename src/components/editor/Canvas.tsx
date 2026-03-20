"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useEditorStore, Block } from "@/store/useEditorStore";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  Type,
  Image,
  CreditCard,
  HelpCircle,
  MousePointerClick,
  Play,
} from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";
import { DraggableBlock } from "./DraggableBlock";

export function Canvas() {
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const getCurrentSlide = useEditorStore((s) => s.getCurrentSlide);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const setSelectedBlock = useEditorStore((s) => s.setSelectedBlock);
  const addBlock = useEditorStore((s) => s.addBlock);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const previewMode = useEditorStore((s) => s.previewMode);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const project = getCurrentProject();
  const slide = getCurrentSlide();

  // Dynamic font injection
  useEffect(() => {
    if (!project) return;
    const styleId = 'acccourse-custom-font';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    const fontName = project.theme.fontFamily.replace(', sans-serif', '').trim();
    if (project.theme.customFontUrl) {
      const format = project.theme.customFontUrl.includes('woff2') ? 'woff2' : 'truetype';
      styleEl.textContent = `@font-face { font-family: '${fontName}'; src: url('${project.theme.customFontUrl}') format('${format}'); font-weight: normal; font-style: normal; }`;
    } else {
      const googleFontName = fontName.replace(/\s+/g, '+');
      styleEl.textContent = `@import url('https://fonts.googleapis.com/css2?family=${googleFontName}:wght@300;400;500;600;700&display=swap');`;
    }
    return () => { styleEl.textContent = ''; };
  }, [project?.theme.fontFamily, project?.theme.customFontUrl]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    })
  );

  const handleAddBlock = (type: Block["type"]) => {
    if (!project || !slide) return;

    const baseBlock = {
      id: crypto.randomUUID(),
      x: 80 + Math.random() * 200,
      y: 60 + Math.random() * 100,
    };

    let block: Block;
    switch (type) {
      case "text":
        block = {
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
        block = {
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
        block = {
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
        block = {
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
        block = {
          ...baseBlock,
          type: "video",
          width: 480,
          height: 270,
          url: "",
          interactions: [],
        };
        break;
    }

    addBlock(project.id, slide.id, block);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedBlock(null);
    }
  };

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setIsDragging(true);
      setSelectedBlock(event.active.id as string);
    },
    [setSelectedBlock]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setIsDragging(false);
      const { active, delta } = event;
      if (!project || !slide || !canvasRef.current) return;

      const block = slide.blocks.find((b) => b.id === active.id);
      if (!block) return;

      // Get canvas dimensions to convert delta pixels to 960x540 coordinates
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = 960 / rect.width;
      const scaleY = 540 / rect.height;

      const newX = Math.max(0, Math.min(960 - block.width, block.x + delta.x * scaleX));
      const newY = Math.max(0, Math.min(540 - block.height, block.y + delta.y * scaleY));

      updateBlock(project.id, slide.id, block.id, {
        x: Math.round(newX),
        y: Math.round(newY),
      });
    },
    [project, slide, updateBlock]
  );

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 overflow-hidden">
      {/* Block Toolbar */}
      <div className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white/60 backdrop-blur-sm border-b border-border/30">
        <span className="text-xs text-muted-foreground mr-2 font-medium">
          Inserir:
        </span>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl text-xs h-8 border-dashed"
          onClick={() => handleAddBlock("text")}
        >
          <Type className="h-3.5 w-3.5" />
          Texto
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl text-xs h-8 border-dashed"
          onClick={() => handleAddBlock("image")}
        >
          <Image className="h-3.5 w-3.5" />
          Imagem
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl text-xs h-8 border-dashed"
          onClick={() => handleAddBlock("flashcard")}
        >
          <CreditCard className="h-3.5 w-3.5" />
          Flashcard
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl text-xs h-8 border-dashed"
          onClick={() => handleAddBlock("quiz")}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Quiz
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl text-xs h-8 border-dashed"
          onClick={() => handleAddBlock("video")}
        >
          <Play className="h-3.5 w-3.5" />
          Vídeo
        </Button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div
          ref={canvasRef}
          className={`relative bg-white rounded-2xl shadow-2xl shadow-black/8 border border-border/40 transition-all duration-500 ${
            previewMode === "mobile" ? "w-[375px]" : "w-full max-w-[960px]"
          }`}
          style={{ aspectRatio: "16 / 9" }}
          onClick={handleCanvasClick}
        >
          {/* Slide background */}
          {slide && (
            <div
              className="absolute inset-0 rounded-2xl z-0 pointer-events-none"
              style={{ backgroundColor: slide.background }}
            />
          )}

          {/* Blocks with DnD */}
          <DndContext
            sensors={sensors}
            modifiers={[restrictToParentElement]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {slide?.blocks.map((block) => (
              <DraggableBlock
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                canvasWidth={canvasRef.current?.getBoundingClientRect().width ?? 960}
                canvasHeight={canvasRef.current?.getBoundingClientRect().height ?? 540}
                onSelect={() => setSelectedBlock(block.id)}
                isDraggingAny={isDragging}
              />
            ))}
          </DndContext>

          {/* Empty state - premium placeholder */}
          {slide && slide.blocks.length === 0 && (
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
              <div className="text-center max-w-[280px]">
                <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-100 flex items-center justify-center">
                  <MousePointerClick className="h-7 w-7 text-primary/40" />
                </div>
                <p className="text-sm text-muted-foreground/60 font-semibold mb-1">
                  Slide vazio
                </p>
                <p className="text-xs text-muted-foreground/40 leading-relaxed mb-4">
                  Use a barra acima para inserir blocos e começar a construir seu conteúdo
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {[
                    { icon: "T", label: "Texto" },
                    { icon: "🖼", label: "Imagem" },
                    { icon: "🃏", label: "Flashcard" },
                    { icon: "❓", label: "Quiz" },
                  ].map((item) => (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/40 text-[10px] text-muted-foreground/50 font-medium"
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
